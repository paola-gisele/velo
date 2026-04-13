import { test, expect } from "@playwright/test";
import { generateOrderCode } from "../suport/helpers";

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
      status: "APROVADO",
      customer: {
        name: "Gisele De Souza",
        email: "giseleps@ciandt.com",
      },
      payment: "À Vista",
    };

    await page
      .getByRole("textbox", { name: "Número do Pedido" })
      .fill(order.number);
    await page.getByRole("button", { name: "Buscar Pedido" }).click();

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

    await expect(page.getByTestId(`order-result-${order.number}`))
      .toMatchAriaSnapshot(`
    - img
    - paragraph: Pedido
    - paragraph: ${order.number}
    - img
    - text: ${order.status}
    - img "Velô Sprint"
    - paragraph: Modelo
    - paragraph: Velô Sprint
    - paragraph: Cor
    - paragraph: ${order.color}
    - paragraph: Interior
    - paragraph: cream
    - paragraph: Rodas
    - paragraph: ${order.wheels}
    - heading "Dados do Cliente" [level=4]
    - paragraph: Nome
    - paragraph: ${order.customer.name}
    - paragraph: Email
    - paragraph: ${order.customer.email}
    - paragraph: Loja de Retirada
    - paragraph
    - paragraph: Data do Pedido
    - paragraph: /\\d+\\/\\d+\\/\\d+/
    - heading "Pagamento" [level=4]
    - paragraph: ${order.payment}
    - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `);
  });

  test("deve consultar um pedido reprovado", async ({ page }) => {
    // Test Data
    // const order = "VLO-DX7A9N";

    const order = {
      number: "VLO-DX7A9N",
      color: "Lunar White",
      wheels: "aero Wheels",
      status: "REPROVADO",
      customer: {
        name: "Nick de Souza Pereira",
        email: "nick@gmail.com",
      },
      payment: "À Vista",
    };

    await page
      .getByRole("textbox", { name: "Número do Pedido" })
      .fill(order.number);
    await page.getByRole("button", { name: "Buscar Pedido" }).click();

    await expect(page.getByText(order.number)).toBeVisible({ timeout: 100000 });
    await expect(
      page.getByTestId("order-result-" + order.number),
    ).toContainText(order.number);

    await expect(page.getByTestId(`order-result-${order.number}`))
      .toMatchAriaSnapshot(`
    - img
    - paragraph: Pedido
    - paragraph: ${order.number}
    - img
    - text: ${order.status}
    - img "Velô Sprint"
    - paragraph: Modelo
    - paragraph: Velô Sprint
    - paragraph: Cor
    - paragraph: ${order.color}
    - paragraph: Interior
    - paragraph: cream
    - paragraph: Rodas
    - paragraph: ${order.wheels}
    - heading "Dados do Cliente" [level=4]
    - paragraph: Nome
    - paragraph: ${order.customer.name}
    - paragraph: Email
    - paragraph: ${order.customer.email}
    - paragraph: Loja de Retirada
    - paragraph
    - paragraph: Data do Pedido
    - paragraph: /\\d+\\/\\d+\\/\\d+/
    - heading "Pagamento" [level=4]
    - paragraph: ${order.payment}
    - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `);
  });

  test("deve exibir mensagem quando o pedido não é encontrado", async ({
    page,
  }) => {
    const order = generateOrderCode();

    await page.getByRole("textbox", { name: "Número do Pedido" }).fill(order);
    await page.getByRole("button", { name: "Buscar Pedido" }).click();

    await expect(page.locator("#root")).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `);
  });
});
