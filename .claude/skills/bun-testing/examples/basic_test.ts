/**
 * Basic Bun test file demonstrating core testing patterns.
 */
import { describe, test, expect, beforeEach, afterEach } from "bun:test";

// Simple test
test("2 + 2 equals 4", () => {
  expect(2 + 2).toBe(4);
});

// Describe block for grouping
describe("Math operations", () => {
  test("addition", () => {
    expect(1 + 1).toBe(2);
  });

  test("subtraction", () => {
    expect(5 - 3).toBe(2);
  });

  test("multiplication", () => {
    expect(3 * 4).toBe(12);
  });
});

// Lifecycle hooks
describe("with setup and teardown", () => {
  let data: string[];

  beforeEach(() => {
    data = ["initial"];
  });

  afterEach(() => {
    data = [];
  });

  test("starts with initial data", () => {
    expect(data).toContain("initial");
  });

  test("can add items", () => {
    data.push("new item");
    expect(data).toHaveLength(2);
  });
});

// Common matchers
describe("matchers", () => {
  test("equality", () => {
    expect(1).toBe(1);
    expect({ a: 1 }).toEqual({ a: 1 });
  });

  test("truthiness", () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
  });

  test("numbers", () => {
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
    expect(0.1 + 0.2).toBeCloseTo(0.3);
  });

  test("strings", () => {
    expect("hello world").toContain("world");
    expect("hello").toMatch(/^hel/);
  });

  test("arrays", () => {
    expect([1, 2, 3]).toContain(2);
    expect([1, 2, 3]).toHaveLength(3);
  });
});

// Test modifiers
describe("modifiers", () => {
  test.skip("skipped test", () => {
    // This won't run
  });

  test.todo("implement this later");

  // Uncomment to run only this test:
  // test.only("focused test", () => {
  //   expect(true).toBe(true);
  // });
});

// Parameterized tests
describe("parameterized", () => {
  test.each([
    [1, 1, 2],
    [2, 3, 5],
    [10, 20, 30],
  ])("%d + %d = %d", (a, b, expected) => {
    expect(a + b).toBe(expected);
  });
});

// Error testing
describe("errors", () => {
  test("throws error", () => {
    expect(() => {
      throw new Error("Something went wrong");
    }).toThrow("Something went wrong");
  });

  test("throws specific error type", () => {
    expect(() => {
      throw new TypeError("Invalid type");
    }).toThrow(TypeError);
  });
});
