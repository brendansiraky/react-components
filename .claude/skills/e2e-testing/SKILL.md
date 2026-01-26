---
name: E2E Testing
description: This skill should be used when the user asks to "write e2e test", "end-to-end test", "browser test", "playwright test", "test user flow", "test login flow", "integration test", "test the website", "test in browser", or needs guidance on testing complete user workflows in a real browser environment.
---

# E2E Testing with Playwright

Provides guidance for writing end-to-end tests using Playwright to test complete user workflows in real browsers.

## When to Use E2E Tests

Use Playwright for testing complete user flows that span multiple pages:

- **Authentication flows** - login, signup, password reset
- **Critical user journeys** - checkout, onboarding, form submissions
- **Cross-page interactions** - navigation, redirects, deep linking
- **Visual verification** - screenshots, layout checks

For other test types:
- **Non-UI code** (utilities, API, business logic) → Use `bun test`
- **React components** (isolated component behavior) → Use Vitest

## Project Conventions

### File Location

Place E2E tests in the `e2e/` directory:

```
e2e/
  auth.spec.ts        # Authentication flows
  checkout.spec.ts    # Checkout flow
  onboarding.spec.ts  # User onboarding
  playwright.config.ts
```

### Test Coverage Approach

When writing E2E tests, cover:

1. **Happy paths** - Primary user flows work correctly
2. **Error handling** - Appropriate error messages display
3. **Edge cases** - Empty states, boundary conditions
4. **Cross-browser** - Test across Chrome, Firefox, Safari if needed

## Basic Test Structure

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("user can log in with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  });
});
```

## Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run with visible browser
npx playwright test --headed

# Run specific file
npx playwright test auth.spec.ts

# Run specific test by title
npx playwright test -g "user can log in"

# Run in specific browser
npx playwright test --project=chromium

# Run in UI mode (interactive)
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

## Locators

Use Playwright's built-in locators in priority order:

| Locator | Use Case |
|---------|----------|
| `getByRole` | Buttons, links, headings, inputs |
| `getByLabel` | Form inputs with labels |
| `getByPlaceholder` | Inputs with placeholder text |
| `getByText` | Any visible text |
| `getByTestId` | Last resort with data-testid |

```typescript
// Role-based (preferred)
page.getByRole("button", { name: "Submit" });
page.getByRole("link", { name: "Home" });
page.getByRole("heading", { level: 1 });
page.getByRole("textbox", { name: "Email" });

// Label-based
page.getByLabel("Email address");

// Text-based
page.getByText("Welcome back");

// Test ID (last resort)
page.getByTestId("submit-button");
```

## Actions

```typescript
// Navigation
await page.goto("/path");
await page.goBack();
await page.reload();

// Clicking
await page.getByRole("button").click();
await page.getByRole("link").click();

// Typing
await page.getByLabel("Email").fill("test@example.com");
await page.getByLabel("Search").type("query"); // Types character by character

// Clearing
await page.getByLabel("Email").clear();

// Selecting
await page.getByLabel("Country").selectOption("US");
await page.getByLabel("Country").selectOption({ label: "United States" });

// Checkboxes and radios
await page.getByRole("checkbox").check();
await page.getByRole("checkbox").uncheck();
await page.getByRole("radio", { name: "Option A" }).check();

// Keyboard
await page.keyboard.press("Enter");
await page.keyboard.press("Tab");

// File uploads
await page.getByLabel("Upload").setInputFiles("path/to/file.pdf");
```

## Assertions

Playwright assertions auto-wait until condition is met:

```typescript
// Page assertions
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveTitle("Dashboard");

// Element visibility
await expect(page.getByText("Success")).toBeVisible();
await expect(page.getByText("Error")).not.toBeVisible();
await expect(page.getByText("Loading")).toBeHidden();

// Element state
await expect(page.getByRole("button")).toBeEnabled();
await expect(page.getByRole("button")).toBeDisabled();
await expect(page.getByRole("checkbox")).toBeChecked();

// Text content
await expect(page.getByRole("heading")).toHaveText("Welcome");
await expect(page.getByRole("heading")).toContainText("Welcome");

// Input values
await expect(page.getByLabel("Email")).toHaveValue("test@example.com");

// Attributes
await expect(page.getByRole("link")).toHaveAttribute("href", "/home");

// Count
await expect(page.getByRole("listitem")).toHaveCount(5);
```

## Lifecycle Hooks

```typescript
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeAll(async () => {
    // Once before all tests in this describe block
  });

  test.beforeEach(async ({ page }) => {
    // Before each test - e.g., log in
    await page.goto("/login");
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test.afterEach(async ({ page }) => {
    // After each test
  });

  test.afterAll(async () => {
    // Once after all tests
  });

  test("shows user name", async ({ page }) => {
    await expect(page.getByText("John Doe")).toBeVisible();
  });
});
```

## Waiting

Playwright auto-waits, but explicit waits are sometimes needed:

```typescript
// Wait for navigation
await page.waitForURL("/success");

// Wait for element
await page.waitForSelector(".results");

// Wait for load state
await page.waitForLoadState("networkidle");

// Wait for response
await page.waitForResponse("**/api/users");

// Custom timeout on assertion
await expect(page.getByText("Done")).toBeVisible({ timeout: 10000 });
```

## Screenshots and Debugging

```typescript
// Take screenshot
await page.screenshot({ path: "screenshot.png" });
await page.screenshot({ path: "full.png", fullPage: true });

// Element screenshot
await page.getByRole("form").screenshot({ path: "form.png" });

// Pause for debugging (headed mode)
await page.pause();

// Console logging
page.on("console", (msg) => console.log(msg.text()));
```

## Test Patterns

### Authentication Setup

```typescript
// auth.setup.ts - Run once to create auth state
import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("user@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("/dashboard");

  // Save auth state
  await page.context().storageState({ path: ".auth/user.json" });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { storageState: ".auth/user.json" },
      dependencies: ["setup"],
    },
  ],
});
```

### Page Object Pattern

See `references/page-objects.md` for the page object model pattern.

## CI Configuration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Additional Resources

### Reference Files

- **`references/page-objects.md`** - Page object model pattern
- **`references/config.md`** - Playwright configuration options

### Example Files

- **`examples/auth.spec.ts`** - Authentication flow tests
- **`examples/form.spec.ts`** - Form submission tests
