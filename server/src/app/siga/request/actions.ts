import * as cheerio from "cheerio";
import { AxiosError } from "axios";

import { Igreja, Tarefa, Fluxo } from "../AppInterfaces";
import { generateRandomBoundary, sendRequest } from "./axios";

type Despesas = {
  data: string;
  tipo: string;
  nf: string;
  fornecedor: string;
  despesa: string;
  vlr: string;
};

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

export async function getRelaDespesa(
  data1: Date,
  data2: Date
): Promise<Fluxo[]> {
  const url = "https://siga.congregacao.org.br/TES/TES00902.aspx";
  const data = {
    f_data1: new Date(data1).toISOString().split("T")[0],
    f_data2: new Date(data2).toISOString().split("T")[0],
    f_estabelecimento: "345",
    f_centrocusto: "",
    f_fornecedor: "",
    f_formato: "TES00902.aspx",
    f_saidapara: "Excel",
    f_agrupar: "CentrodeCustoSetor",
  };

  await sendRequest({
    url: "https://siga.congregacao.org.br/TES/TES00701.aspx?f_inicio=S&__initPage__=S",
  });

  await sendRequest({
    url: "https://siga.congregacao.org.br/UTIL/UtilWS.asmx/ValidaPeriodo",
    method: "POST",
    data: {
      f_data1: "01/01/2024",
      f_data2: "31/01/2024",
      l_data1: "Data Inicial",
      l_data2: "Data Final",
    },
  });

  const { data: html } = await sendRequest({
    url,
    method: "POST",
    data,
    retry: 2,
  });
  console.log("Relatório::: ", html);
  // const $ = cheerio.load(html);

  return [];
}

export async function handleErro(erro: AxiosError): Promise<Error> {
  if (erro.response) {
    console.error("Erro na resposta da requisição:", erro.response.status);
    return new Error(`Erro na resposta: ${erro.response.data}`);
  } else if (erro.request) {
    return new Error(`Erro na requisição: (${erro.status})`);
  } else {
    return erro;
  }
}
