import * as schedule from "node-schedule";
import { syncSigaDB } from "./app/siga/sync_siga_db";
import { syncDbSheet } from "./app/siga/sync_db_sheet";

process.env.TZ = "Europe/London";

async function startSync(months: number) {
  try {
    await syncSigaDB(months);
    await syncDbSheet();
  } catch (error) {
    console.log("Falha ao realizar o sync siga!!!");
  }
}

// Cada duas horas
schedule.scheduleJob("0 0 */2 * *", async () => {
  await startSync(1);
});

startSync(2);
