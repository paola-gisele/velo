import { test, expect } from "@playwright/test";
import { generateOrderCode } from "../support/helpers";
import { OrderLockupPage } from "../support/pages/OrderLuckupPage";

test.describe("Consulta de Pedidos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/");

    // Checkpoint
    await expect(
      page.getByTestId("hero-section").getByRole("heading"),
    ).toContainText("Velô Sprint");

    // Ir para pedido
    await page.getByRole("link", { name: "Consultar Pedido" }).click();

    // Checkpoint
    await expect(page.getByRole("heading")).toContainText("Consultar Pedido");
  });

  test("deve consultar um pedido aprovado", async ({ page }) => {
    // Test Data
    // const order = "VLO-SY95U0";

    const order = {
      number: "VLO-SY95U0",
      color: "Midnight Black",
      wheels: "sport Wheels",
      status: "APROVADO" as const,
      customer: {
        name: "Gisele De Souza",
        email: "giseleps@ciandt.com",
      },
      payment: "À Vista",
    };

    const orderLockupPage = new OrderLockupPage(page);
    await orderLockupPage.searchOrder(order.number);

    await expect(page.getByText(order.number)).toBeVisible({ timeout: 100000 });
    await expect(
      page.getByTestId("order-result-" + order.number),
    ).toContainText(order.number);

    //Assert
    // const containerPedido = page
    //   .getByRole("paragraph")
    //   .filter({ hasText: /^Pedido$/ })
    //   .locator(".."); // Sobe para o elemento pai (a div que agrupa ambos)

    // await expect(containerPedido).toContainText(order, {
    //   timeout: 100000,
    // });

    // await expect(page.getByText("APROVADO")).toBeVisible();
    // await expect(page.getByTestId("order-result-VLO-SY95U0")).toContainText(
    //   "APROVADO",
    // );

    await orderLockupPage.validateOrderDetails(order);

    await orderLockupPage.validateStatusBadge(order.status);
  });

  test("deve consultar um pedido reprovado", async ({ page }) => {
    // Test Data
    // const order = "VLO-DX7A9N";

    const order = {
      number: "VLO-DX7A9N",
      color: "Lunar White",
      wheels: "aero Wheels",
      status: "REPROVADO" as const,
      customer: {
        name: "Nick de Souza Pereira",
        email: "nick@gmail.com",
      },
      payment: "À Vista",
    };

    const orderLockupPage = new OrderLockupPage(page);
    await orderLockupPage.searchOrder(order.number);

    await expect(page.getByText(order.number)).toBeVisible({ timeout: 100000 });
    await expect(
      page.getByTestId("order-result-" + order.number),
    ).toContainText(order.number);

    await orderLockupPage.validateOrderDetails(order);

    await orderLockupPage.validateStatusBadge(order.status);
  });

  test("deve consultar um pedido em análise", async ({ page }) => {
    const order = {
      number: "VLO-GBJNTP",
      color: "Glacier Blue",
      wheels: "aero Wheels",
      status: "EM_ANALISE" as const,
      customer: {
        name: "Letícia de Souza Pereira",
        email: "lets@gmail.com",
      },
      payment: "À Vista",
    };

    const orderLockupPage = new OrderLockupPage(page);
    await orderLockupPage.searchOrder(order.number);

    await expect(page.getByText(order.number)).toBeVisible({ timeout: 100000 });
    await expect(
      page.getByTestId(`order-result-${order.number}`),
    ).toContainText(order.number);

    await orderLockupPage.validateOrderDetails(order);

    await orderLockupPage.validateStatusBadge(order.status);
  });

  test("deve exibir mensagem quando o pedido não é encontrado", async ({
    page,
  }) => {
    const order = generateOrderCode();

    const orderLockupPage = new OrderLockupPage(page);
    await orderLockupPage.searchOrder(order);

    await orderLockupPage.validateOrderNotFound();
  });

  test("deve exibir mensagem quando o pedido em qualquer formato não é encontrado", async ({
    page,
  }) => {
    const orderLockupPage = new OrderLockupPage(page);
    await orderLockupPage.searchOrder("ABC1234");

    await orderLockupPage.validateOrderNotFound();
  });
});
