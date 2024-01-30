import axios from "axios";
import { AppConfig } from "../../../config";
import { Igreja } from "../AppInterfaces";

export async function alterarParaIgreja(igreja: Igreja) {
  const url = "https://siga.congregacao.org.br/page.aspx";
  const data = new FormData();
  if (!igreja || !igreja.id) return;
  data.append("f_selecionarlocalidade", "S");
  data.append("f_codlocalidade", String(igreja.id));

  try {
    const { status } = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: AppConfig.cookie,
        __antixsrftoken: AppConfig.token,
      },
    });
    if (status === 200) {
      await axios.get(
        "https://siga.congregacao.org.br/SIS/SIS99908.aspx?f_inicio=S"
      );
      await axios.get(
        "https://siga.congregacao.org.br/SIS/SIS99908.aspx?f_inicio=S&__initPage__=S"
      );
      await axios.get(url);
      return true;
    }
  } catch (erro) {
    console.log("Erro: ", erro);
  }
  return false;
}
