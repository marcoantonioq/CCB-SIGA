import { database } from "../../infra/prisma";
import { reportDespesas } from "../request/report_despesas";
import { reportIgrejas } from "../request/report_igrejas";
import { alterarParaIgreja } from "../request/igreja_alterar";
import { reportOfertas } from "../request/report_ofertas";

let onSync = false;

export async function syncSigaDB(months: number) {
  const date = new Date();
  for (let i = 0; i < months; i++) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 1);
    console.log(
      `Filtrando entre ${firstDay.toISOString()} e ${lastDay.toISOString()}`
    );
    try {
      if (onSync) {
        throw new Error("Já está realizando a sincronização!!!");
      }
      onSync = true;

      // Igrejas
      let igrejas = await reportIgrejas();
      for (const igreja of igrejas) {
        await database?.igreja.upsert({
          where: { cod: igreja.cod },
          update: igreja,
          create: igreja,
        });
      }

      // Limpando entrada e saída (Fluxos)
      await database?.fluxo.deleteMany({
        where: { data: { gte: firstDay, lte: lastDay } },
      });

      // Despesas
      const despesas = await reportDespesas(firstDay, lastDay);
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
      console.log(
        "Verifique o login de acesso no arquivo de configuração: ",
        error
      );
      return false;
    } finally {
      onSync = false;
    }
    date.setMonth(date.getMonth() - 1);
  }
}
