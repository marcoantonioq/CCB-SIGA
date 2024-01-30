import { google, sheets_v4 } from "googleapis";
import { auth } from "../auth";

class GoogleSheetsService {
  public readonly sheets: sheets_v4.Sheets;
  public properties: { sheetId: number; title: string }[] = [];

  constructor(public readonly spreadsheetId: string) {
    this.sheets = google.sheets({ version: "v4", auth });
    this.getAllSheetProperties();
  }

  private async getAllSheetProperties(): Promise<any[]> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      const sheets = response.data.sheets || [];
      this.properties = [];
      for (const sheet of sheets) {
        if (sheet.properties) {
          const { sheetId, title } = sheet.properties;
          if (sheetId && title) {
            this.properties.push({
              sheetId,
              title,
            });
          }
        }
      }

      return this.properties;
    } catch (error) {
      console.error("Error getting sheet properties:", error);
      throw error;
    }
  }

  private async checkTableExistence(range: string): Promise<boolean> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const foundTable = (response.data.sheets || []).some(
        (sheet) => sheet.properties?.title === range
      );

      if (!foundTable) {
        await this.createTable(range);
      }
    } catch (error) {
      console.log("Erro ao verificar a tabela no Google Sheets!");
    }
    return true;
  }

  private async createTable(table: string) {
    try {
      const createResponse = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: table,
                },
              },
            },
          ],
        },
      });
      if (createResponse.status === 200) {
        console.log(`A tabela "${table}" foi criada com sucesso.`);
      }
    } catch (error) {
      console.error(`Ocorreu um erro ao criar a tabela: ${error}`);
    }
  }

  public async getTableData(range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      return response.data.values ?? [];
    } catch (error) {
      console.error("Erro ao obter dados da planilha:", error);
      return [];
    }
  }

  public async updateTable(range: string, values: any[][]) {
    try {
      await this.checkTableExistence(range);

      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values,
        },
      });

      if (response.status === 200) {
        process.stdout.write(".");
      } else {
        throw `Erro ao enviar dados para o Google Sheets: ${response.statusText}`;
      }
    } catch (error) {
      process.stdout.write("x");
      process.stdout.write(` Erro Sheet: ${error}\n`);
    }
  }

  public async clearTable(range: string) {
    try {
      const response = await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range,
      });
      if (response.status === 200) {
        process.stdout.write(".");
      } else {
        throw `Erro ao limpar dados na tabela do Google Sheets: ${response.statusText}`;
      }
    } catch (error) {
      process.stdout.write("x");
      process.stdout.write(` Erro Sheet: ${error}\n`);
    }
  }
}

export default GoogleSheetsService;
