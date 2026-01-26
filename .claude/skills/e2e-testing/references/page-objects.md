# Page Object Model Pattern

Organize E2E tests using the Page Object Model (POM) for maintainable, reusable test code.

## Why Page Objects

- **DRY** - Centralize selectors and actions
- **Maintainable** - Update selectors in one place
- **Readable** - Tests describe user intent, not implementation

## Basic Page Object

```typescript
// pages/login.page.ts
import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: "Log in" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

## Using Page Objects in Tests

```typescript
// tests/auth.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test.describe("Authentication", () => {
  test("successful login redirects to dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("user@example.com", "password123");

    await expect(page).toHaveURL("/dashboard");
  });

  test("invalid credentials shows error", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("user@example.com", "wrongpassword");

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText("Invalid credentials");
  });
});
```

## Page Object with Components

For reusable UI components that appear on multiple pages:

```typescript
// components/navigation.component.ts
import { type Page, type Locator } from "@playwright/test";

export class NavigationComponent {
  readonly page: Page;
  readonly homeLink: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeLink = page.getByRole("link", { name: "Home" });
    this.profileLink = page.getByRole("link", { name: "Profile" });
    this.logoutButton = page.getByRole("button", { name: "Logout" });
    this.searchInput = page.getByRole("searchbox");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press("Enter");
  }

  async logout() {
    await this.logoutButton.click();
  }
}
```

```typescript
// pages/dashboard.page.ts
import { type Page, type Locator } from "@playwright/test";
import { NavigationComponent } from "../components/navigation.component";

export class DashboardPage {
  readonly page: Page;
  readonly navigation: NavigationComponent;
  readonly welcomeHeading: Locator;
  readonly statsCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = new NavigationComponent(page);
    this.welcomeHeading = page.getByRole("heading", { name: /welcome/i });
    this.statsCards = page.getByTestId("stats-card");
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async getStatsCount() {
    return await this.statsCards.count();
  }
}
```

## Page Object with Assertions

Include assertion helpers for common checks:

```typescript
// pages/checkout.page.ts
import { type Page, type Locator, expect } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.getByRole("listitem");
    this.totalPrice = page.getByTestId("total-price");
    this.checkoutButton = page.getByRole("button", { name: "Checkout" });
    this.successMessage = page.getByText("Order confirmed");
  }

  async goto() {
    await this.page.goto("/checkout");
  }

  async expectItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectTotalPrice(amount: string) {
    await expect(this.totalPrice).toHaveText(amount);
  }

  async completeCheckout() {
    await this.checkoutButton.click();
    await expect(this.successMessage).toBeVisible();
  }
}
```

## Fixture-Based Page Objects

Use Playwright fixtures for automatic page object creation:

```typescript
// fixtures.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "./pages/login.page";
import { DashboardPage } from "./pages/dashboard.page";

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from "@playwright/test";
```

```typescript
// tests/dashboard.spec.ts
import { test, expect } from "../fixtures";

test("dashboard shows welcome message", async ({ dashboardPage }) => {
  await dashboardPage.goto();
  await expect(dashboardPage.welcomeHeading).toBeVisible();
});
```

## Directory Structure

```
e2e/
├── fixtures.ts           # Custom fixtures
├── pages/
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── checkout.page.ts
├── components/
│   └── navigation.component.ts
├── tests/
│   ├── auth.spec.ts
│   ├── dashboard.spec.ts
│   └── checkout.spec.ts
└── playwright.config.ts
```

## Best Practices

### Do

- Keep page objects focused on one page/component
- Use descriptive locator names
- Return page objects from navigation methods for chaining
- Include common assertions as helper methods

### Don't

- Put test logic in page objects
- Make page objects too granular
- Duplicate selectors across page objects
- Include assertions that aren't reusable

### Navigation Chaining

```typescript
export class LoginPage {
  // ... fields and constructor

  async loginAndGoToDashboard(email: string, password: string) {
    await this.login(email, password);
    await this.page.waitForURL("/dashboard");
    return new DashboardPage(this.page);
  }
}

// Usage
test("login flow", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const dashboardPage = await loginPage.loginAndGoToDashboard(
    "user@example.com",
    "password"
  );

  await expect(dashboardPage.welcomeHeading).toBeVisible();
});
```
