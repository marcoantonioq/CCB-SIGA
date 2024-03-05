import { promises as fs, existsSync } from "fs";
import * as path from "path";
import { watch } from "vue";
import { App } from "../../app";
import { updateApp } from "../../lib/updateApp";

const PATH_CONFIG = path.join(__dirname, "../../../../config/config.json");

async function saveDataToFile(path: string, values: string) {
  await fs.writeFile(path, values);
}

async function readDataFromFile(path: string, values: string) {
  if (existsSync(path)) {
    return JSON.parse((await fs.readFile(path, "utf-8")) || "{}");
  } else {
    console.log(`Criando arquivo de configuração ${path}...`);
    await saveDataToFile(path, values);
  }
}

export async function startSTORE(app: App) {
  console.log("MODULO: Storage");
  const data: App = await readDataFromFile(
    PATH_CONFIG,
    JSON.stringify(app, null, 2)
  );

  if (data) {
    await updateApp(app, data);
    app.onSync = false;
  }

  watch(
    () => app.config.cookie,
    async () => {
      try {
        console.log("Salvando configuração...");
        await saveDataToFile(PATH_CONFIG, JSON.stringify(app, null, 2));
      } catch (error) {
        console.log("LocalStore: Erro ao salvar aquivo: ", error);
      }
    }
  );
}

// console.log("Configurações salvas com sucesso!");
// const hr =
//   "######################################################################";
// console.log(
//   `\x1b[33m ${hr}\n\n⚡️ Reiniciando. Aguarde, por favor... ⚡️\n\n${hr}\x1b[0m`
// );
// setTimeout(() => {
//   const processo = process;
//   const newProcess = spawn(process.argv[0], processo.argv.slice(1), {
//     stdio: "inherit",
//   });
//   newProcess.on("exit", (id: number) => {
//     processo.exit(id);
//   });
// }, 2000);
