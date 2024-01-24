import { Tarefa } from "./AppInterfaces";

export class TarefaCore implements Tarefa {
  constructor(
    public id: number,
    public description: string,
    public status: string,
    public igrejaId: string
  ) {}

  static create(data: Partial<Tarefa>): TarefaCore {
    const tarefaInstance = new TarefaCore(
      data.id || 0,
      data.description || "",
      data.status || "",
      data.igrejaId || ""
    );
    return Object.assign(tarefaInstance, data);
  }

  get dto(): Tarefa {
    const { id, description, status, igrejaId } = this;
    return { id, description, status, igrejaId };
  }
}
