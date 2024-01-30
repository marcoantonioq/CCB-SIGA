import { AppSIGA } from "./app/siga";
import * as schedule from "node-schedule";
// import { startHTTP } from "./infra/express/index";
// import { saveGoogle } from "./modules/google";

const app = AppSIGA.create();

// startHTTP(app);

async function startSync(months: number) {
  try {
    await app.sync(months);
    // Remover itens não existente no siga
    // const currentDate = new Date();
    // currentDate.setHours(0, 0, 0, 0);
    // for (const fluxo of await app.repoFluxo.getAll()) {
    //   fluxo.updated.setHours(0, 0, 0, 0);
    //   if (
    //     fluxo.data >= firstDay &&
    //     fluxo.data <= lastDay &&
    //     fluxo.updated < currentDate
    //   ) {
    //     console.log(
    //       "\x1b[31m%s\x1b[0m",
    //       `Removendo item não existente no siga: ${fluxo}`
    //     );
    //     await app.repoFluxo.delete(fluxo);
    //   }
    // }
    // await saveGoogle(app);
  } catch (error) {
    console.log("Falha ao realizar o sync siga!!!");
  }
}

// Cada duas horas
schedule.scheduleJob("0 0 */2 * *", async () => {
  await startSync(1);
});

startSync(1);
