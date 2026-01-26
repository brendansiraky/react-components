# Bun Test CLI Reference

Complete reference for `bun test` command-line options.

## Usage

```bash
bun test [patterns...] [options]
```

## Execution Control

### `--timeout <milliseconds>`
Set per-test timeout. Default: 5000ms.

```bash
bun test --timeout 10000  # 10 second timeout
bun test --timeout 0      # No timeout (useful for debugging)
```

### `--rerun-each <count>`
Run each test file multiple times. Useful for detecting flaky tests.

```bash
bun test --rerun-each 100
```

### `--concurrent`
Run all tests concurrently within their files. Tests marked with `test.serial` still run sequentially.

```bash
bun test --concurrent
```

### `--max-concurrency <number>`
Maximum concurrent tests when using `--concurrent`. Default: 20.

```bash
bun test --concurrent --max-concurrency 4
```

### `--randomize`
Run tests in random order. Helps detect tests dependent on execution order.

```bash
bun test --randomize
```

Outputs seed in summary for reproduction.

### `--seed <number>`
Set random seed for test order. Implies `--randomize`.

```bash
bun test --seed 12345  # Reproduce specific order
```

### `--bail[=N]`
Stop after N failures. Defaults to 1 if no number specified.

```bash
bun test --bail      # Stop after first failure
bun test --bail=10   # Stop after 10 failures
```

### `--preload <file>`
Load script before tests. Useful for global setup, lifecycle hooks.

```bash
bun test --preload ./setup.ts
```

## Test Filtering

### Positional Arguments
Filter test files by path substring.

```bash
bun test foo          # Files containing "foo"
bun test foo bar      # Files containing "foo" OR "bar"
bun test ./specific   # Specific file (use ./ prefix)
```

### `--test-name-pattern <pattern>` / `-t <pattern>`
Filter tests by name using regex.

```bash
bun test -t "addition"
bun test --test-name-pattern "user.*login"
```

### `--todo`
Include tests marked with `test.todo()`.

```bash
bun test --todo
```

## Reporting

### `--reporter <format>`
Output format. Available: `junit`, `dots`.

```bash
bun test --reporter=dots           # Minimal output
bun test --reporter=junit --reporter-outfile=./results.xml
```

### `--reporter-outfile <path>`
Output file for reporter. Required with `--reporter=junit`.

### `--dots`
Shorthand for `--reporter=dots`.

```bash
bun test --dots
```

## Coverage

### `--coverage`
Generate coverage report.

```bash
bun test --coverage
```

### `--coverage-reporter <format>`
Coverage format: `text` (default), `lcov`, or both.

```bash
bun test --coverage --coverage-reporter=lcov
bun test --coverage --coverage-reporter="text,lcov"
```

### `--coverage-dir <directory>`
Output directory for coverage files. Default: `coverage`.

```bash
bun test --coverage --coverage-dir=./reports
```

## Snapshots

### `--update-snapshots` / `-u`
Update snapshot files instead of comparing.

```bash
bun test --update-snapshots
bun test -u
```

## Watch Mode

### `--watch`
Re-run tests when files change.

```bash
bun test --watch
```

## Environment Variables

### AI Agent Integration

Set any of these to enable quiet output mode:

| Variable | Description |
|----------|-------------|
| `CLAUDECODE=1` | Claude Code integration |
| `REPL_ID=1` | Replit integration |
| `AGENT=1` | Generic AI agent flag |

Behavior when enabled:
- Only failures shown in detail
- Passing/skipped/todo hidden
- Summary preserved

```bash
CLAUDECODE=1 bun test
```

## CI/CD Integration

### GitHub Actions

Automatic annotation support. No configuration needed.

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun test
```

### JUnit XML (GitLab, Jenkins, etc.)

```bash
bun test --reporter=junit --reporter-outfile=./bun.xml
```

## Common Command Combinations

```bash
# Development workflow
bun test --watch

# Debug specific test
bun test -t "specific test" --timeout 0

# CI with early exit
bun test --bail --reporter=junit --reporter-outfile=./results.xml

# Coverage for PR
bun test --coverage --coverage-reporter=lcov

# Find flaky tests
bun test --rerun-each 50 --randomize

# Reproduce failure order
bun test --seed 12345

# Fast feedback
bun test --concurrent --bail
```
