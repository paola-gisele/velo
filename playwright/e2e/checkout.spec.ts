import { test, expect } from "../support/fixtures";
import { deleteOrdersByEmail } from "../support/database/orderRepository";

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
        name: "Email",
        lastname: "Invalido",
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
        name: "CPF",
        lastname: "Invalido",
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
        name: "Termos",
        lastname: "NaoAceitos",
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
    test.beforeEach(async ({ app }) => {
      await app.common.navigateToConfigurator();
    });

    test("A VISTA - deve criar pedido com sucesso usando pagamento à vista", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Nick",
        lastname: "Avista",
        email: "pagamento@confirmacao.com",
        phone: "(11) 99999-9999",
        document: "736.043.170-02",
        store: "Velô Paulista",
        paymentMethod: "avista" as const,
        totalPrice: "R$ 40.000,00",
      };

      await deleteOrdersByEmail(customer.email);

      await app.configurator.expectPrice(customer.totalPrice);
      await app.configurator.finishConfigurator();
      await app.checkout.expectLoaded();

      await expect(page).toHaveURL("/order");

      await app.checkout.fillCustomerlData({
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
      });
      await app.checkout.selectStore(customer.store);
      await app.checkout.selectPaymentMethod(customer.paymentMethod);
      await app.checkout.expectSummaryTotal(customer.totalPrice);
      await app.checkout.expectPaymentMethodPrice(
        customer.paymentMethod,
        customer.totalPrice,
      );

      await app.checkout.acceptTerms();
      await expect(app.checkout.elements.terms).toBeChecked();

      await app.checkout.submit();

      await app.checkout.expectOrderProcessingAndStatus("Pedido Aprovado!");
    });

    test("FINANCIADO - deve APROVAR automaticamente o pedido quando o score do CPF for maior que 700 no financiamento.", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Score",
        lastname: "Alto",
        email: "financiamento@test.com",
        phone: "(11) 99999-9999",
        document: "201.744.880-09",
        store: "Velô Paulista",
        paymentMethod: "financiamento" as const,
        totalPrice: "R$ 40.000,00",
      };

      await deleteOrdersByEmail(customer.email);

      await app.mock.creditAnalysis(710);

      await app.configurator.expectPrice(customer.totalPrice);
      await app.configurator.finishConfigurator();
      await app.checkout.expectLoaded();

      await expect(page).toHaveURL("/order");

      await app.checkout.fillCustomerlData({
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
      });
      await app.checkout.selectStore(customer.store);
      await app.checkout.selectPaymentMethod(customer.paymentMethod);
      await app.checkout.acceptTerms();
      await expect(app.checkout.elements.terms).toBeChecked();

      await app.checkout.submit();

      await app.checkout.expectOrderProcessingAndStatus("Pedido Aprovado!");
    });

    test("FINANCIADO - deve deixar o pedido EM ANÁLISE quando o score do CPF for entre 501 e 700 no financiamento", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Score",
        lastname: "Medio",
        email: "emanalise@test.com",
        phone: "(11) 99999-9999",
        document: "201.744.880-09",
        store: "Velô Paulista",
        paymentMethod: "financiamento" as const,
        totalPrice: "R$ 40.000,00",
      };

      await deleteOrdersByEmail(customer.email);

      await app.mock.creditAnalysis(650);

      await app.configurator.expectPrice(customer.totalPrice);
      await app.configurator.finishConfigurator();
      await app.checkout.expectLoaded();

      await expect(page).toHaveURL("/order");

      await app.checkout.fillCustomerlData({
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
      });
      await app.checkout.selectStore(customer.store);
      await app.checkout.selectPaymentMethod(customer.paymentMethod);

      await app.checkout.acceptTerms();
      await expect(app.checkout.elements.terms).toBeChecked();

      await app.checkout.submit();

      await app.checkout.expectOrderProcessingAndStatus("Pedido em Análise");
    });

    test("FINANCIADO - deve REPROVAR quando o score do CPF é menor igual 500 sem entrada no financiamento", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Score",
        lastname: "BaixoSemEntrada",
        email: "ct08sementrada@example.com",
        phone: "(11) 99999-9999",
        document: "000.000.141-41",
        store: "Velô Paulista",
        paymentMethod: "financiamento" as const,
        totalPrice: "R$ 40.000,00",
      };

      await deleteOrdersByEmail(customer.email);

      await app.mock.creditAnalysis(450);

      await app.configurator.expectPrice(customer.totalPrice);
      await app.configurator.finishConfigurator();
      await app.checkout.expectLoaded();
      await expect(page).toHaveURL("/order");
      await app.checkout.fillCustomerlData({
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
      });
      await app.checkout.selectStore(customer.store);
      await app.checkout.selectPaymentMethod(customer.paymentMethod);
      await app.checkout.acceptTerms();
      await expect(app.checkout.elements.terms).toBeChecked();

      await app.checkout.submit();
      await expect(
        page.getByRole("button", { name: "Processando..." }),
      ).toBeVisible();
      await expect(page).toHaveURL("/success");

      await expect(page.getByText("Pedido Reprovado")).toBeVisible();
    });

    test("FINANCIADO - deve REPROVAR quando o score do CPF é menor igual 500 com entrada menor 50% no financiamento", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Score",
        lastname: "BaixoEntradaMenor",
        email: "ct08-entrybaixa@example.com",
        phone: "(11) 99999-9999",
        document: "000.000.14141",
        store: "Velô Paulista",
        paymentMethod: "financiamento" as const,
        totalPrice: "R$ 40.000,00",
        entryValue: 8000,
      };

      await deleteOrdersByEmail(customer.email);

      await app.mock.creditAnalysis(450);

      await app.configurator.expectPrice(customer.totalPrice);
      await app.configurator.finishConfigurator();
      await app.checkout.expectLoaded();

      await expect(page).toHaveURL("/order");

      await app.checkout.fillCustomerlData({
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
      });
      await app.checkout.selectStore(customer.store);

      await app.checkout.selectPaymentMethod(customer.paymentMethod);

      await app.checkout.setEntryValue(customer.entryValue);

      await app.checkout.acceptTerms();
      await expect(app.checkout.elements.terms).toBeChecked();

      await app.checkout.submit();

      await app.checkout.expectOrderProcessingAndStatus("Pedido Reprovado");
    });

    test("FINANCIADO - deve APROVAR quando o score do CPF é menor igual 500 com entrada igual 50% no financiamento", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Score",
        lastname: "BaixoEntradaIgual",
        email: "ct08-entryigual@example.com",
        phone: "(11) 99999-9999",
        document: "850.008.000-01",
        store: "Velô Paulista",
        paymentMethod: "financiamento" as const,
        totalPrice: "R$ 40.000,00",
        entryValue: 20000,
      };

      await deleteOrdersByEmail(customer.email);

      await app.mock.creditAnalysis(450);

      await app.configurator.expectPrice(customer.totalPrice);
      await app.configurator.finishConfigurator();
      await app.checkout.expectLoaded();

      await expect(page).toHaveURL("/order");

      await app.checkout.fillCustomerlData({
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
      });
      await app.checkout.selectStore(customer.store);

      await app.checkout.selectPaymentMethod(customer.paymentMethod);

      await app.checkout.setEntryValue(customer.entryValue);

      await app.checkout.acceptTerms();
      await expect(app.checkout.elements.terms).toBeChecked();

      await app.checkout.submit();

      await app.checkout.expectOrderProcessingAndStatus("Pedido Aprovado!");
    });

    test("FINANCIADO - deve APROVAR quando o score do CPF é menor igual 500 com entrada maior 50% no financiamento", async ({
      page,
      app,
    }) => {
      const customer = {
        name: "Score",
        lastname: "BaixoEntradaMaior",
        email: "ct08-entrymaior@example.com",
        phone: "(11) 99999-9999",
        document: "850.008.000-01",
        store: "Velô Paulista",
        paymentMethod: "financiamento" as const,
        totalPrice: "R$ 40.000,00",
        entryValue: 25000,
      };

      await deleteOrdersByEmail(customer.email);

      await app.mock.creditAnalysis(450);

      await app.configurator.expectPrice(customer.totalPrice);
      await app.configurator.finishConfigurator();
      await app.checkout.expectLoaded();

      await expect(page).toHaveURL("/order");

      await app.checkout.fillCustomerlData({
        name: customer.name,
        lastname: customer.lastname,
        email: customer.email,
        phone: customer.phone,
        document: customer.document,
      });
      await app.checkout.selectStore(customer.store);

      await app.checkout.selectPaymentMethod(customer.paymentMethod);

      await app.checkout.setEntryValue(customer.entryValue);

      await app.checkout.acceptTerms();
      await expect(app.checkout.elements.terms).toBeChecked();

      await app.checkout.submit();

      await app.checkout.expectOrderProcessingAndStatus("Pedido Aprovado!");
    });
  });
});
