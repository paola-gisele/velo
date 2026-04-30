import { Page, expect } from "@playwright/test";

export function createCommonActions(page: Page) {
  return {
    async navigateToConfigurator() {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.getByRole("link", { name: "Configure Agora" }).click();
      await expect(page).toHaveURL("/configure");
    },
  };
}
