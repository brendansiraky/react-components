/**
 * Mocking patterns with Bun test runner.
 */
import { describe, test, expect, mock, spyOn, beforeEach } from "bun:test";

describe("mock functions", () => {
  test("basic mock", () => {
    const mockFn = mock(() => "mocked");

    expect(mockFn()).toBe("mocked");
    expect(mockFn).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("mock with arguments", () => {
    const mockFn = mock((a: number, b: number) => a + b);

    expect(mockFn(2, 3)).toBe(5);
    expect(mockFn).toHaveBeenCalledWith(2, 3);
  });

  test("mock return values", () => {
    const mockFn = mock(() => "default");

    // Override return value
    mockFn.mockReturnValue("overridden");
    expect(mockFn()).toBe("overridden");

    // One-time return values
    mockFn.mockReturnValueOnce("first").mockReturnValueOnce("second");
    expect(mockFn()).toBe("first");
    expect(mockFn()).toBe("second");
    expect(mockFn()).toBe("overridden"); // Back to default
  });

  test("mock implementation", () => {
    const mockFn = mock(() => 0);

    mockFn.mockImplementation((x: number) => x * 2);
    expect(mockFn(5)).toBe(10);

    mockFn.mockImplementationOnce((x: number) => x * 3);
    expect(mockFn(5)).toBe(15);
    expect(mockFn(5)).toBe(10); // Back to previous implementation
  });

  test("jest.fn() works identically", () => {
    const { jest } = await import("bun:test");
    const mockFn = jest.fn(() => "jest style");

    expect(mockFn()).toBe("jest style");
    expect(mockFn).toHaveBeenCalled();
  });
});

describe("spyOn", () => {
  const calculator = {
    add: (a: number, b: number) => a + b,
    multiply: (a: number, b: number) => a * b,
  };

  test("spy on method", () => {
    const spy = spyOn(calculator, "add");

    const result = calculator.add(2, 3);

    expect(result).toBe(5); // Original implementation runs
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(2, 3);

    spy.mockRestore();
  });

  test("spy and override implementation", () => {
    const spy = spyOn(calculator, "multiply").mockImplementation(() => 100);

    expect(calculator.multiply(2, 3)).toBe(100); // Overridden
    expect(spy).toHaveBeenCalledWith(2, 3);

    spy.mockRestore();
    expect(calculator.multiply(2, 3)).toBe(6); // Original restored
  });
});

describe("mock assertions", () => {
  test("call count assertions", () => {
    const mockFn = mock(() => {});

    mockFn();
    mockFn();
    mockFn();

    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  test("call argument assertions", () => {
    const mockFn = mock((name: string, age: number) => {});

    mockFn("Alice", 30);
    mockFn("Bob", 25);

    // Last call
    expect(mockFn).toHaveBeenLastCalledWith("Bob", 25);

    // Nth call (1-indexed)
    expect(mockFn).toHaveBeenNthCalledWith(1, "Alice", 30);
    expect(mockFn).toHaveBeenNthCalledWith(2, "Bob", 25);
  });

  test("reset mock", () => {
    const mockFn = mock(() => "value");

    mockFn();
    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(2);

    mockFn.mockReset();
    expect(mockFn).toHaveBeenCalledTimes(0);
  });

  test("clear mock", () => {
    const mockFn = mock(() => "value");
    mockFn.mockReturnValue("custom");

    mockFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    mockFn.mockClear(); // Clears calls but keeps implementation
    expect(mockFn).toHaveBeenCalledTimes(0);
    expect(mockFn()).toBe("custom"); // Implementation preserved
  });
});

describe("practical mocking patterns", () => {
  // Example: Mocking a callback
  test("callback mock", () => {
    const callback = mock(() => {});

    function processItems(items: string[], cb: (item: string) => void) {
      items.forEach(cb);
    }

    processItems(["a", "b", "c"], callback);

    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith("a");
    expect(callback).toHaveBeenCalledWith("b");
    expect(callback).toHaveBeenCalledWith("c");
  });

  // Example: Mocking fetch
  test("mock fetch response", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: 1, name: "Test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const response = await fetch("/api/user");
    const data = await response.json();

    expect(data).toEqual({ id: 1, name: "Test" });
    expect(fetch).toHaveBeenCalledWith("/api/user");

    globalThis.fetch = originalFetch; // Restore
  });

  // Example: Mocking timer
  test("mock Date.now", () => {
    const originalNow = Date.now;
    const fixedTime = 1704067200000; // 2024-01-01

    Date.now = mock(() => fixedTime);

    expect(Date.now()).toBe(fixedTime);

    Date.now = originalNow; // Restore
  });
});
