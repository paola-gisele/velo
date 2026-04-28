import { test, expect } from "../support/fixtures";
import ordersData from "../support/fixtures/orders";
import { deleteOrderByNumber } from "../support/database/orderRepository";

test.describe("Checkout", () => {
  test.describe("Validações de campos obrigatórios", () => {
    let alerts: any;

    test.beforeEach(async ({ app, page }) => {
      await page.goto("/order");
      await expect(
        page.getByRole("heading", { name: "Finalizar Pedido" }),
      ).toBeVisible();

      alerts = app.checkout.elements.alerts;
    });

    test("deve validar obrigatoriedade de todos os campos em branco", async ({
      app,
    }) => {
      await app.checkout.submit();

      await expect(alerts.name).toHaveText(
        "Nome deve ter pelo menos 2 caracteres",
      );
      await expect(alerts.lastname).toHaveText(
        "Sobrenome deve ter pelo menos 2 caracteres",
      );
      await expect(alerts.email).toHaveText("Email inválido");
      await expect(alerts.phone).toHaveText("Telefone inválido");
      await expect(alerts.document).toHaveText("CPF inválido");
      await expect(alerts.store).toHaveText("Selecione uma loja");
      await expect(alerts.terms).toHaveText("Aceite os termos");
    });

    test("deve validar limite mínimo de caracteres para Nome e Sobrenome", async ({
      app,
    }) => {
      const customer = {
        name: "A",
        lastname: "B",
        email: "papito@teste.com",
        document: "00000014141",
        phone: "(11) 99999-9999",
      };

      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");
      await app.checkout.acceptTerms();

      await app.checkout.submit();

      await expect(alerts.name).toHaveText(
        "Nome deve ter pelo menos 2 caracteres",
      );
      await expect(alerts.lastname).toHaveText(
        "Sobrenome deve ter pelo menos 2 caracteres",
      );
    });

    test("deve exibir erro para e-mail com formato inválido", async ({
      app,
    }) => {
      const customer = {
        name: "Fernando",
        lastname: "Papito",
        email: "papito@.com",
        document: "00000014141",
        phone: "(11) 99999-9999",
      };

      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");
      await app.checkout.acceptTerms();

      await app.checkout.submit();

      await expect(alerts.email).toHaveText("Email inválido");
    });

    test("deve exibir erro para CPF inválido", async ({ app }) => {
      const customer = {
        name: "Fernando",
        lastname: "Papito",
        email: "papito@test.com",
        document: "00000014199",
        phone: "(11) 99999-9999",
      };

      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");
      await app.checkout.acceptTerms();

      await app.checkout.submit();

      await expect(alerts.document).toHaveText("CPF inválido");
    });

    test("deve exigir o aceite dos termos ao finalizar com dados válidos", async ({
      app,
    }) => {
      const customer = {
        name: "Fernando",
        lastname: "Papito",
        email: "papito@test.com",
        document: "00000014199",
        phone: "(11) 99999-9999",
      };

      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");

      await expect(app.checkout.elements.terms).not.toBeChecked();

      await app.checkout.submit();

      await expect(alerts.terms).toHaveText("Aceite os termos");
    });
  });

  test.describe("Pagamento e Confirmação", () => {
    test("deve criar pedido com sucesso usando pagamento à vista - Fluxo E2E completo", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Fernando",
        lastname: "Papito",
        email: ordersData.aprovado.customer.email,
        phone: ordersData.aprovado.customer.phone,
        document: ordersData.aprovado.customer.document,
        store: "Velô Paulista",
        paymentMethod: "avista" as const,
        totalPrice: "R$ 40.000,00",
      };

      let createdOrderNumber: string | null = null;

      try {
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await page.getByRole("link", { name: "Configure Agora" }).click();

        await app.configurator.expectPrice(customer.totalPrice);
        await app.configurator.finishConfigurator();
        await app.checkout.expectLoaded();

        await expect(page).toHaveURL("/order");

        await app.checkout.fillCustomerlData(customer);
        await app.checkout.selectStore(customer.store);
        await app.checkout.selectPaymentMethod("avista");
        await app.checkout.expectSummaryTotal(customer.totalPrice);
        await app.checkout.expectPaymentMethodPrice(
          customer.paymentMethod,
          customer.totalPrice,
        );

        await app.checkout.acceptTerms();
        await expect(app.checkout.elements.terms).toBeChecked();

        await app.checkout.submit();

        await expect(
          page.getByRole("button", { name: "Processando..." }),
        ).toBeVisible();

        await expect(page).toHaveURL("/success");
        await expect(page.getByText("Pedido Aprovado!")).toBeVisible();

        const orderNumberPattern = /VLO-[A-Z0-9]{6}/;
        const orderElement = page.getByText(orderNumberPattern);
        await expect(orderElement).toBeVisible();
        createdOrderNumber = await orderElement.textContent();
      } finally {
        if (createdOrderNumber) {
          await deleteOrderByNumber(createdOrderNumber);
        }
      }
    });
  });
});
