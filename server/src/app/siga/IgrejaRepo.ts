import { Igreja, IgrejaRepository } from "./AppInterfaces";
import { IgrejaCore } from "./IgrejaCore";
import { EventEmitter } from "events";
import { database } from "../../infra/prisma";

export class IgrejaRepositoryPrisma
  extends EventEmitter
  implements IgrejaRepository
{
  constructor(private igrejas: Igreja[] = []) {
    super();
  }

  async save(igreja: Igreja): Promise<Igreja> {
    const obj = IgrejaCore.create(igreja);
    try {
      await database.igreja.upsert({
        where: { id: obj.id },
        update: obj,
        create: obj,
      });
    } catch (error) {
      console.error("Erro ao salvar dados da igreja: ", error);
      throw error;
    }
    this.emit("saved", obj.dto);
    return obj.dto;
  }

  async delete(igreja: Igreja): Promise<Igreja> {
    try {
      const deleted = IgrejaCore.create(
        (await database.igreja.delete({
          where: { id: igreja.id },
        })) as Igreja
      );
      this.emit("deleted", deleted);
      return deleted;
    } catch (error) {
      console.error("Erro ao excluir dados da igreja: ", igreja, error);
      throw error;
    }
  }

  async getAll(): Promise<Igreja[]> {
    try {
      return (await database.igreja.findMany()).map((e: any) =>
        IgrejaCore.create(e)
      );
    } catch (error) {
      console.error("Erro ao obter todas as igrejas: ", error);
      throw error;
    }
  }

  async getById(id: string): Promise<Igreja | undefined> {
    try {
      const igreja = await database.igreja.findUnique({
        where: { id },
      });
      if (igreja) return IgrejaCore.create(igreja as Igreja);
    } catch (error) {
      console.error("Erro ao obter igreja por ID: ", error);
      throw error;
    }
  }
}
