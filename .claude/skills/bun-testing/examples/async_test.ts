/**
 * Async testing patterns with Bun test runner.
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("basic async patterns", () => {
  test("async/await", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  test("promise resolves", async () => {
    await expect(Promise.resolve("value")).resolves.toBe("value");
  });

  test("promise rejects", async () => {
    await expect(Promise.reject(new Error("failed"))).rejects.toThrow("failed");
  });

  test("async function that throws", async () => {
    const asyncThrow = async () => {
      throw new Error("Async error");
    };

    await expect(asyncThrow()).rejects.toThrow("Async error");
  });
});

describe("concurrent tests", () => {
  // These run in parallel with each other
  test.concurrent("fetch data 1", async () => {
    await new Promise((r) => setTimeout(r, 100));
    expect(true).toBe(true);
  });

  test.concurrent("fetch data 2", async () => {
    await new Promise((r) => setTimeout(r, 100));
    expect(true).toBe(true);
  });

  test.concurrent("fetch data 3", async () => {
    await new Promise((r) => setTimeout(r, 100));
    expect(true).toBe(true);
  });
});

describe("serial tests with shared state", () => {
  let counter = 0;

  // These must run in order
  test.serial("first increment", () => {
    counter += 1;
    expect(counter).toBe(1);
  });

  test.serial("second increment", () => {
    counter += 1;
    expect(counter).toBe(2);
  });

  test.serial("third increment", () => {
    counter += 1;
    expect(counter).toBe(3);
  });
});

describe("async lifecycle hooks", () => {
  let server: { url: string; close: () => Promise<void> };

  beforeAll(async () => {
    // Simulate starting a server
    server = {
      url: "http://localhost:3000",
      close: async () => {},
    };
  });

  afterAll(async () => {
    await server.close();
  });

  test("server is available", () => {
    expect(server.url).toBeDefined();
  });
});

describe("timeout handling", () => {
  test("completes within timeout", async () => {
    await new Promise((r) => setTimeout(r, 50));
    expect(true).toBe(true);
  });

  // This test would fail with default 5000ms timeout
  // test("slow test", async () => {
  //   await new Promise(r => setTimeout(r, 10000));
  //   expect(true).toBe(true);
  // }, 15000); // Custom timeout
});

describe("practical async patterns", () => {
  // Example: Testing API calls
  test("mock API call", async () => {
    const fetchUser = async (id: number) => {
      // Simulated API response
      return { id, name: "Test User", email: "test@example.com" };
    };

    const user = await fetchUser(1);

    expect(user).toEqual({
      id: 1,
      name: "Test User",
      email: "test@example.com",
    });
  });

  // Example: Testing retry logic
  test("retry on failure", async () => {
    let attempts = 0;

    const unreliableOperation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("Temporary failure");
      }
      return "success";
    };

    const retry = async (fn: () => Promise<string>, maxAttempts: number) => {
      for (let i = 0; i < maxAttempts; i++) {
        try {
          return await fn();
        } catch (e) {
          if (i === maxAttempts - 1) throw e;
        }
      }
    };

    const result = await retry(unreliableOperation, 5);
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  // Example: Testing race conditions
  test("parallel operations", async () => {
    const results = await Promise.all([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ]);

    expect(results).toEqual([1, 2, 3]);
  });

  // Example: Testing timeouts
  test("operation with timeout", async () => {
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), ms);
      });
      return Promise.race([promise, timeout]);
    };

    // Fast operation succeeds
    const fast = withTimeout(Promise.resolve("done"), 1000);
    await expect(fast).resolves.toBe("done");

    // Slow operation times out
    const slow = withTimeout(
      new Promise((r) => setTimeout(() => r("done"), 100)),
      10
    );
    await expect(slow).rejects.toThrow("Timeout");
  });
});

describe("event-based async", () => {
  test("event emitter pattern", async () => {
    // Simple event emitter for testing
    class EventEmitter {
      private listeners: Map<string, Function[]> = new Map();

      on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
          this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
      }

      emit(event: string, data: any) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach((cb) => cb(data));
      }
    }

    const emitter = new EventEmitter();

    const dataReceived = new Promise<string>((resolve) => {
      emitter.on("data", resolve);
    });

    // Emit after a small delay
    setTimeout(() => emitter.emit("data", "test value"), 10);

    const result = await dataReceived;
    expect(result).toBe("test value");
  });
});
