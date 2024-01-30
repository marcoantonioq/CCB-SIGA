import {
  IgrejaRepository,
  TarefaRepository,
  FluxoRepository,
} from "./AppInterfaces";
import { FluxoRepositoryPrisma } from "./FluxoRepo";
import { IgrejaRepositoryPrisma } from "./IgrejaRepo";
import { TarefaRepositoryPrisma } from "./TarefaRepo";
import { reportIgrejas } from "./request/report_alterar_igreja_para";
import { reportDespesas } from "./request/report_despesas";

export class AppSIGA {
  private onSync = false;

  private constructor(
    public repoIgreja: IgrejaRepository,
    public repoTarefa: TarefaRepository,
    public repoFluxo: FluxoRepository
  ) {}

  static create() {
    const repoIgreja = new IgrejaRepositoryPrisma();
    const repoTarefa = new TarefaRepositoryPrisma();
    const repoFluxo = new FluxoRepositoryPrisma();
    return new AppSIGA(repoIgreja, repoTarefa, repoFluxo);
  }

  async sync(months: number) {
    const date = new Date();
    for (let i = 0; i < months; i++) {
      date.setMonth(date.getMonth() - 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      firstDay.setHours(0, 0, 0, 0);
      lastDay.setHours(0, 0, 0, 0);
      try {
        if (this.onSync) {
          throw new Error("Já está realizando a sincronização!!!");
        }
        this.onSync = true;

        // Igrejas
        let igrejas = await reportIgrejas();
        console.info(`\nIgrejas coletadas: ${igrejas.length}`);
        for (const igreja of igrejas) {
          this.repoIgreja.save(igreja);
        }
        igrejas = await this.repoIgreja.getAll();

        // Despesas
        const despesas = await reportDespesas(firstDay, lastDay);
        console.log("Despesa: ", despesas);

        // for (const igreja of igrejas) {
        //   await alterarParaIgreja(igreja);
        //   let fluxos: Fluxo[] = [];
        //   // Ofertas
        //   console.info(`\nColetando ofertas de ${igreja.nome}...`);
        //   for (const oferta of await reportOfertas(firstDay, lastDay)) {
        //     try {
        //       oferta.fluxo = "Entrada";
        //       oferta.igrejaId = igreja.id;
        //       this.repoFluxo.save(oferta);
        //       fluxos.push(oferta);
        //     } catch (error) {
        //       console.log("Erro ao coletar oferta: ", error);
        //     }
        //   }
        // }
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
}
