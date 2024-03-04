import axios from "axios";
import * as xlsx from "xlsx";
import { AppConfig } from "..";
import { alterarParaIgreja } from "./igreja_alterar";
import { Fluxo } from "@prisma/client";

interface Despesa {
  Ref: string;
  Localidade: string;
  Data: Date;
  Tipo: string;
  NumeroDoc: string;
  Despesa: string;
  Fornecedor: string;
  Valor: string;
  Multa: string;
  Juros: string;
  Desconto: string;
  Total: string;
}

function convertExcelDateToJSDate(excelDate: number) {
  return new Date((excelDate - (25567 + 2)) * 86400 * 1000);
}

export async function reportDespesas(
  data1: Date,
  data2: Date
): Promise<Fluxo[]> {
  await alterarParaIgreja({ cod: "345", nome: "", membros: 0 });
  const despesas: Despesa[] = [];

  const headers = {
    Cookie: AppConfig.cookie,
    __antixsrftoken: AppConfig.token,
    "Content-Type": "application/octet-stream",
  };

  const requestData = {
    f_data1:
      data1?.toISOString().split("T")[0]?.split("-").reverse().join("/") || "",
    f_data2:
      data2?.toISOString().split("T")[0]?.split("-").reverse().join("/") || "",
    f_estabelecimento: "345",
    f_centrocusto: "",
    f_fornecedor: "",
    f_formato: "TES00902.aspx",
    f_saidapara: "Excel",
    f_agrupar: "CentrodeCustoSetor",
    __initPage__: "S",
  };

  try {
    const { data: xls } = await axios.get(
      "https://siga.congregacao.org.br/TES/TES00902.aspx",
      {
        headers,
        params: requestData,
        responseType: "arraybuffer",
      }
    );

    const workbook = xlsx.read(xls, { type: "array" });
    const sheetName = workbook.SheetNames[0] || "";
    const worksheet = workbook.Sheets[sheetName];

    if (worksheet) {
      const jsonData = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      let Localidade: string, Ref: string;

      jsonData.forEach((row) => {
        if (Array.isArray(row) && row.length) {
          if (/^Mês \d\d\/\d+/.test(`${row[0]}`)) {
            const [, mm, yyyy] = row[0].match(/(\d{2})\/(\d{4})/);
            Ref = `${mm}/${yyyy}`;
          } else if (/^(BR \d+-\d+|^ADM|^PIA)/.test(`${row[0]}`)) {
            console.log("Localidade: ", row[0]);
            Localidade = row[0];
          } else if (Number.isInteger(row[0]) && /\S+/.test(`${row[3]}`)) {
            const despesa: Despesa = {
              Ref,
              Localidade,
              Data: convertExcelDateToJSDate(row[0]),
              Tipo: row[3],
              NumeroDoc: row[4],
              Despesa: row[6],
              Fornecedor: row[8],
              Valor: row[15],
              Multa: row[21],
              Juros: row[24],
              Desconto: row[27],
              Total: row[30],
            };
            despesas.push(despesa);
          }
        }
      });
    }
  } catch (error) {
    const msg = "Erro na requisição ao siga!";
    console.error(msg);
    throw msg;
  }

  // console.log("Despesas:", despesas[0]);

  return despesas.map((e) => {
    return <Fluxo>{
      igreja: e.Localidade,
      fluxo: "Saída",
      categoria: e.Despesa,
      data: e.Data,
      valor: Number(e.Total),
      detalhes: `${e.Fornecedor}, NF: ${e.NumeroDoc}`,
      ref: e.Ref,
      created: new Date(),
      updated: new Date(),
    };
  });
}
