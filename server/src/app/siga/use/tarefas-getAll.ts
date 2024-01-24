import { Tarefa, TarefaRepository } from "../AppInterfaces";

export class TarefaAll {
  constructor(private readonly repo: TarefaRepository) {}

  async execute(): Promise<Tarefa[]> {
    return await this.repo.getAll();
  }
}
