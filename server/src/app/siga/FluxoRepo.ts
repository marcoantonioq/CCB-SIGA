import { database } from "../../infra/prisma";
import { Fluxo, FluxoRepository } from "./AppInterfaces";
import { FluxoCore } from "./FluxoCore";
import { EventEmitter } from "events";

export class FluxoRepositoryPrisma
  extends EventEmitter
  implements FluxoRepository
{
  constructor(private fluxos: Fluxo[] = []) {
    super();
  }

  async save(fluxo: Fluxo): Promise<Fluxo> {
    const obj = FluxoCore.create(fluxo);
    try {
      const { igreja, categoria, data, detalhes } = obj;
      await database?.fluxo.upsert({
        where: { igreja, categoria, data, detalhes },
        update: obj,
        create: obj,
      });
    } catch (error) {
      console.error("Erro ao salvar dados de fluxo: ", error);
      throw error;
    }
    this.emit("saved", obj.dto);
    return obj.dto;
  }

  async delete(fluxo: Fluxo): Promise<Fluxo> {
    try {
      const deleted = FluxoCore.create(fluxo);
      const { igreja, categoria, data, detalhes } = deleted;

      await database?.fluxo.delete({
        where: { igreja, categoria, data, detalhes },
      });
      this.emit("deleted", deleted);
      return deleted;
    } catch (error) {
      console.error("Erro ao excluir dados de fluxo: ", fluxo, error);
      throw error;
    }
  }

  async getAll(): Promise<Fluxo[]> {
    try {
      return ((await database?.fluxo.findMany()) || []).map((e: any) =>
        FluxoCore.create(e)
      );
    } catch (error) {
      console.error("Erro ao obter todos os fluxos: ", error);
      this.fluxos;
      throw error;
    }
  }

  async getById(_id: string): Promise<Fluxo | undefined> {
    try {
      return;
      // const fluxo = await database?.fluxo.findUnique({
      //   where: { id },
      // });
      // if (fluxo) return FluxoCore.create(fluxo as Fluxo);
    } catch (error) {
      console.error("Erro ao obter fluxo por ID: ", error);
      throw error;
    }
  }
}
