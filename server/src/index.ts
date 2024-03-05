import * as schedule from "node-schedule";
import { startSTORE } from "./modules/localstore";
import { app } from "./app";
import { syncSigaDB } from "./lib/sync_siga_db";
import { syncDbSheet } from "./lib/sync_db_sheet";

process.env.TZ = "Europe/London";

async function startSync() {
  await startSTORE(app);
  try {
    await syncDbSheet(app);
    await syncSigaDB(app);
    await syncDbSheet(app);
  } catch (error) {
    console.log("Falha ao realizar o sync siga: ", error);
  }
}

// Cada duas horas
schedule.scheduleJob("*/30 * * * *", async () => {
  console.log("Atualizar de 30 em 30 min...");
  await syncSigaDB(app);
  await syncDbSheet(app);
});

startSync();
