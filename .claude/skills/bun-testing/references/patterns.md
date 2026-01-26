# Bun Testing Patterns

Advanced patterns and techniques for effective testing with Bun.

## Mocking Patterns

### Basic Mock Function

```typescript
import { test, expect, mock } from "bun:test";

const mockFn = mock(() => "default return");

test("basic mock", () => {
  expect(mockFn()).toBe("default return");
  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

### Mock with Implementation

```typescript
import { test, expect, mock } from "bun:test";

const mockFn = mock((x: number) => x * 2);

test("mock with args", () => {
  expect(mockFn(5)).toBe(10);
  expect(mockFn).toHaveBeenCalledWith(5);
});
```

### Mock Return Values

```typescript
import { test, expect, mock } from "bun:test";

const mockFn = mock(() => {});

test("mock return values", () => {
  mockFn.mockReturnValue("static");
  expect(mockFn()).toBe("static");

  mockFn.mockReturnValueOnce("first").mockReturnValueOnce("second");
  expect(mockFn()).toBe("first");
  expect(mockFn()).toBe("second");
  expect(mockFn()).toBe("static"); // Falls back to mockReturnValue
});
```

### Spying on Objects

```typescript
import { test, expect, spyOn } from "bun:test";

const calculator = {
  add: (a: number, b: number) => a + b,
};

test("spy on method", () => {
  const spy = spyOn(calculator, "add");

  calculator.add(2, 3);

  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledWith(2, 3);

  spy.mockRestore(); // Restore original
});
```

### Mocking Modules

```typescript
import { test, expect, mock } from "bun:test";

// Mock before importing the module that uses it
mock.module("./api-client", () => ({
  fetchUser: mock(() => Promise.resolve({ id: 1, name: "Test" })),
}));

import { fetchUser } from "./api-client";

test("mocked module", async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe("Test");
});
```

## Async Testing Patterns

### Basic Async Test

```typescript
import { test, expect } from "bun:test";

test("async with await", async () => {
  const result = await Promise.resolve(42);
  expect(result).toBe(42);
});
```

### Testing Promises

```typescript
import { test, expect } from "bun:test";

test("promise resolves", async () => {
  await expect(Promise.resolve("value")).resolves.toBe("value");
});

test("promise rejects", async () => {
  await expect(Promise.reject(new Error("fail"))).rejects.toThrow("fail");
});
```

### Concurrent Tests for Independent Operations

```typescript
import { test, expect } from "bun:test";

// Run in parallel when tests don't share state
test.concurrent("fetch user", async () => {
  const user = await fetchUser(1);
  expect(user).toBeDefined();
});

test.concurrent("fetch posts", async () => {
  const posts = await fetchPosts();
  expect(posts.length).toBeGreaterThan(0);
});
```

### Serial Tests for Shared State

```typescript
import { test, expect } from "bun:test";

let counter = 0;

test.serial("increment first", () => {
  counter += 1;
  expect(counter).toBe(1);
});

test.serial("increment second", () => {
  counter += 1;
  expect(counter).toBe(2);
});
```

## Lifecycle Hook Patterns

### Test-Level Setup/Teardown

```typescript
import { test, expect, beforeEach, afterEach } from "bun:test";

let db: Database;

beforeEach(async () => {
  db = await createTestDatabase();
});

afterEach(async () => {
  await db.cleanup();
});

test("uses fresh database", async () => {
  await db.insert({ id: 1 });
  expect(await db.count()).toBe(1);
});
```

### Suite-Level Setup/Teardown

```typescript
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("integration tests", () => {
  let server: Server;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("server responds", async () => {
    const response = await fetch(server.url);
    expect(response.ok).toBe(true);
  });
});
```

### Global Setup with Preload

```typescript
// setup.ts
import { beforeAll, afterAll } from "bun:test";

beforeAll(() => {
  console.log("Global setup");
});

afterAll(() => {
  console.log("Global teardown");
});
```

Run with: `bun test --preload ./setup.ts`

## Parameterized Testing

### Basic Each

```typescript
import { test, expect } from "bun:test";

test.each([
  [1, 1, 2],
  [2, 3, 5],
  [0, 0, 0],
])("add(%d, %d) = %d", (a, b, expected) => {
  expect(a + b).toBe(expected);
});
```

### Objects in Each

```typescript
import { test, expect } from "bun:test";

