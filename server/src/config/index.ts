import fs from "fs";
import path from "path";
const { spawn } = require("child_process");

const configPath = path.join(__dirname, "config.json");

export interface Config {
  cookie: string;
  token: string;
}

export function saveConfig(): void {
  try {
    fs.writeFileSync(configPath, JSON.stringify(AppConfig, null, 2));
    console.log("Configurações salvas com sucesso!");
    const hr =
      "######################################################################";
    console.log(
      `\x1b[33m ${hr}\n\n⚡️ Reiniciando. Aguarde, por favor... ⚡️\n\n${hr}\x1b[0m`
    );
    setTimeout(() => {
      const processo = process;
      const newProcess = spawn(process.argv[0], processo.argv.slice(1), {
        stdio: "inherit",
      });
      newProcess.on("exit", (id: number) => {
        processo.exit(id);
      });
    }, 2000);
  } catch (error) {
    console.error("Erro ao salvar as configurações:", error);
  }
}

function readConfigFile(): Config | null {
  try {
    const fileContent = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(fileContent) as Config;
  } catch (error) {
    console.error(`Erro ao ler o arquivo de configuração: ${error}`);
    return null;
  }
}

export const AppConfig: Config = readConfigFile() || {
  cookie: "",
  token: "",
};
