import { Fluxo } from "./AppInterfaces";

export class FluxoCore implements Fluxo {
  private constructor(
    public fluxo: "Entrada" | "Saída",
    public categoria: string,
    public data: Date,
    public valor: number,
    public detalhes: string,
    public ref: string,
    public created: Date,
    public updated: Date,
    public igreja: string
  ) {}

  static create(data: Partial<Fluxo>): FluxoCore {
    const fluxoInstance = new FluxoCore(
      data.fluxo || "Entrada",
      data.categoria || "",
      data.data || new Date(),
      data.valor || 0,
      data.detalhes || "",
      data.ref || "",
      data.created || new Date(),
      data.updated || new Date(),
      data.igreja || ""
    );
    return Object.assign(fluxoInstance, data);
  }

  get dto(): Fluxo {
    const {
      igreja,
      fluxo,
      categoria,
      data,
      valor,
      detalhes,
      ref,
      created,
      updated,
    } = this;
    return {
      igreja,
      fluxo,
      categoria,
      data,
      valor,
      detalhes,
      ref,
      created,
      updated,
    };
  }
}
