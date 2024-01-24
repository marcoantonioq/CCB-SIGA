import { google } from "googleapis";
import path from "path";
import fs from "fs";

const credentials = JSON.parse(
  fs.readFileSync(path.join("src", "config", "secret.json"), "utf-8")
);

export const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});
