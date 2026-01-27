# Hooks for Agents Reference

This reference covers hook configuration patterns for agents, including validation scripts and lifecycle management.

## Hook Types for Agent Frontmatter

Agents can define hooks that run only while the agent is active:

| Event | Matcher Input | When It Fires |
|:------|:--------------|:--------------|
| `PreToolUse` | Tool name | Before the agent uses a tool |
| `PostToolUse` | Tool name | After the agent uses a tool |
| `Stop` | (none) | When the agent finishes |

## PreToolUse Hooks

Validate or modify tool operations before they execute.

### Basic Structure

```yaml
hooks:
  PreToolUse:
    - matcher: "ToolName"
      hooks:
        - type: command
          command: "./scripts/validate.sh"
```

### Matching Multiple Tools

Use regex patterns to match multiple tools:

```yaml
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/validate-file-edit.sh"
```

### Hook Input Format

Claude Code passes JSON via stdin to hook commands:

```json
{
  "session_id": "abc123",
  "tool_name": "Bash",
  "tool_input": {
    "command": "psql -c 'SELECT * FROM users'"
  }
}
```

### Exit Codes

| Code | Behavior |
|:-----|:---------|
| 0 | Allow the operation |
| 1 | Error (logged, operation continues) |
| 2 | Block the operation (error message fed back to agent) |

---

## Example: SQL Query Validator

Block SQL write operations, allowing only SELECT queries.

**Agent configuration:**

```yaml
---
name: db-reader
description: Execute read-only database queries.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-readonly-query.sh"
---
```

**Validation script (`./scripts/validate-readonly-query.sh`):**

```bash
#!/bin/bash
# Blocks SQL write operations, allows SELECT queries

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block write operations (case-insensitive)
if echo "$COMMAND" | grep -iE '\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|MERGE)\b' > /dev/null; then
  echo "Blocked: Write operations not allowed. Use SELECT queries only." >&2
  exit 2
fi

exit 0
```

---

## Example: File Path Validator

Restrict file operations to specific directories.

**Agent configuration:**

```yaml
---
name: safe-editor
description: Edit files only within the src directory.
tools: Read, Edit, Write
hooks:
  PreToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/validate-file-path.sh"
---
```

**Validation script (`./scripts/validate-file-path.sh`):**

```bash
#!/bin/bash
# Only allow edits within src/ directory

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Extract file path based on tool type
if [ "$TOOL" = "Edit" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
elif [ "$TOOL" = "Write" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
else
  exit 0
fi

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Check if path is within src/
if [[ "$FILE_PATH" != */src/* ]] && [[ "$FILE_PATH" != src/* ]]; then
  echo "Blocked: Can only edit files within src/ directory." >&2
  exit 2
fi

exit 0
```

---

## Example: Command Allowlist

Only allow specific commands to run.

**Agent configuration:**

```yaml
---
name: test-runner
description: Run tests only.
tools: Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-test-command.sh"
---
```

**Validation script (`./scripts/validate-test-command.sh`):**

```bash
#!/bin/bash
# Only allow test-related commands

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Allow test commands
ALLOWED_PATTERNS=(
  "^npm test"
  "^npm run test"
  "^yarn test"
  "^jest"
  "^pytest"
  "^go test"
  "^cargo test"
  "^make test"
)

for pattern in "${ALLOWED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    exit 0
  fi
done

echo "Blocked: Only test commands are allowed." >&2
exit 2
```

---

## PostToolUse Hooks

Run scripts after tool operations complete. Useful for logging, linting, or notifications.

### Basic Structure

```yaml
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/post-edit.sh"
```

### Example: Auto-Lint After Edits

```yaml
---
name: lint-editor
description: Edit files with automatic linting.
tools: Read, Edit, Write
hooks:
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/run-linter.sh"
---
```

**Linter script (`./scripts/run-linter.sh`):**

