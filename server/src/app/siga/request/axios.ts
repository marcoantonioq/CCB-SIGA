import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import crypto from "crypto";
import * as app from "../../../config";
import * as cheerio from "cheerio";

const ERROR_MESSAGE_PREFIX = "Erro ao processar requisição";

export interface RequestOptions extends AxiosRequestConfig {
  url: string;
  method?: "GET" | "POST";
  data?: any;
  retry?: number;
}

const defaultHeaders = {
  Host: "siga.congregacao.org.br",
  Cookie: app.AppConfig.cookie,
  __antixsrftoken: app.AppConfig.token,
  "Sec-Ch-Ua-Mobile": "?0",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.70 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
  "Sec-Ch-Ua": '"Not=A?Brand";v="99", "Chromium";v="118"',
  "Sec-Ch-Ua-Platform": "Linux",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
};

axios.defaults.timeout = 30000;

export async function sendRequest({
  url,
  method = "GET",
  data,
  headers,
  retry = 10,
  ...rest
}: RequestOptions): Promise<AxiosResponse> {
  const axiosConfig: AxiosRequestConfig = {
    method,
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  };

  let attempt = 1;

  while (attempt <= retry) {
    try {
      const response =
        method === "POST"
          ? await axios.post(url, data, axiosConfig)
          : await axios.get(url, axiosConfig);

      process.stdout.write(".");
      return response; // Adicionando a instrução de retorno
    } catch (error) {
      process.stdout.write("_");

      if (attempt === retry) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;

          if (axiosError.response) {
            const { status, statusText, data: html } = axiosError.response;
            const $ = cheerio.load(html as string);
            throw `${ERROR_MESSAGE_PREFIX} ${url} - Código: ${status} ${statusText}, Data: ${$.text()}`;
          } else {
            throw `${ERROR_MESSAGE_PREFIX} ${url}: ${axiosError.message}`;
          }
        } else {
          throw `${ERROR_MESSAGE_PREFIX} ${url}: ${
            error instanceof Error ? error.message : "Erro desconhecido"
          }`;
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempt++;
  }
  process.stdout.write("x");
  throw `${ERROR_MESSAGE_PREFIX} ${url}: Falha ao realizar a solicitação após ${attempt} tentativas`;
}

export function generateRandomBoundary(): string {
  const boundaryLength = 16;
  const randomBytes = crypto.randomBytes(boundaryLength);
  const boundary = `----WebKitFormBoundary${randomBytes.toString("hex")}`;

  return boundary;
}
