import { Fluxo } from "./AppInterfaces";

export class FluxoCore implements Fluxo {
  private constructor(
    public id: string,
    public fluxo: "Entrada" | "Saída",
    public categoria: string,
    public data: Date,
    public valor: number,
    public detalhes: string | null,
    public ref: string | null,
    public competencia: string | null,
    public created: Date,
    public updated: Date,
    public igrejaId: string
  ) {}

  static create(data: Partial<Fluxo>): FluxoCore {
    const fluxoInstance = new FluxoCore(
      data.id || "",
      data.fluxo || "Entrada",
      data.categoria || "",
      data.data || new Date(),
      data.valor || 0,
      data.detalhes || "",
      data.ref || null,
      data.competencia || null,
      data.created || new Date(),
      data.updated || new Date(),
      data.igrejaId || ""
    );
    return Object.assign(fluxoInstance, data);
  }

  get dto(): Fluxo {
    const {
      id,
      fluxo,
      categoria,
      data,
      valor,
      detalhes,
      ref,
      competencia,
      created,
      updated,
      igrejaId,
    } = this;
    return {
      id,
      fluxo,
      categoria,
      data,
      valor,
      detalhes,
      ref,
      competencia,
      created,
      updated,
      igrejaId,
    };
  }
}
