/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

import { createCheckoutActions } from "./actions/checkoutActions";
import { createConfiguratorActions } from "./actions/configuratorActions";
import { createOrderLookupActions } from "./actions/orderLookupActions";
import { createCommonActions } from "./actions/commonActions";

type App = {
  checkout: ReturnType<typeof createCheckoutActions>;
  configurator: ReturnType<typeof createConfiguratorActions>;
  orderLookup: ReturnType<typeof createOrderLookupActions>;
  common: ReturnType<typeof createCommonActions>;
};

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      checkout: createCheckoutActions(page),
      configurator: createConfiguratorActions(page),
      orderLookup: createOrderLookupActions(page),
      common: createCommonActions(page),
    };
    await use(app);
  },
});

export { expect } from "@playwright/test";
