import { Igreja, IgrejaRepository } from "../AppInterfaces";

export class IgrejaDelete {
  constructor(private readonly repo: IgrejaRepository) {}

  async execute(): Promise<Igreja[]> {
    return await this.repo.getAll();
  }
}
