import { test, expect } from "@playwright/test";
import { time } from "node:console";

test("deve consultar um pedido aprovado", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // Checkpoint
  await expect(
    page.getByTestId("hero-section").getByRole("heading"),
  ).toContainText("Velô Sprint");

  // Ir para pedido
  await page.getByRole("link", { name: "Consultar Pedido" }).click();

  // Checkpoint
  await expect(page.getByRole("heading")).toContainText("Consultar Pedido");

  await page
    .getByRole("textbox", { name: "Número do Pedido" })
    .fill("VLO-SY95U0");
  await page.getByRole("button", { name: "Buscar Pedido" }).click();

  await expect(page.getByText("VLO-SY95U0")).toBeVisible({ timeout: 100000 });
  await expect(page.getByTestId("order-result-VLO-SY95U0")).toContainText(
    "VLO-SY95U0",
  );

  await expect(page.getByText("APROVADO")).toBeVisible();
  await expect(page.getByTestId("order-result-VLO-SY95U0")).toContainText(
    "APROVADO",
  );
});
