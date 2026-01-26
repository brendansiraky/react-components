# Playwright Configuration

Reference for configuring Playwright tests.

## Basic Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // Test directory
  testDir: "./e2e",

  // Run tests in parallel
  fullyParallel: true,

  // Fail build on CI if test.only left in code
  forbidOnly: !!process.env.CI,

  // Retry failed tests
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: "html",

  // Shared settings for all projects
  use: {
    // Base URL for page.goto()
    baseURL: "http://localhost:3000",

    // Collect trace on first retry
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",
  },

  // Browser projects
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  // Start local dev server before tests
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

## Common Options

### Timeouts

```typescript
export default defineConfig({
  // Global timeout for each test
  timeout: 30000, // 30 seconds

  // Timeout for expect assertions
  expect: {
    timeout: 5000,
  },

  use: {
    // Action timeout (click, fill, etc.)
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,
  },
});
```

### Screenshots and Videos

```typescript
export default defineConfig({
  use: {
    // Screenshots: "off", "on", "only-on-failure"
    screenshot: "only-on-failure",

    // Video: "off", "on", "retain-on-failure", "on-first-retry"
    video: "retain-on-failure",

    // Trace: "off", "on", "retain-on-failure", "on-first-retry"
    trace: "retain-on-failure",
  },
});
```

### Viewport and Device Emulation

```typescript
import { devices } from "@playwright/test";

export default defineConfig({
  projects: [
    // Desktop
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },

    // Tablet
    {
      name: "Tablet",
      use: { ...devices["iPad Pro 11"] },
    },
  ],
});
```

### Authentication Setup

```typescript
export default defineConfig({
  projects: [
    // Setup project runs first
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    // Main tests use saved auth state
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: ".auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
```

### Base URL and Environment

```typescript
export default defineConfig({
  use: {
    // Base URL - use environment variable with fallback
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    // Extra HTTP headers
    extraHTTPHeaders: {
      "X-Custom-Header": "value",
    },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },
});
```

### Web Server

```typescript
export default defineConfig({
  webServer: {
    // Command to start the server
    command: "npm run dev",

    // URL to wait for before running tests
    url: "http://localhost:3000",

    // Reuse existing server in development
    reuseExistingServer: !process.env.CI,

    // Timeout for server to start
    timeout: 120000,

    // Capture server output
    stdout: "pipe",
    stderr: "pipe",
  },
});
```

### Multiple Servers

```typescript
export default defineConfig({
  webServer: [
    {
      command: "npm run dev:frontend",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev:api",
      url: "http://localhost:4000",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### Reporter Options

```typescript
export default defineConfig({
  // Single reporter
  reporter: "html",

  // Multiple reporters
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "results.xml" }],
  ],
});
```

## Project-Specific Configuration

```typescript
export default defineConfig({
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Override global options
      timeout: 60000,
      retries: 3,
    },

    {
      name: "smoke",
      testMatch: /.*smoke.spec.ts/,
      use: { ...devices["Desktop Chrome"] },
      // Only run critical tests
      timeout: 15000,
    },
  ],
});
```

## Environment Variables

Create `.env` files or set in CI:

```bash
# .env.test
BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

Access in tests:

```typescript
test("uses env vars", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL!;
  await page.getByLabel("Email").fill(email);
});
```

## Global Setup and Teardown

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve("./global-setup"),
  globalTeardown: require.resolve("./global-teardown"),
});

// global-setup.ts
async function globalSetup() {
  // Run once before all tests
  console.log("Setting up...");
}
export default globalSetup;

// global-teardown.ts
async function globalTeardown() {
  // Run once after all tests
  console.log("Cleaning up...");
}
export default globalTeardown;
```
