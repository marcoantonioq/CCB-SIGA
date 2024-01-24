import { Fluxo, FluxoRepository } from "../AppInterfaces";

export class FluxoSave {
  constructor(private readonly repo: FluxoRepository) {}

  async execute(Fluxo: Fluxo): Promise<Fluxo> {
    return await this.repo.save(Fluxo);
  }
}
