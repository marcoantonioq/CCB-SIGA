import { Fluxo, FluxoRepository } from "../AppInterfaces";

export class FluxoDelete {
  constructor(private readonly repo: FluxoRepository) {}

  async execute(): Promise<Fluxo[]> {
    return await this.repo.getAll();
  }
}
