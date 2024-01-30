import { reportDespesas } from "../app/siga/request/report_despesas";
import { reportIgrejas } from "../app/siga/request/report_alterar_igreja_para";

test("igrejas", async () => {
  const result = await reportIgrejas();
  expect(result.length).toBeGreaterThan(0);
});

test("despesas", async () => {
  const first = new Date(),
    last = new Date();
  first.setMonth(first.getMonth() - 2);
  const result = await reportDespesas(first, last);
  expect(result.length).toBeGreaterThan(0);
});
