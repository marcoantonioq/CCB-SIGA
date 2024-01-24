import { Server, Socket } from "socket.io";
import { AppSIGA } from "../../app/siga";

enum EVENTS {
  CONNECT = "connection",
  MESSAGE = "message",
  ERROR = "error",
  EVENTOS = "eventos",
  SAVE = "save",
  REMOVE = "remove",
  ALL = "all",
  RELOAD = "reload",
}

export function setupSocketIO(io: Server, app: AppSIGA): void {
  io.on(EVENTS.CONNECT, async (socket: Socket) => {
    const { token } = socket.handshake.auth;

    console.log("Cliente conectado:", socket.id);
    socket.emit(EVENTS.MESSAGE, "Conectado");

    socket.emit(EVENTS.EVENTOS, await app.repoFluxo.getAll());
  });
}
