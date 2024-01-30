import axios from "axios";
import { AppConfig } from "../../../config";
import { Fluxo } from "../AppInterfaces";

export async function reportOfertas(data1: Date, data2: Date) {
  const ofertas: Fluxo[] = [];
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

  const headers = {
    Cookie: AppConfig.cookie,
    __antixsrftoken: AppConfig.token,
  };

  try {
    const result = await axios.post(url, data, { headers });
    result.data.d.aaData.map((e: any) => {
      const [, m, y] = e.sData.split("/");
      ofertas.push(<Fluxo>{
        id: String(e.Codigo),
        fluxo: "Entrada",
        data: new Date(String(e.sData).split("/").reverse().join("/")),
        ref: `${m}/${y}`,
        competencia: String(e.CodigoCompetencia),
        categoria: String(e.NomeTipoCulto),
        valor: Number(e.ValorTotal),
        updated: new Date(),
        created: new Date(),
      });
    });
  } catch (erro) {
    console.log("Erro Report Ofertas: ", erro);
  }
  return ofertas;
}

reportOfertas(new Date("2023-12-01"), new Date("2024-02-01")).then((result) => {
  console.log("Ofertas: ", result);
});
