import axios from "axios";
import { Fluxo } from "@prisma/client";
import { app } from "../app";

export async function reportOfertas(data1: Date, data2: Date) {
  const ofertas: Fluxo[] = [];
  const url = "https://siga.congregacao.org.br/TES/TES00401.asmx/Selecionar";

  const payload = {
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

  const config = {
    headers: {
      Cookie: app.config.cookie,
      __antixsrftoken: app.config.token,
    },
  };

  try {
    const { data } = await axios.post(url, payload, config);
    data.d.aaData.map((e: any) => {
      const [, m, y] = e.sData.split("/");
      const data = new Date(String(e.sData).split("/").reverse().join("/"));
      if (e.NomeTipoCulto.includes("RJM")) {
        data.setHours(6, 30);
      } else {
        data.setHours(16, 30);
      }
      ofertas.push(<Fluxo>{
        igreja: "",
        fluxo: "Entrada",
        categoria: String(e.NomeTipoCulto),
        data,
        valor: Number(e.ValorTotal),
        detalhes: "",
        ref: `${m}/${y}`,
        updated: new Date(),
        created: new Date(),
      });
    });
  } catch (erro) {
    console.log("Erro Report Ofertas: ", erro);
  }
  return ofertas;
}

// reportOfertas(new Date("2023-12-01"), new Date("2024-02-01")).then((result) => {
//   console.log("Ofertas: ", result);
// });
