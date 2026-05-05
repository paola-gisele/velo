/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

import { createCheckoutActions } from "./actions/checkoutActions";
import { createConfiguratorActions } from "./actions/configuratorActions";
import { createOrderLookupActions } from "./actions/orderLookupActions";
import { createCommonActions } from "./actions/commonActions";
import { mockCreditAlalysis } from "./fixtures/mock.api";

type App = {
  checkout: ReturnType<typeof createCheckoutActions>;
  configurator: ReturnType<typeof createConfiguratorActions>;
  orderLookup: ReturnType<typeof createOrderLookupActions>;
  common: ReturnType<typeof createCommonActions>;
  mock: {
    creditAnalysis: (score: number) => Promise<void>;
  };
};

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      checkout: createCheckoutActions(page),
      configurator: createConfiguratorActions(page),
      orderLookup: createOrderLookupActions(page),
      common: createCommonActions(page),
      mock: {
        creditAnalysis: async (score: number) =>
          await mockCreditAlalysis(page, score),
      },
    };
    await use(app);
  },
});

export { expect } from "@playwright/test";
