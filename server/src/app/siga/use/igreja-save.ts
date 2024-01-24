import { Igreja, IgrejaRepository } from "../AppInterfaces";

export class IgrejaSave {
  constructor(private readonly repo: IgrejaRepository) {}

  async execute(igreja: Igreja): Promise<Igreja> {
    return await this.repo.save(igreja);
  }
}
