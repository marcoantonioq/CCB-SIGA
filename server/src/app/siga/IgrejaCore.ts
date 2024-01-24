import { Igreja } from "./AppInterfaces";

export class IgrejaCore implements Igreja {
  constructor(public id: string, public nome: string, public membros: number) {}

  static create(igrejaData: Partial<Igreja>): IgrejaCore {
    const igrejaInstance = new IgrejaCore(
      igrejaData.id || "",
      igrejaData.nome || "",
      igrejaData.membros || 0
    );
    return Object.assign(igrejaInstance, igrejaData);
  }

  get dto(): Igreja {
    const { id, nome, membros } = this;
    return { id, nome, membros };
  }
}
