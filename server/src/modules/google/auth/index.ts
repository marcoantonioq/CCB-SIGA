import { google } from "googleapis";
import * as path from "path";
import * as fs from "fs";

const credentials = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../../../../config/secret.json"),
    "utf-8"
  )
);

export const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});
