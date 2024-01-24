import { Igreja, IgrejaRepository } from "../AppInterfaces";

export class IgrejaAll {
  constructor(private readonly repo: IgrejaRepository) {}

  async execute(): Promise<Igreja[]> {
    console.log("Repo igreja::: ", this.repo);
    // return await this.repo.getAll()
    return [];
  }
}
