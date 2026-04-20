// import { Page } from "@playwright/test";

const getRandomLetters = (length: number): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

const getRandomNumbers = (length: number): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
};

export function generateOrderCode(): string {
  const prefix = getRandomLetters(3);
  const section1 = getRandomLetters(2);
  const numbers = getRandomNumbers(2);
  const letter = getRandomLetters(1);
  const lastNumber = getRandomNumbers(1);

  return `${prefix}-${section1}${numbers}${letter}${lastNumber}`;
}

// export async function searchOrder(page: Page, orderNumber: string) {
//   await page
//     .getByRole("textbox", { name: "Número do Pedido" })
//     .fill(orderNumber);
//   await page.getByRole("button", { name: "Buscar Pedido" }).click();
// }
