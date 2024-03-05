import { database } from "../infra/prisma";
import { reportDespesas } from "./report_despesas";
import { reportIgrejas } from "./report_igrejas";
import { alterarParaIgreja } from "./igreja_alterar";
import { reportOfertas } from "./report_ofertas";
import { App } from "../app";

export async function syncSigaDB(app: App) {
  const date = new Date();
  if (app.onSync) {
    throw new Error("Já está realizando a sincronização!!!");
  }
  app.onSync = true;

  console.log("Sync...");
  for (let i = 0; i < app.config.monthsSync; i++) {
    const year = date.getFullYear();
    const month = date.getMonth();
    try {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 1);
      console.log(
        `Filtrando entre ${firstDay.toISOString()} e ${lastDay.toISOString()}`
      );
      // Igrejas
      let igrejas = await reportIgrejas(app);
      for (const igreja of igrejas) {
        await database?.igreja.upsert({
          where: { cod: igreja.cod },
          update: igreja,
          create: igreja,
        });
      }

      // Despesas
      const despesas = await reportDespesas(firstDay, lastDay);

      // Limpando entrada e saída (Fluxos)
      if (despesas.length) {
        await database?.fluxo.deleteMany({
          where: { data: { gte: firstDay, lte: lastDay } },
        });
      }

      for (const despesa of despesas) {
        try {
          const { igreja, categoria, data, detalhes } = despesa;
          const ig = await database?.igreja.findUnique({
            where: { nome: igreja },
          });
          if (!ig) {
            await database?.igreja.upsert({
              where: { nome: igreja },
              update: { cod: igreja, nome: igreja, membros: 0 },
              create: { cod: igreja, nome: igreja, membros: 0 },
            });
          }
          await database?.fluxo.upsert({
            where: {
              igreja_categoria_data_detalhes: {
                igreja,
                categoria,
                data,
                detalhes,
              },
            },
            update: despesa,
            create: despesa,
          });
        } catch (error) {
          console.log("Erro ao salvar despesa: ", despesa);
        }
      }

      // // Ofertas
      for (const igreja of igrejas) {
        await alterarParaIgreja(igreja);
        console.info(`Coletando ofertas de ${igreja.nome}...`);
        for (const oferta of await reportOfertas(firstDay, lastDay)) {
          try {
            const { categoria, data, detalhes } = oferta;
            oferta.fluxo = "Entrada";
            oferta.igreja = igreja.nome;
            await database?.fluxo.upsert({
              where: {
                igreja_categoria_data_detalhes: {
                  igreja: igreja.nome,
                  categoria,
                  data,
                  detalhes,
                },
              },
              update: oferta,
              create: oferta,
            });
          } catch (error) {
            console.log("Erro ao salvar despesa: ", error);
          }
        }
      }
    } catch (error) {
      throw "Verifique o login de acesso no arquivo de configuração!";
    }
    date.setMonth(date.getMonth() - 1);
  }
  app.onSync = false;
}
