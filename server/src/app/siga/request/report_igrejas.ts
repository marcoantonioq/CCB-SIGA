import axios from "axios";
import { AppConfig } from "../../../config";
import * as cheerio from "cheerio";
import { Igreja } from "../AppInterfaces";

export async function reportIgrejas() {
  const url = "https://siga.congregacao.org.br/SIS/SIS99908.aspx";
  const igrejas: Igreja[] = [];

  const headers = {
    Cookie: AppConfig.cookie,
    __antixsrftoken: AppConfig.token,
  };

  const { data: html } = await axios.get(url, { headers });
  const $ = cheerio.load(html);
  if (html.match(/Informe o ID do Usuário e a Senha!/gi))
    throw "Você não está logado!\nAcesse o portal administrativo para enviar o cookie de autenticação...";

  $("ul#dropdown_localidades li").each((_index, li) => {
    const cod = $(li).attr("id") || "";
    const nome = $(li).text().trim();
    igrejas.push({ cod, nome, membros: 0 });
  });
  return igrejas;
}
