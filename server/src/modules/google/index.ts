import { AppSIGA } from "../../app/siga";
import GoogleSheetsService from "./sheet";

/**
 * Google Sheet
 */

const sheet = new GoogleSheetsService(
  "1Xo-4iA3n1sdfm5nKtl7hqgZe9rtFk9CU6p16UmQAYik"
);

export async function saveGoogle(app: AppSIGA) {
  const igrejas = await app.repoIgreja.getAll();

  const createData = async (
    range: string,
    headers: string[],
    values: any[][]
  ) => {
    try {
      if (values.length) {
        values.unshift(headers);
        await sheet.clearTable(range);
        await sheet.updateTable(range, values);
      }
    } catch (error) {
      console.log("Erro ao enviar para o google: ", error);
    }
  };

  // Igrejas
  console.log("Enviados Igrejas para GoogleSheet!");
  const oldIgrejas = [
    { nome: "GOIÁS - POVOADO DE AREIAS", membros: 37 },
    { nome: "POVOADO DE MIRANDÓPOLIS", membros: 18 },
    { nome: "MOSSÂMEDES - VILA DAMIANA DA CUNHA", membros: 55 },
    { nome: "GOIÁS - POVOADO COLÔNIA DE UVÁ", membros: 15 },
    { nome: "GOIÁS - CENTRO", membros: 96 },
    { nome: "GOIÁS - VILA LIONS", membros: 28 },
  ];
  await createData(
    "SIGA-Igrejas",
    ["ID", "IGREJA", "MEMBROS"],
    igrejas.map(({ id, nome, membros }) => [
      Number(`${id}`),
      nome.replace(/BR \d+-\d+ - /gi, ""),
      Number(`${oldIgrejas.find((e) => nome.includes(e.nome))?.membros}`),
    ])
  );

  // Tarefas
  console.log("Enviados Tarefas para GoogleSheet!");
  await createData(
    "SIGA-Tarefas",
    ["IGREJA", "DESCRIÇÃO", "STATUS"],
    (
      await app.repoTarefa.getAll()
    ).map(({ id, description, igrejaId, status }) => [
      igrejas
        .find((i) => i.id === igrejaId)
        ?.nome.replace(/BR \d+-\d+ - /gi, "")
        .trim() || "",
      description,
      status,
    ])
  );

  // Ofertas
  console.log("Enviados Ofertas para GoogleSheet!");
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
      "ID",
    ],
    [
      ...(
        await app.repoFluxo.getAll()
      ).map(({ id, fluxo, igrejaId, categoria, data, valor, ref }) => [
        fluxo,
        igrejas
          .find((i) => i.id === igrejaId)
          ?.nome.replace(/BR \d+-\d+ - /gi, "")
          .trim() || "",
        categoria || "",
        new Date(data).toISOString().split("T")[0],
        parseFloat(`${valor}`.replace(/,/gi, ".").replace(/(R\$| )/gi, "")),
        "",
        "SIGA",
        `${ref}`,
        `${id}`,
      ]),
      ...(
        await sheet.getTableData("Gastos!A2:F")
      )
        .filter((e) => e[0] && e[1])
        .map(([fluxo, igreja, categoria, data, valor, obs]) => {
          const [yyyy, mm, dd] = data.split("-");
          return [
            fluxo,
            igreja,
            categoria,
            new Date(data).toISOString().split("T")[0],
            parseFloat(`${valor}`.replace(/,/gi, ".").replace(/(R\$| )/gi, "")),
            obs || "",
            "MANUAL",
            `${mm}/${yyyy}`,
            "",
          ];
        }),
    ].sort((a, b) => {
      const dataA = new Date(a[3]);
      const dataB = new Date(b[3]);
      if (isNaN(dataA.getTime()) || isNaN(dataB.getTime())) {
        console.error("Erro na conversão de data: ", dataA, dataB);
        return 0;
      }
      return dataB.getTime() - dataA.getTime();
    })
  );
}
