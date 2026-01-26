/**
 * Example authentication E2E tests with Playwright.
 */
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    // Start from login page for each test
    await page.goto("/login");
  });

  test("displays login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();

    // Wait for navigation
    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  });

  test("invalid email shows validation error", async ({ page }) => {
    await page.getByLabel("Email").fill("invalid-email");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Invalid email address")).toBeVisible();
    await expect(page).toHaveURL("/login"); // Still on login page
  });

  test("wrong password shows error message", async ({ page }) => {
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toContainText("Invalid credentials");
  });

  test("empty form shows required field errors", async ({ page }) => {
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("forgot password link navigates to reset page", async ({ page }) => {
    await page.getByRole("link", { name: "Forgot password?" }).click();

    await expect(page).toHaveURL("/forgot-password");
    await expect(
      page.getByRole("heading", { name: "Reset password" })
    ).toBeVisible();
  });

  test("signup link navigates to registration", async ({ page }) => {
    await page.getByRole("link", { name: "Sign up" }).click();

    await expect(page).toHaveURL("/signup");
    await expect(
      page.getByRole("heading", { name: "Create account" })
    ).toBeVisible();
  });
});

test.describe("Authenticated user", () => {
  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto("/login");
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("can log out", async ({ page }) => {
    await page.getByRole("button", { name: "Logout" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });

  test("session persists on page reload", async ({ page }) => {
    await page.reload();

    await expect(page).toHaveURL("/dashboard");
    await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  });

  test("cannot access login page when authenticated", async ({ page }) => {
    await page.goto("/login");

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Protected routes", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/.*login/);
  });

  test("redirects back after login", async ({ page }) => {
    // Try to access protected page
    await page.goto("/settings");

    // Redirected to login
    await expect(page).toHaveURL(/.*login.*redirect/);

    // Log in
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();

    // Redirected back to original destination
    await expect(page).toHaveURL("/settings");
  });
});
