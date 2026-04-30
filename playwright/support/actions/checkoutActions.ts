import { Page, expect } from "@playwright/test";

export function createCheckoutActions(page: Page) {
  const terms = page.getByTestId("checkout-terms");

  const alerts = {
    name: page.getByTestId("error-name"),
    lastname: page.getByTestId("error-lastname"),
    email: page.getByTestId("error-email"),
    phone: page.getByTestId("error-phone"),
    document: page.getByTestId("error-document"),
    store: page.getByTestId("error-store"),
    terms: page.getByTestId("error-terms"),
  };

  return {
    elements: {
      terms,
      alerts,
    },

    async expectLoaded() {
      await expect(
        page.getByRole("heading", { name: "Finalizar Pedido" }),
      ).toBeVisible();
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId("summary-total-price")).toHaveText(price);
    },

    async fillCustomerlData(data: {
      name: string;
      lastname: string;
      email: string;
      phone: string;
      document: string;
    }) {
      await page.getByTestId("checkout-name").fill(data.name);
      await page.getByTestId("checkout-lastname").fill(data.lastname);
      await page.getByTestId("checkout-email").fill(data.email);
      await page.getByTestId("checkout-phone").fill(data.phone);
      await page.getByTestId("checkout-document").fill(data.document);
    },

    async selectStore(storeName: string) {
      await page.getByTestId("checkout-store").click();
      await page.getByRole("option", { name: storeName }).click();
    },

    async acceptTerms() {
      await terms.check();
    },

    async setEntryValue(value: number) {
      const inputEntry = page.getByTestId("input-entry-value");
      await inputEntry.fill(String(value));
    },

    async selectPaymentMethod(method: "avista" | "financiamento") {
      const paymentButton = page.getByTestId(`payment-${method}`);
      await expect(paymentButton).toBeVisible();
      await paymentButton.click();
      await expect(paymentButton).toHaveClass(/border-primary/);
    },

    async expectPaymentMethodSelected(method: "avista" | "financiamento") {
      const paymentButton = page.getByTestId(`payment-${method}`);
      await expect(paymentButton).toHaveClass(/border-primary/);
    },

    async expectPaymentMethodPrice(
      method: "avista" | "financiamento",
      price: string,
    ) {
      const paymentButton = page.getByTestId(`payment-${method}`);
      await expect(paymentButton).toContainText(price);
    },

    async submit() {
      await page.getByRole("button", { name: "Confirmar Pedido" }).click();
    },

    async simulateCreditAnalysisResponse(score: number) {
      await page.route(
        "**/functions/v1/credit-analysis",
        async (route) =>
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              status: "Done",
              score: score,
            }),
          }),
      );
    },

    async expectOrderProcessingAndStatus(statusMessage: string) {
      await expect(
        page.getByRole("button", { name: "Processando..." }),
      ).toBeVisible();
      await expect(page).toHaveURL("/success");
      await expect(page.getByText(statusMessage)).toBeVisible();
    },
  };
}
