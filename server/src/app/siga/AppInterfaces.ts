export type Igreja = {
  id: string;
  nome: string;
  membros: number | null;
};

export type Tarefa = {
  id: number;
  description: string;
  status: string;
  igrejaId: string;
};

export type Fluxo = {
  id: string;
  fluxo: "Entrada" | "Saída";
  categoria: string;
  data: Date;
  valor: number;
  detalhes: string | null;
  ref: string | null;
  competencia: string | null;
  created: Date;
  updated: Date;
  igrejaId: string;
};

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
