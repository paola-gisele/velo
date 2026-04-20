import { Page, expect } from "@playwright/test";

export function createConfiguratorActions(page: Page) {
  return {
    async open() {
      await page.goto("/configure");
    },

    async selectColor(name: string) {
      await page.getByRole("button", { name }).click();
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole("button", { name }).click();
    },

    async selectOptional(optionalName: string) {
      await page.getByRole("checkbox", { name: optionalName }).check();
    },

    async unselectOptional(optionalName: string) {
      await page.getByRole("checkbox", { name: optionalName }).uncheck();
    },

    async expectOptionalChecked(optionalName: string) {
      const checkbox = page.getByRole("checkbox", { name: optionalName });
      await expect(checkbox).toBeChecked();
    },

    async expectOptionalUnchecked(optionalName: string) {
      const checkbox = page.getByRole("checkbox", { name: optionalName });
      await expect(checkbox).not.toBeChecked();
    },

    async goToCheckout() {
      await page.getByTestId("checkout-button").click();
      await page.waitForURL("/order");
    },

    async expectPrice(price: string) {
      const priceElement = page.getByTestId("total-price");
      await expect(priceElement).toBeVisible();
      await expect(priceElement).toHaveText(price);
    },

    async expectCarImageSrc(src: string) {
      const carImage = page.locator('img[alt^="Velô Sprint"]');
      await expect(carImage).toHaveAttribute("src", src);
    },
  };
}
