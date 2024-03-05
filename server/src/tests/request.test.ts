import { reportDespesas } from "../lib/report_despesas";
import { reportIgrejas } from "../lib/report_igrejas";
import { alterarParaIgreja } from "../lib/igreja_alterar";
import { reportOfertas } from "../lib/report_ofertas";
import { app } from "../app";

describe("Relatórios", () => {
  test("despesas", async () => {
    const first = new Date(),
      last = new Date();
    first.setMonth(first.getMonth() - 2);
    const result = await reportDespesas(first, last);
    expect(result.length).toBeGreaterThan(0);
  });

  test("ofertas", async () => {
    await alterarParaIgreja({ cod: "3824", nome: "", membros: 0 });
    const result = await reportOfertas(
      new Date("2023-12-01"),
      new Date("2024-02-01")
    );
    expect(result.length).toBeGreaterThan(0);
  });

  test("igrejas", async () => {
    const result = await reportIgrejas(app);
    expect(result.length).toBeGreaterThan(0);
  });
});
