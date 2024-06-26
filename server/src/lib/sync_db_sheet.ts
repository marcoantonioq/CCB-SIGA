import GoogleSheetsService from "./google_sheet";
import { database } from "../infra/prisma";
import { App } from "../app";

/**
 * Google Sheet
 */

let sheet: GoogleSheetsService | null = null;
const DEFAULTS_IGREJAS = [
  { nome: "GOIÁS - POVOADO DE AREIAS", membros: 37 },
  { nome: "POVOADO DE MIRANDÓPOLIS", membros: 18 },
  { nome: "MOSSÂMEDES - VILA DAMIANA DA CUNHA", membros: 55 },
  { nome: "GOIÁS - POVOADO COLÔNIA DE UVÁ", membros: 15 },
  { nome: "GOIÁS - CENTRO", membros: 96 },
  { nome: "GOIÁS - VILA LIONS", membros: 28 },
  { nome: "VILA LEONOR", membros: 214 },
  { nome: "FAZENDA MATO DENTRO", membros: 20 },
  { nome: "FAZENDA SOBRADINHO", membros: 18 },
  { nome: "JARDIM CRISTINA", membros: 90 },
  { nome: "POVOADO CALCILÂNDIA", membros: 37 },
  { nome: "POVOADO OLHO D'ÁGUA DE SÃO BENEDITO", membros: 35 },
  { nome: "POVOADO SANTA RITA", membros: 67 },
  { nome: "VILA COMUNITÁRIA", membros: 137 },
  { nome: "VILA PROGRESSO", membros: 102 },
  { nome: "AMERICANO DO BRASIL - SETOR CENTRAL", membros: 56 },
  { nome: "GOIÁS - CENTRO", membros: 96 },
  { nome: "GOIÁS - POVOADO COLÔNIA DE UVÁ", membros: 15 },
  { nome: "GOIÁS - POVOADO DE AREIAS", membros: 37 },
  { nome: "GOIÁS - VILA LIONS", membros: 28 },
  { nome: "MOSSÂMEDES - VILA DAMIANA DA CUNHA", membros: 55 },
  { nome: "POVOADO DE MIRANDÓPOLIS", membros: 18 },
];

async function createData(range: string, headers: string[], values: any[][]) {
  try {
    if (values.length) {
      values.unshift(headers);
      await sheet?.clearTable(range);
      await sheet?.updateTable(range, values);
    }
  } catch (error) {
    console.log("Erro ao enviar para o google: ", error);
  }
}

function formatValor(valor: string): number {
  try {
    const newValue =
      parseFloat(`${valor}`.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    return newValue;
  } catch (error) {
    console.log("\x1b[31m%s\x1b[0m", `Erro ao formatar: ${valor}\t\t${valor}`);
    return 0;
  }
}

function formatIgreja(nome: string): string {
  return nome.replace(/BR \d+-\d+ - /gi, "").trim() || "";
}

export async function syncDbSheet(app: App) {
  console.log("Enviado para o Google Sheet...");

  try {
    if (!app.google.secret.client_email) throw "Nenhum client google iniciado!";
    sheet = new GoogleSheetsService(app.google.sheetID, app.google.secret);
    // IGREJAS
    const igrejas = await database.igreja.findMany();
    await createData(
      "SIGA-Igrejas",
      ["ID", "IGREJA", "MEMBROS"],
      igrejas.map(({ cod, nome }) => [
        Number(`${cod}`),
        nome.replace(/BR \d+-\d+ - /gi, ""),
        Number(
          `${DEFAULTS_IGREJAS.find((e) => nome.includes(e.nome))?.membros}`
        ),
      ])
    );

    // Fluxo
    // Ofertas
    console.log("\x1b[34m%s\x1b[0m", "Enviando ofertas para GoogleSheet!");
    const fluxos = await database.fluxo.findMany();
    const dadosGastos = await sheet.getTableData("Gastos!A2:F");
    const valuesFluxos = [
      ...fluxos.map(
        ({ fluxo, igreja, categoria, data, valor, ref, detalhes }) => {
          return [
            fluxo,
            formatIgreja(igreja),
            categoria,
            data
              .toISOString()
              .replace(/(T|\.000Z)/gi, " ")
              .trim(),
            valor,
            detalhes,
            "SIGA",
            ref,
          ];
        }
      ),
      ...dadosGastos
        .filter((e) => e[0] && e[1])
        .map(([fluxo, igreja, categoria, data, valor, detalhes]) => {
          const [yyyy, mm, _dd] = data.split("-");
          return [
            fluxo,
            igreja,
            categoria,
            new Date(data).toISOString().split("T")[0],
            formatValor(`${valor}`),
            detalhes,
            "MANUAL",
            `${mm}/${yyyy}`,
          ];
        }),
    ].sort((a, b) => {
      const dataA = new Date(a[3]);
      const dataB = new Date(b[3]);
      if (isNaN(dataA.getTime()) || isNaN(dataB.getTime())) {
        console.log(
          "\x1b[31m%s\x1b[0m",
          `Erro na conversão de data: ${dataA} e  ${dataB}`
        );
        return 0;
      }
      return dataB.getTime() - dataA.getTime();
    });

    await createData(
      "SIGA-Fluxo",
      [
        "FLUXO",
        "IGREJA",
        "CATEGORIA",
        "DATA",
        "VALOR",
        "OBSERVAÇÕES",
        "ORIGEM",
        "REF.",
      ],
      valuesFluxos
    );
    console.log("\n\nEnviado para o Google!!!");
    return true;
  } catch (error) {
    console.log("Erro ao enviar para o sheet: ", error);
    return false;
  }
}