```bash
#!/bin/bash
# Run linter on edited files

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Determine linter based on file extension
case "$FILE_PATH" in
  *.js|*.ts|*.jsx|*.tsx)
    npx eslint --fix "$FILE_PATH" 2>/dev/null || true
    ;;
  *.py)
    python -m black "$FILE_PATH" 2>/dev/null || true
    ;;
  *.go)
    gofmt -w "$FILE_PATH" 2>/dev/null || true
    ;;
esac

exit 0
```

### Example: Log All Tool Usage

```yaml
hooks:
  PostToolUse:
    - matcher: ".*"
      hooks:
        - type: command
          command: "./scripts/log-tool-usage.sh"
```

**Logging script (`./scripts/log-tool-usage.sh`):**

```bash
#!/bin/bash
# Log all tool usage

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "[$TIMESTAMP] Tool used: $TOOL" >> ./logs/agent-activity.log
exit 0
```

---

## Stop Hooks

Run when the agent finishes execution. Useful for cleanup or summary reports.

### Basic Structure

```yaml
hooks:
  Stop:
    - hooks:
        - type: command
          command: "./scripts/cleanup.sh"
```

### Example: Generate Summary Report

```yaml
---
name: analyzer
description: Analyze codebase and generate report.
tools: Read, Grep, Glob
hooks:
  Stop:
    - hooks:
        - type: command
          command: "./scripts/generate-summary.sh"
---
```

---

## Project-Level Hooks for Agents

Configure hooks in `settings.json` that respond to agent lifecycle events:

| Event | Matcher Input | When It Fires |
|:------|:--------------|:--------------|
| `SubagentStart` | Agent type name | When an agent begins |
| `SubagentStop` | Agent type name | When an agent completes |

### Example: Database Connection Setup

```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "db-reader",
        "hooks": [
          { "type": "command", "command": "./scripts/setup-db-connection.sh" }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "db-reader",
        "hooks": [
          { "type": "command", "command": "./scripts/cleanup-db-connection.sh" }
        ]
      }
    ]
  }
}
```

---

## Hook Best Practices

### 1. Keep Scripts Fast

Hooks run synchronously. Slow scripts delay tool execution.

```bash
# Good: Quick validation
echo "$INPUT" | jq -r '.tool_input.command' | grep -qE "pattern" || exit 2

# Avoid: Heavy operations
# npm install, compilation, network calls
```

### 2. Use Specific Matchers

Match only the tools that need validation:

```yaml
# Good: Specific matcher
matcher: "Bash"

# Avoid: Overly broad
matcher: ".*"  # Runs on every tool
```

### 3. Provide Clear Error Messages

When blocking operations, explain why:

```bash
# Good: Actionable error
echo "Blocked: Cannot edit files outside src/. Move file to src/ first." >&2

# Bad: Vague error
echo "Operation not allowed" >&2
```

### 4. Handle Missing Input Gracefully

Check for empty values before processing:

```bash
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0  # Nothing to validate
fi
```

### 5. Make Scripts Executable

```bash
chmod +x ./scripts/validate-command.sh
```

### 6. Test Hooks Independently

Test validation scripts outside of Claude Code:

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"SELECT * FROM users"}}' | ./scripts/validate-readonly-query.sh
echo "Exit code: $?"
```

---

## Complete Agent with Multiple Hooks

```yaml
---
name: secure-editor
description: Edit code with security validations.
tools: Read, Edit, Write, Bash
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-safe-command.sh"
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/validate-file-path.sh"
  PostToolUse:
    - matcher: "Edit|Write"
      hooks:
        - type: command
          command: "./scripts/scan-for-secrets.sh"
  Stop:
    - hooks:
        - type: command
          command: "./scripts/security-summary.sh"
---

You are a security-conscious code editor.

When editing code:
1. Validate all file paths are within allowed directories
2. Scan edited files for accidentally committed secrets
3. Generate security summary when finished

Do not:
- Edit configuration files outside src/
- Run destructive shell commands
- Commit files containing API keys or passwords
```

This comprehensive example shows:
- Multiple PreToolUse matchers for different tools
- PostToolUse hook for secret scanning
- Stop hook for summary generation
- Clear system prompt explaining the security focus
