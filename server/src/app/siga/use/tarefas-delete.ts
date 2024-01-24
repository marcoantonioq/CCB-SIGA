import { Tarefa, TarefaRepository } from "../AppInterfaces";

export class TarefaDelete {
  constructor(private readonly repo: TarefaRepository) {}

  async execute(id: string): Promise<Tarefa[]> {
    return await this.repo.getAll();
  }
}
