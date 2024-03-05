import axios from "axios";
import * as cheerio from "cheerio";
import { Igreja } from "@prisma/client";
import { App } from "../app";

export async function reportIgrejas(app: App) {
  const url = "https://siga.congregacao.org.br/SIS/SIS99908.aspx";
  const igrejas: Igreja[] = [];

  const currentTime = Date.now().toString();
  const regexTime = /(\d+)\|(\d+)$/;
  app.config.cookie = app.config.cookie.replace(regexTime, `$1|${currentTime}`);

  const headers = {
    Cookie: app.config.cookie,
    __antixsrftoken: app.config.token,
  };

  const { data: html } = await axios.get(url, {
    headers,
  });

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
