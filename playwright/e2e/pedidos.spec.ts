import { test, expect } from "../support/fixtures";
import { generateOrderCode } from "../support/helpers";
import type { OrderDetails } from "../support/actions/orderLookupActions";

test.describe("Consulta de Pedido", () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open();
  });

  test("deve consultar um pedido aprovado", async ({ app }) => {
    const order: OrderDetails = {
      number: "VLO-SY95U0",
      status: "APROVADO",
      color: "Midnight Black",
      wheels: "sport Wheels",
      customer: {
        name: "Gisele De Souza",
        email: "giseleps@ciandt.com",
      },
      payment: "À Vista",
    };

    await app.orderLookup.searchOrder(order.number);
    await app.orderLookup.validateOrderDetails(order);
    await app.orderLookup.validateStatusBadge(order.status);
  });

  test("deve consultar um pedido reprovado", async ({ app }) => {
    const order: OrderDetails = {
      number: "VLO-DX7A9N",
      status: "REPROVADO",
      color: "Lunar White",
      wheels: "aero Wheels",
      customer: {
        name: "Nick de Souza Pereira",
        email: "nick@gmail.com",
      },
      payment: "À Vista",
    };

    await app.orderLookup.searchOrder(order.number);
    await app.orderLookup.validateOrderDetails(order);
    await app.orderLookup.validateStatusBadge(order.status);
  });

  test("deve consultar um pedido em analise", async ({ app }) => {
    const order: OrderDetails = {
      number: "VLO-GBJNTP",
      status: "EM_ANALISE",
      color: "Glacier Blue",
      wheels: "aero Wheels",
      customer: {
        name: "Letícia de Souza Pereira",
        email: "lets@gmail.com",
      },
      payment: "À Vista",
    };

    await app.orderLookup.searchOrder(order.number);
    await app.orderLookup.validateOrderDetails(order);
    await app.orderLookup.validateStatusBadge(order.status);
  });

  test("deve exibir mensagem quando o pedido não é encontrado", async ({
    app,
  }) => {
    const order = generateOrderCode();
    await app.orderLookup.searchOrder(order);
    await app.orderLookup.validateOrderNotFound();
  });

  test("deve exibir mensagem quando o código do pedido está fora do padrão", async ({
    app,
  }) => {
    const orderCode = "XYZ-999-INVALIDO";
    await app.orderLookup.searchOrder(orderCode);
    await app.orderLookup.validateOrderNotFound();
  });

  test("deve manter o botão de busca desabilitado com campo vazio ou apenas espaços", async ({
    app,
    page,
  }) => {
    const button = app.orderLookup.elements.searchButton;
    await expect(button).toBeDisabled();

    await app.orderLookup.elements.orderInput.fill("     ");
    await expect(button).toBeDisabled();
  });
});
