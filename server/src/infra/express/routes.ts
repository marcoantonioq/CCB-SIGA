import { Express, Request, Response } from "express";
import { AppSIGA } from "../../app/siga";
import { AppConfig, saveConfig } from "../../config";
import * as path from "path";
import * as express from "express";
import { saveGoogle } from "../../modules/google";

export function setupRoutes(router: Express, app: AppSIGA): void {
  router.use("/", express.static(path.resolve(__dirname, "dist")));

  router.get("/api", (_req: Request, res: Response) => {
    res.json({ message: "Teste resposta da API" });
  });

  router.get("/api/dados", async (_req: Request, res: Response) => {
    res.json({
      message: "Dados",
      data: {
        igrejas: await app.repoIgreja.getAll(),
        fluxos: await app.repoFluxo.getAll(),
        tarefas: await app.repoTarefa.getAll(),
      },
    });
  });

  router.get("/api/generate", async (req: Request, res: Response) => {
    try {
      const date1Param = req.query.date1 as string;
      const date2Param = req.query.date2 as string;

      if (!date1Param || !date2Param) {
        throw new Error("Parâmetros date1 e date2 são obrigatórios.");
      }

      const date1 = new Date(date1Param);
      const date2 = new Date(date2Param);

      const responseData = {
        message: "Gerando dados!",
        receivedData: {
          date1,
          date2,
        },
      };
      await app.sync(new Date(date1), new Date(date2));
      await saveGoogle(app);
      res.status(200).json(responseData);
    } catch (error) {
      console.log("erro ao processar: ", error);
      res.status(500).json({ error: "Erro ao processar os dados" });
    }
  });

  router.post("/api/settings", (req, res) => {
    try {
      const { cookie } = req.body;

      const responseData = {
        message: "Dados recebidos com sucesso!",
        receivedData: {
          cookie,
        },
      };

      if (cookie.trim()) {
        AppConfig.cookie = cookie;
      }
      const match = cookie.match(/__AntiXsrfToken=([^;]+)/);
      if (match && match[1]) {
        AppConfig.token = match[1];
      }
      saveConfig();
      res.status(200).json(responseData);
    } catch (error) {
      console.log("erro ao processar: ", error);
      res.status(500).json({ error: "Erro ao processar os dados" });
    }
  });
}
