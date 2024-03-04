import axios from "axios";
import { AppConfig } from "..";
import { Igreja } from "@prisma/client";

export async function alterarParaIgreja(igreja: Igreja) {
  const url = "https://siga.congregacao.org.br/page.aspx";
  const data = new FormData();
  if (!igreja || !igreja.cod) return;
  data.append("f_selecionarlocalidade", "S");
  data.append("f_codlocalidade", String(igreja.cod));

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: AppConfig.cookie,
      __antixsrftoken: AppConfig.token,
    },
  };

  try {
    const { status } = await axios.post(url, data, config);
    if (status === 200) {
      await axios.get(
        "https://siga.congregacao.org.br/SIS/SIS99908.aspx?f_inicio=S",
        config
      );
      await axios.get(
        "https://siga.congregacao.org.br/SIS/SIS99908.aspx?f_inicio=S&__initPage__=S",
        config
      );
      await axios.get(url);
      return true;
    } else {
      throw "Verifique o login de acesso!";
    }
  } catch (erro: any) {
    console.log(
      "Erro alterar igreja: ",
      erro.response?.status,
      erro.response?.data
    );
    throw "Erro ao alterar igrejas!";
  }
}
