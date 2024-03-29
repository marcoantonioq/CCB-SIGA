import { Fluxo as PFluxo, Igreja as PIgreja } from "@prisma/client";
import { reactive } from "vue";

export interface Igreja extends PIgreja {}
export interface Fluxo extends PFluxo {}

export interface Secret {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

export interface App {
  onSync: boolean;
  config: {
    cookie: string;
    token: string;
    monthsSync: number;
  };
  google: {
    sheetID: string;
    secret: Secret;
  };
  igrejas: Igreja[];
  fluxos: Fluxo[];
}

const app = reactive<App>({
  onSync: false,
  config: {
    cookie: "",
    token: "",
    monthsSync: 2,
  },
  google: {
    sheetID: "",
    secret: {
      type: "",
      project_id: "",
      private_key_id: "",
      private_key: "",
      client_email: "",
      client_id: "",
      auth_uri: "",
      token_uri: "",
      auth_provider_x509_cert_url: "",
      client_x509_cert_url: "",
      universe_domain: "",
    },
  },
  igrejas: [],
  fluxos: [],
});

export { app };
