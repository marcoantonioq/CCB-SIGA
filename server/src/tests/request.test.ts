import { reportDespesas } from "../app/siga/request/report_despesas";
import { reportIgrejas } from "../app/siga/request/report_igrejas";
import { alterarParaIgreja } from "src/app/siga/request/igreja_alterar";
import { reportOfertas } from "src/app/siga/request/report_ofertas";

describe("Relatórios", () => {
  test("despesas", async () => {
    const first = new Date(),
      last = new Date();
    first.setMonth(first.getMonth() - 2);
    const result = await reportDespesas(first, last);
    expect(result.length).toBeGreaterThan(0);
  });

  test("ofertas", async () => {
    await alterarParaIgreja({ id: "3824", nome: "", membros: 0 });
    const result = await reportOfertas(
      new Date("2023-12-01"),
      new Date("2024-02-01")
    );
    expect(result.length).toBeGreaterThan(0);
  });

  test("igrejas", async () => {
    const result = await reportIgrejas();
    expect(result.length).toBeGreaterThan(0);
  });
});
