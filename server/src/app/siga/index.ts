import * as siga from "./actions";

import {
  Igreja,
  Fluxo,
  Tarefa,
  IgrejaRepository,
  TarefaRepository,
  FluxoRepository,
} from "./AppInterfaces";
import { FluxoRepositoryPrisma } from "./FluxoRepo";
import { IgrejaRepositoryPrisma } from "./IgrejaRepo";
import { TarefaRepositoryPrisma } from "./TarefaRepo";

export class AppSIGA {
  private onSync = false;
  public siga = siga;

  private constructor(
    private config: {},
    public repoIgreja: IgrejaRepository,
    public repoTarefa: TarefaRepository,
    public repoFluxo: FluxoRepository
  ) {}

  static create(config: {}) {
    const repoIgreja = new IgrejaRepositoryPrisma();
    const repoTarefa = new TarefaRepositoryPrisma();
    const repoFluxo = new FluxoRepositoryPrisma();
    return new AppSIGA(config, repoIgreja, repoTarefa, repoFluxo);
  }

  private async syncIgrejas() {
    let igrejas: Igreja[] = [];
    igrejas = await this.siga.getIgrejas();
    console.info(`\nIgrejas coletadas: ${igrejas.length}`);
    for (const igreja of igrejas) {
      this.repoIgreja.save(igreja);
    }
    igrejas = await this.repoIgreja.getAll();
    return igrejas;
  }

  private async syncOfertasAndFechamentos(
    igreja: Igreja,
    firstDay: Date,
    lastDay: Date
  ) {
    let fluxos: Fluxo[] = [];

    // Ofertas
    console.info(`\nColetando ofertas de ${igreja.nome}...`);
    for (const data of await siga.getOfertas(firstDay, lastDay)) {
      try {
        data.fluxo = "Entrada";
        data.igrejaId = igreja.id;
        this.repoFluxo.save(data);
        fluxos.push(data);
      } catch (error) {
        console.log("Erro ao coletar oferta: ", error);
      }
    }
    // Fechamentos
    console.info(`\nColetando fechamento de ${igreja.nome}...`);
    for (const data of await siga.getListaFechamentos(firstDay, lastDay)) {
      try {
        data.igrejaId = igreja.id;
        fluxos.push(data);
        await this.repoFluxo.save(data);
      } catch (error) {
        console.log("Buscar fechamento: ", error);
      }
    }

    return fluxos;
  }

  private async syncTarefas(igreja: Igreja, fluxos: Fluxo[]) {
    let tarefas: Tarefa[] = [];
    console.info(`\nColetando tarefas de ${igreja.nome}...`);
    const refs = <string[]>[
      ...new Set(
        fluxos
          .filter((e) => e.fluxo === "Entrada" && e.competencia)
          .map((e) => e.competencia)
      ),
    ];
    if (refs.length) {
      // await this.repoTarefa.delete(igreja.id);
    }
    for (const ref of refs) {
      try {
        await siga.setCopetencia(ref);
        (await siga.getTarefas()).forEach((e) => {
          e.igrejaId = igreja.id;
          tarefas.push(e);
          this.repoTarefa.save(e);
        });
      } catch (error) {
        console.log("Erro ao coletar tarefas: ", error);
      }
    }

    return tarefas;
  }

  async sync(firstDay: Date, lastDay: Date) {
    try {
      if (this.onSync) {
        throw new Error("Já está realizando a sincronização!!!");
      }
      this.onSync = true;
      console.log(
        `Iniciado entre ${firstDay.toISOString().split("T")[0]} e ${
          lastDay.toISOString().split("T")[0]
        }...`
      );

      const igrejas = await this.syncIgrejas();

      for (const igreja of igrejas) {
        // Selecionar Igreja
        await siga.alterarIGreja(igreja);

        const fluxos = await this.syncOfertasAndFechamentos(
          igreja,
          firstDay,
          lastDay
        );

        // const refs = <string[]>[
        //   ...new Set(
        //     fluxos
        //       .filter((e) => e.fluxo === "Entrada" && e.competencia)
        //       .map((e) => e.competencia)
        //   ),
        // ];

        // if (refs.length) {
        //   await this.repoTarefa.delete(igreja.id);
        // }

        // const tarefas = await this.syncTarefas(igreja, fluxos);
      }
      console.log("\n\nFIM!!!");
      return true;
    } catch (error) {
      console.log("Erro na aplicação SIGA: ", error);
      return false;
    } finally {
      this.onSync = false;
    }
  }
}
