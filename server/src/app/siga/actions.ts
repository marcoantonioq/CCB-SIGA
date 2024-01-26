import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import crypto from "crypto";
import * as cheerio from "cheerio";
import * as app from "../../config";

import { Igreja, Tarefa, Fluxo } from "./AppInterfaces";

const ERROR_MESSAGE_PREFIX = "Erro ao processar requisição";

interface RequestOptions extends AxiosRequestConfig {
  url: string;
  method?: "GET" | "POST";
  data?: any;
  retry?: number;
}
type Despesas = {
  data: string;
  tipo: string;
  nf: string;
  fornecedor: string;
  despesa: string;
  vlr: string;
};

const defaultHeaders = {
  Host: "siga.congregacao.org.br",
  Cookie: app.AppConfig.cookie,
  __antixsrftoken: app.AppConfig.token,
  "Sec-Ch-Ua-Mobile": "?0",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.70 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
  "Sec-Ch-Ua": '"Not=A?Brand";v="99", "Chromium";v="118"',
  "Sec-Ch-Ua-Platform": "Linux",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
};

axios.defaults.timeout = 30000;
async function sendRequest({
  url,
  method = "GET",
  data,
  headers,
  retry = 10,
  ...rest
}: RequestOptions): Promise<AxiosResponse> {
  const axiosConfig: AxiosRequestConfig = {
    method,
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  };

  let attempt = 1;

  while (attempt <= retry) {
    try {
      const response =
        method === "POST"
          ? await axios.post(url, data, axiosConfig)
          : await axios.get(url, axiosConfig);

      process.stdout.write(".");
      return response; // Adicionando a instrução de retorno
    } catch (error) {
      process.stdout.write("_");

      if (attempt === retry) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;

          if (axiosError.response) {
            const { status, statusText, data: html } = axiosError.response;
            const $ = cheerio.load(html as string);
            throw `${ERROR_MESSAGE_PREFIX} ${url} - Código: ${status} ${statusText}, Data: ${$.text()}`;
          } else {
            throw `${ERROR_MESSAGE_PREFIX} ${url}: ${axiosError.message}`;
          }
        } else {
          throw `${ERROR_MESSAGE_PREFIX} ${url}: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`;
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
    attempt++;
  }
  process.stdout.write("x");
  throw `${ERROR_MESSAGE_PREFIX} ${url}: Falha ao realizar a solicitação após ${attempt} tentativas`;
}

export function generateRandomBoundary(): string {
  const boundaryLength = 16;
  const randomBytes = crypto.randomBytes(boundaryLength);
  const boundary = `----WebKitFormBoundary${randomBytes.toString("hex")}`;

  return boundary;
}

export async function alterarIGreja(igreja: Igreja): Promise<void> {
  const url = "https://siga.congregacao.org.br/page.aspx";
  const data = new FormData();
  if (!igreja || !igreja.id) return;
  data.append("f_selecionarlocalidade", "S");
  data.append("f_codlocalidade", String(igreja.id));

  try {
    const { status } = await sendRequest({
      url,
      method: "POST",
      data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    if (status === 200) {
      await sendRequest({
        url: "https://siga.congregacao.org.br/SIS/SIS99908.aspx?f_inicio=S",
      });
      await sendRequest({
        url: "https://siga.congregacao.org.br/SIS/SIS99908.aspx?f_inicio=S&__initPage__=S",
      });
      await sendRequest({
        url,
      });
    }
  } catch (erro) {
    throw await handleErro(erro as AxiosError);
  }
}

export async function getOfertas(data1: Date, data2: Date): Promise<Fluxo[]> {
  const url = "https://siga.congregacao.org.br/TES/TES00401.asmx/Selecionar";
  const data = {
    data1: new Date(data1).toISOString().split("T")[0],
    data2: new Date(data2).toISOString().split("T")[0],
    config: {
      sEcho: 1,
      iDisplayStart: 0,
      iDisplayLength: 100,
      sSearch: "",
      iSortCol: 0,
      sSortDir: "asc",
    },
  };

  try {
    const result = await sendRequest({ url, method: "POST", data });
    const ofertas = result.data.d.aaData.map((e: any) => {
      const [, m, y] = e.sData.split("/");
      return <Fluxo>{
        id: String(e.Codigo),
        fluxo: "Entrada",
        data: new Date(String(e.sData).split("/").reverse().join("/")),
        ref: `${m}/${y}`,
        competencia: String(e.CodigoCompetencia),
        categoria: String(e.NomeTipoCulto),
        valor: Number(e.ValorTotal),
        updated: new Date(),
        created: new Date(),
      };
    });
    return ofertas;
  } catch (erro) {
    throw await handleErro(erro as AxiosError);
  }
}

export async function getIgrejas() {
  const url = "https://siga.congregacao.org.br/SIS/SIS99908.aspx";
  const igrejas: Igreja[] = [];

  console.log("Acessando igrejas...");
  const { data: html } = await sendRequest({ url });
  const $ = cheerio.load(html);
  if (html.match(/Informe o ID do Usuário e a Senha!/gi))
    throw "Você não está logado!\nAcesse o portal administrativo para enviar o cookie de autenticação...";

  $("ul#dropdown_localidades li").each((_index, li) => {
    const id = $(li).attr("id") || "";
    const nome = $(li).text().trim();
    igrejas.push({ id, nome, membros: 0 });
  });
  return igrejas;
}

export async function getTarefas() {
  const url =
    "https://siga.congregacao.org.br/SIS/SIS99908.aspx?__initPage__=S";
  try {
    const { data: html } = await sendRequest({ url });
    const $ = cheerio.load(html);
    const dados: Tarefa[] = [];

    const linhas = $("table").find("tbody tr");

    const getText = (el: cheerio.Element) => {
      return $(el)
        .text()
        .replace(/( +|\n)/gi, " ")
        .trim();
    };
    const regex = /^(.*?)(Previsto|Atrasado).*/;
    for (let i = 0; i < linhas.length; i += 2) {
      const linhaAtual = getText(linhas[i]);
      const proximaLinha = getText(linhas[i + 1]) || "";
      const linha = `${linhaAtual} ${proximaLinha}`;
      const match = linha.match(regex);
      if (match) {
        const [, description, status] = match;
        dados.push({
          id: 0,
          description,
          status,
          igrejaId: "",
        });
      } else {
        console.log("A linha não corresponde ao padrão esperado:", linha);
      }
    }
    return dados;
  } catch (erro) {
    throw await handleErro(erro as AxiosError);
  }
}

export async function setCopetencia(competencia: string): Promise<boolean> {
  const url = "https://siga.congregacao.org.br/SIS/SIS99908.aspx";
  const boundary = generateRandomBoundary();

  const data = new FormData();

  data.append("__initPage__", "S");
  data.append("f_competencia", competencia);
  data.append("f-gravar-competencia", "S");
  data.append("__jqSubmit__", "S");

  const { status } = await sendRequest({
    url,
    method: "POST",
    data,
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
  });
  if (status === 200) {
    await sendRequest({ url });
    return true;
  }
  throw "Erro ao alterar a competência!";
}

export async function isLogged(): Promise<boolean> {
  try {
    const url = "https://siga.congregacao.org.br/TES/TES00401.asmx/Selecionar";
    const data = {
      data1: new Date().toISOString().split("T")[0],
      data2: new Date().toISOString().split("T")[0],
      config: {
        sEcho: 1,
        iDisplayStart: 0,
        iDisplayLength: 100,
        sSearch: "",
        iSortCol: 0,
        sSortDir: "asc",
      },
    };
    await sendRequest({ url, method: "POST", data, retry: 2 });
    return true;
  } catch (error) {
    return false;
  }
}

export async function getFechamento(ref: string) {
  const payload = {
    despesas: [] as Despesas[],
  };
  try {
    if (ref) {
      const { data: html } = await sendRequest({
        url: `https://siga.congregacao.org.br/TES/TES01406.aspx?codigo=${ref}`,
      });

      const $ = cheerio.load(html);
      const table = $("table").eq(9);
      if (table.length > 0) {
        const trs = table.find("tbody tr");
        trs.each((_, row) => {
          const tds = $(row).find("td");
          const values: string[] = [];
          tds.each((_, td) => {
            values.push($(td).text().trim());
          });
          const [data, tipo, nf, fornecedor, despesa, vlr] = values;
          payload.despesas.push({
            data,
            tipo,
            nf,
            fornecedor,
            despesa,
            vlr,
          });
        });
      } else {
        console.log("Tabela de despesa não encontrada!");
      }
    } else {
      throw `Referencia para fechamento inválido: ${ref}`;
    }
  } catch (error) {
    console.log("Falha ao obter dados de fechamento | ", error);
  }
  return payload;
}

export async function getListaFechamentos(
  data1: Date,
  data2: Date
): Promise<Fluxo[]> {
  const fluxo: Fluxo[] = [];
  const url =
    "https://siga.congregacao.org.br/TES/TES01401.aspx?f_inicio=S&__initPage__=S";

  try {
    const { data: html } = await sendRequest({ url });
    const $ = cheerio.load(html);
    const linhas = $("table tbody tr");

    const getText = (el: cheerio.Element, match: string) => {
      return $(el)
        .find(match)
        .text()
        .replace(/( +|\n)/gi, " ")
        .trim();
    };

    for (const linha of linhas) {
      let referencia = "";
      const dados = {
        id: getText(linha, "td:nth-child(1)"),
        ref: getText(linha, "td:nth-child(2)"),
        description: getText(linha, "td:nth-child(3)"),
        status: getText(linha, "td:nth-child(4)"),
        despesas: [] as Despesas[],
      };
      $(linha)
        .find("ul.dropdown-menu li a")
        .each((_index, element) => {
          if (!referencia) {
            const dataCodigo = $(element).data("codigo") as string;
            if (dataCodigo) {
              referencia = dataCodigo;
            }
          }
        });

      if (!referencia) continue;

      const [m, y] = dados.ref.split("/");
      const dataRef = new Date(`${y}-${m}-01`);
      if (
        !isNaN(dataRef.getTime()) &&
        !isNaN(new Date(data1).getTime()) &&
        !isNaN(new Date(data2).getTime()) &&
        (dataRef < data1 || dataRef > data2)
      ) {
        continue;
      }

      try {
        const fechamento = await getFechamento(referencia);
        for (const despesa of fechamento.despesas) {
          try {
            const { nf, fornecedor, data, vlr, tipo } = despesa;
            const payload: Fluxo = {
              id: `${referencia}-${nf}`,
              fluxo: "Saída",
              categoria: `${fornecedor}`,
              igrejaId: "",
              data: new Date(String(data).split("/").reverse().join("-")),
              ref: dados.ref,
              competencia: "",
              valor: parseFloat(vlr.replace(",", ".")),
              detalhes: `${tipo}-${nf}`,
              created: new Date(),
              updated: new Date(),
            };
            fluxo.push(payload);
          } catch (error) {
            console.log("Erro ao criar objeto de saída: ", error, despesa);
          }
        }
      } catch (error) {
        console.log("Erro ao obter despesas de fechamento: ", error);
      }
    }
  } catch (erro) {
    throw await handleErro(erro as AxiosError);
  }

  return fluxo;
}

export async function handleErro(erro: AxiosError): Promise<Error> {
  if (erro.response) {
    console.error("Erro na resposta da requisição:", erro.response.status);
    return new Error(`Erro na resposta: ${erro.response.data}`);
  } else if (erro.request) {
    return new Error(`Erro na requisição (${erro.request}): ${erro.request}`);
  } else {
    return erro;
  }
}
