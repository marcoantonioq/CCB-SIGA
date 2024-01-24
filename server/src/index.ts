import { AppSIGA } from "./app/siga";
import schedule from "node-schedule";
import { startHTTP } from "./infra/express/index";
import { saveGoogle } from "./modules/google";

const app = AppSIGA.create({});
startHTTP(app);

async function startSync(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  await app.sync(firstDay, lastDay);
  await saveGoogle(app);
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
}

lastMonths(12);
