import { Tarefa, TarefaRepository } from "../AppInterfaces";

export class TarefaSave {
  constructor(private readonly repo: TarefaRepository) {}

  async execute(Tarefa: Tarefa): Promise<Tarefa> {
    return await this.repo.save(Tarefa);
  }
}
