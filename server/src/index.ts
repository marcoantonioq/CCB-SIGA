import { AppSIGA } from "./app/siga";
import schedule from "node-schedule";
import { startHTTP } from "./infra/express/index";
import { saveGoogle } from "./modules/google";

const app = AppSIGA.create({});

startHTTP(app);

async function startSync(date: Date) {
  try {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    firstDay.setHours(0, 0, 0, 0);
    lastDay.setHours(0, 0, 0, 0);
    await app.sync(firstDay, lastDay);

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
    console.log("Falha ao realizar o sync siga: ", date);
  }
}

// Cada duas horas
schedule.scheduleJob("0 0 */2 * *", async () => {
  const date = new Date();
  await startSync(date);
});

async function lastMonths(months: number) {
  const date = new Date();
  for (let i = 0; i < months; i++) {
    await startSync(date);
    date.setMonth(date.getMonth() - 1);
  }
  // Manter o cookie ativo
  schedule.scheduleJob("0 */20 * * *", async () => {
    console.log("Manter cookie!");
    app.siga.getIgrejas();
  });
}

lastMonths(1);