test.each([
  { input: "hello", expected: 5 },
  { input: "world", expected: 5 },
  { input: "", expected: 0 },
])("length of '$input' is $expected", ({ input, expected }) => {
  expect(input.length).toBe(expected);
});
```

### Describe Each

```typescript
import { describe, test, expect } from "bun:test";

describe.each([
  { name: "Firefox", version: 100 },
  { name: "Chrome", version: 120 },
])("$name browser", ({ name, version }) => {
  test("has name", () => {
    expect(name).toBeDefined();
  });

  test("has valid version", () => {
    expect(version).toBeGreaterThan(0);
  });
});
```

## Snapshot Testing Patterns

### Basic Snapshot

```typescript
import { test, expect } from "bun:test";

test("object snapshot", () => {
  const user = {
    id: 1,
    name: "John",
    createdAt: new Date("2024-01-01"),
  };
  expect(user).toMatchSnapshot();
});
```

### Inline Snapshot

```typescript
import { test, expect } from "bun:test";

test("inline snapshot", () => {
  expect({ a: 1 }).toMatchInlineSnapshot(`
    {
      "a": 1,
    }
  `);
});
```

### Property Matchers for Dynamic Values

```typescript
import { test, expect } from "bun:test";

test("snapshot with matchers", () => {
  const user = {
    id: Math.random(),
    name: "John",
    createdAt: new Date(),
  };

  expect(user).toMatchSnapshot({
    id: expect.any(Number),
    createdAt: expect.any(Date),
  });
});
```

## Error Testing Patterns

### Testing Thrown Errors

```typescript
import { test, expect } from "bun:test";

test("throws error", () => {
  expect(() => {
    throw new Error("Something went wrong");
  }).toThrow();
});

test("throws specific error", () => {
  expect(() => {
    throw new Error("Not found");
  }).toThrow("Not found");
});

test("throws error type", () => {
  expect(() => {
    throw new TypeError("Invalid type");
  }).toThrow(TypeError);
});
```

### Async Error Testing

```typescript
import { test, expect } from "bun:test";

test("async throws", async () => {
  await expect(async () => {
    throw new Error("Async error");
  }).rejects.toThrow("Async error");
});

test("promise rejects", async () => {
  const promise = Promise.reject(new Error("Rejected"));
  await expect(promise).rejects.toThrow("Rejected");
});
```

## DOM Testing Setup

### Using Happy-DOM

```typescript
// setup.ts
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
```

```typescript
// component.test.ts
import { test, expect } from "bun:test";

test("DOM manipulation", () => {
  document.body.innerHTML = "<div id='app'></div>";
  const app = document.getElementById("app");
  expect(app).not.toBeNull();
});
```

### React Testing Library

```typescript
import { test, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

test("renders button", () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText("Click me")).toBeDefined();
});
```

## Debugging Patterns

### Isolating Tests

```typescript
// Only run this test
test.only("isolated test", () => {
  expect(true).toBe(true);
});

// Skip failing test temporarily
test.skip("broken test", () => {
  // Will not run
});
```

### Detecting Flaky Tests

```bash
# Run each test 100 times
bun test --rerun-each 100

# Randomize order to find dependencies
bun test --randomize

# Reproduce specific order
bun test --seed 12345
```

### Verbose Debugging

```typescript
import { test, expect, beforeEach } from "bun:test";

beforeEach(() => {
  console.log("Starting test:", expect.getState().currentTestName);
});

test("debug me", () => {
  const data = { complex: "object" };
  console.log("Data:", JSON.stringify(data, null, 2));
  expect(data.complex).toBe("object");
});
```

## Test Organization

### Feature-Based Structure

```
src/
  user/
    user.ts
    user.test.ts
  post/
    post.ts
    post.test.ts
```

### Separate Test Directory

```
src/
  user.ts
  post.ts
tests/
  user.test.ts
  post.test.ts
  setup.ts
```

### Describe Blocks for Grouping

```typescript
import { describe, test, expect } from "bun:test";

describe("UserService", () => {
  describe("create", () => {
    test("creates user with valid data", () => {});
    test("throws on invalid email", () => {});
  });

  describe("update", () => {
    test("updates existing user", () => {});
    test("throws on missing user", () => {});
  });
});
```
