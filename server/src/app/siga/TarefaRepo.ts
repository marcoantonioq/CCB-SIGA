import { Tarefa, TarefaRepository } from "./AppInterfaces";
import { TarefaCore } from "./TarefaCore";
import { EventEmitter } from "events";
import { database } from "../../infra/prisma";

export class TarefaRepositoryPrisma
  extends EventEmitter
  implements TarefaRepository
{
  constructor(private tarefas: Tarefa[] = []) {
    super();
  }

  async save(tarefa: Tarefa): Promise<Tarefa> {
    const obj = TarefaCore.create(tarefa);
    try {
      await database?.tarefa.upsert({
        where: { id: obj.id },
        update: obj,
        create: obj,
      });
    } catch (error) {
      console.error("Erro ao salvar dados da tarefa: ", error);
      throw error;
    }
    this.emit("saved", obj.dto);
    return obj.dto;
  }

  async delete(tarefa: Tarefa): Promise<Tarefa> {
    try {
      const deleted = TarefaCore.create(
        (await database?.tarefa.delete({
          where: { id: tarefa.id },
        })) as Tarefa
      );
      this.emit("deleted", deleted);
      return deleted;
    } catch (error) {
      console.error("Erro ao excluir dados da tarefa: ", tarefa, error);
      throw error;
    }
  }

  async getAll(): Promise<Tarefa[]> {
    try {
      return ((await database?.tarefa.findMany()) || []).map((e: Tarefa) =>
        TarefaCore.create(e)
      );
    } catch (error) {
      console.error("Erro ao obter todas as tarefas: ", error);
      throw error;
    }
  }

  async getById(id: number): Promise<Tarefa | undefined> {
    try {
      const tarefa = await database?.tarefa.findUnique({
        where: { id },
      });
      if (tarefa) return TarefaCore.create(tarefa as Tarefa);
    } catch (error) {
      console.error("Erro ao obter tarefa por ID: ", error);
      throw error;
    }
  }
}
