---
name: Bun Testing
description: This skill should be used when the user asks to "run tests", "write a test", "create test file", "add unit tests", "fix failing tests", "debug test", "mock a function", "add snapshot test", "update snapshots", "test coverage", "watch mode tests", "concurrent tests", "bun test", or needs guidance on Bun's Jest-compatible test runner. Use for testing non-UI code (utilities, business logic, API routes, data transformations, validation).
---

# Bun Testing Specialist

Provides guidance for writing, running, and debugging tests using Bun's built-in Jest-compatible test runner.

## When to Use Bun Tests

Use `bun test` for unit testing code that doesn't require a DOM or browser environment:

- **Utility functions** - formatters, parsers, validators, transformers
- **Business logic** - calculations, state machines, rules engines
- **API code** - route handlers, middleware, use cases, repositories
- **Data operations** - database queries, serialization, mapping
- **Shared libraries** - packages used across frontend and backend

For other test types:
- **React components** → Use Vitest with Testing Library
- **End-to-end browser tests** → Use Playwright

## Project Conventions

### File Naming and Location

Place test files adjacent to the source file with `_test.{ts|tsx}` suffix:

```
src/
  utils/
    format.ts
    format_test.ts      # Tests for format.ts
```

### Test Coverage Approach

When writing tests, cover both the happy path and edge cases:

1. **Main cases** - Verify the primary functionality works as expected
2. **Edge cases** - Consider and test:
   - Boundary conditions (empty arrays, zero values, max limits)
   - Invalid or unexpected inputs (null, undefined, wrong types)
   - Error states and exception handling
   - Race conditions in async code
   - State transitions and sequences

Analyze the code under test to identify potential failure modes and unusual scenarios that could cause bugs.

## Core Concepts

### Test File Discovery

Bun automatically discovers test files matching these patterns (this project uses `*_test.{ts|tsx}`):
- `*.test.{js|jsx|ts|tsx}`
- `*_test.{js|jsx|ts|tsx}`
- `*.spec.{js|jsx|ts|tsx}`
- `*_spec.{js|jsx|ts|tsx}`

### Basic Test Structure

```typescript
import { test, expect, describe } from "bun:test";

describe("feature", () => {
  test("does something", () => {
    expect(2 + 2).toBe(4);
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific file (use ./ prefix)
bun test ./path/to/file.test.ts

# Filter by file name pattern
bun test foo bar

# Filter by test name
bun test --test-name-pattern "pattern"
bun test -t "pattern"
```

## Essential CLI Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--watch` | Re-run on file changes | - |
| `--timeout <ms>` | Per-test timeout | 5000 |
| `--bail[=N]` | Stop after N failures | - |
| `--coverage` | Generate coverage report | - |
| `--update-snapshots` / `-u` | Update snapshot files | - |
| `--concurrent` | Run tests in parallel | - |

## Lifecycle Hooks

```typescript
import { beforeAll, beforeEach, afterEach, afterAll } from "bun:test";

beforeAll(() => {
  // Runs once before all tests
});

beforeEach(() => {
  // Runs before each test
});

afterEach(() => {
  // Runs after each test
});

afterAll(() => {
  // Runs once after all tests
});
```

Use `--preload ./setup.ts` to load hooks globally across all test files.

## Mocking

```typescript
import { test, expect, mock, spyOn } from "bun:test";

// Create mock function
const mockFn = mock(() => "mocked value");

test("mock example", () => {
  mockFn();
  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(1);
});

// Spy on existing method
const obj = { method: () => "original" };
const spy = spyOn(obj, "method");
```

`jest.fn()` is also available and behaves identically to `mock()`.

## Snapshot Testing

```typescript
import { test, expect } from "bun:test";

test("snapshot", () => {
  expect({ a: 1, b: 2 }).toMatchSnapshot();
});
```

Update snapshots: `bun test --update-snapshots` or `bun test -u`

## Concurrent Testing

```typescript
import { test } from "bun:test";

// Individual concurrent tests
test.concurrent("async test 1", async () => { /* ... */ });
test.concurrent("async test 2", async () => { /* ... */ });

// Force sequential execution
test.serial("must run alone", () => { /* ... */ });
```

Run all tests concurrently: `bun test --concurrent`

Control parallelism: `bun test --concurrent --max-concurrency 4`

## Test Modifiers

```typescript
// Skip test
test.skip("skipped", () => {});

// Mark as todo
test.todo("implement later");

// Only run this test
test.only("focused", () => {});

// Expected to fail
test.failing("known issue", () => {
  expect(true).toBe(false);
});

// Parameterized tests
test.each([1, 2, 3])("value %d", (n) => {
  expect(n).toBeGreaterThan(0);
});

// Chain modifiers
test.failing.each([1, 2])("fails for %d", (n) => {});
```

## AI-Friendly Output

Set `CLAUDECODE=1` environment variable for reduced output verbosity:
- Only failures displayed in detail
- Passing/skipped/todo indicators hidden
- Summary statistics preserved

```bash
CLAUDECODE=1 bun test
```

## Common Workflows

### Writing New Tests

1. Create test file adjacent to source: `feature.ts` → `feature_test.ts`
2. Import from `bun:test`
3. Use `describe` blocks to organize related tests
4. Write tests for the main case first
5. Analyze the code for edge cases: boundary conditions, error states, invalid inputs
6. Add tests for each identified edge case

### Debugging Failures

1. Run specific failing test: `bun test -t "test name"`
2. Add `--timeout 0` for tests that need debugging time
3. Use `test.only()` to isolate a single test
4. Check for flaky tests: `bun test --rerun-each 10`
5. Detect order dependencies: `bun test --randomize`

### CI/CD Integration

GitHub Actions automatically receives annotations. For other CI systems:

```bash
# JUnit XML output
bun test --reporter=junit --reporter-outfile=./results.xml
```

### Coverage Reports

```bash
# Text coverage (default)
bun test --coverage

# LCOV format for tools like Codecov
bun test --coverage --coverage-reporter=lcov --coverage-dir=coverage
```

## Common Matchers

```typescript
expect(value).toBe(exact);           // Strict equality
expect(value).toEqual(deep);         // Deep equality
expect(value).toBeTruthy();          // Truthy check
expect(value).toBeFalsy();           // Falsy check
expect(value).toBeNull();            // Null check
expect(value).toBeUndefined();       // Undefined check
expect(value).toContain(item);       // Array/string contains
expect(fn).toThrow();                // Throws error
expect(fn).toThrow("message");       // Throws specific error
expect(mock).toHaveBeenCalled();     // Mock was called
expect(mock).toHaveBeenCalledWith(); // Mock called with args
```

## Additional Resources

### Reference Files

- **`references/cli-reference.md`** - Complete CLI flags and options
- **`references/patterns.md`** - Advanced testing patterns and techniques

### Example Files

- **`examples/basic_test.ts`** - Basic test structure
- **`examples/mocking_test.ts`** - Mocking patterns
- **`examples/async_test.ts`** - Async testing patterns
