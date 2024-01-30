const PORT = process.env.PORT || 3000;

import express, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import { setupRoutes } from "./routes";
import { setupSocketIO } from "./socket";
import { AppSIGA } from "../../app/siga";

export let server: http.Server | null = null;

export function startHTTP(app: AppSIGA) {
  const appExpress: Express = express();
  server = http.createServer(appExpress);
  const io: Server = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  appExpress.use(express.urlencoded({ extended: true }));
  appExpress.use(bodyParser.json());
  appExpress.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).send("Algo deu errado!");
    }
  );

  setupRoutes(appExpress, app);
  setupSocketIO(io, app);

  server.listen(PORT, () => {
    const hr =
      "######################################################################";
    console.log(`\x1b[32m\n${hr}\n\n🌟 Socket.IO na porta ${PORT}! 🌟\x1b[0m`);
    console.log(
      `\x1b[32m🚀 Acesse o painel administrativo http://localhost:${PORT} 🚀\n\n${hr}\x1b[0m`
    );
  });
}
