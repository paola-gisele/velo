import { test, expect } from "../support/fixtures";

test.describe("Checkout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/order");
    await expect(
      page.getByRole("heading", { name: "Finalizar Pedido" }),
    ).toBeVisible();
  });

  test.describe("Validações de campos obrigatórios", () => {
    let alerts: any;

    test.beforeEach(async ({ app }) => {
      alerts = app.checkout.elements.alerts;
    });

    test("deve validar obrigatoriedade de todos os campos em branco", async ({
      app,
    }) => {
      // Act
      await app.checkout.submit();

      // Assert
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

      // Arrange
      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");
      await app.checkout.acceptTerms();

      // Act
      await app.checkout.submit();

      // Assert
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

      // Arrange
      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");
      await app.checkout.acceptTerms();

      // Act
      await app.checkout.submit();

      // Assert
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

      // Arrange
      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");
      await app.checkout.acceptTerms();

      // Act
      await app.checkout.submit();

      // Assert
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

      // Arrange
      await app.checkout.fillCustomerlData(customer);
      await app.checkout.selectStore("Velô Paulista");

      await expect(app.checkout.elements.terms).not.toBeChecked();

      // Act
      await app.checkout.submit();

      // Assert
      await expect(alerts.terms).toHaveText("Aceite os termos");
    });
  });
});
