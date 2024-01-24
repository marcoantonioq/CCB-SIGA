import { Fluxo, FluxoRepository } from "../AppInterfaces";

export class FluxoAll {
  constructor(private readonly repo: FluxoRepository) {}

  async execute(): Promise<Fluxo[]> {
    return await this.repo.getAll();
  }
}
