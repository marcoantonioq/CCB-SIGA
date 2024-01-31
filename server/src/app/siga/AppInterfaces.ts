export interface Igreja {
  nome: string;
  cod: string;
  membros: number;
}

export interface Fluxo {
  igreja: string;
  fluxo: "Entrada" | "Saída";
  categoria: string;
  data: Date;
  valor: number;
  detalhes: string;
  ref?: string;
  created?: Date;
  updated?: Date;
}

export interface Tarefa {
  igreja: string;
  description: string;
  status: string;
}

export interface IgrejaRepository {
  getAll(): Promise<Igreja[]>;
  getById(id: string): Promise<Igreja | undefined>;
  save(igreja: Igreja): Promise<Igreja>;
  delete(igreja: Igreja): Promise<Igreja>;
  on(event: "saved" | "deleted", listener: (igreja: Igreja) => void): void;
  on(event: "all", listener: () => Promise<Igreja[]>): void;
}

export interface TarefaRepository {
  getAll(): Promise<Tarefa[]>;
  getById(id: number): Promise<Tarefa | undefined>;
  save(tarefa: Tarefa): Promise<Tarefa>;
  delete(tarefa: Tarefa): Promise<Tarefa>;
  on(event: "saved" | "deleted", listener: (tarefa: Tarefa) => void): void;
  on(event: "all", listener: () => Promise<Tarefa[]>): void;
}

export interface FluxoRepository {
  getAll(): Promise<Fluxo[]>;
  getById(id: string): Promise<Fluxo | undefined>;
  save(fluxo: Fluxo): Promise<Fluxo>;
  delete(fluxo: Fluxo): Promise<Fluxo>;
  on(event: "saved" | "deleted", listener: (fluxo: Fluxo) => void): void;
  on(event: "all", listener: () => Promise<Fluxo[]>): void;
}
