---
name: command-dev
description: This skill should be used when the user asks to "create a command", "add a command", "write a command", "update a command", "modify a command", "change a command", "improve a command", "fix a command", "edit a command", "create a slash command", "add a slash command", or mentions creating/modifying files in .claude/commands/.
---

# Slash Command Development

Slash commands are Markdown files that define frequently-used prompts for Claude Code. Commands are **instructions FOR Claude**, not documentation for users.

## Command Locations

| Type | Location | Label in `/help` |
|------|----------|------------------|
| Project commands | `.claude/commands/` | (project) |
| Personal commands | `~/.claude/commands/` | (user) |

Project commands take precedence over personal commands with the same name.

## Basic Structure

Simple command (no frontmatter):
```markdown
Review this code for bugs and suggest fixes.
```

With frontmatter:
```markdown
---
description: Review code for bugs
argument-hint: <file-path>
---

Review @$1 for bugs and suggest fixes.
```

## Frontmatter Reference

| Field | Purpose | Default |
|-------|---------|---------|
| `description` | Brief description shown in `/help` | First line of prompt |
| `argument-hint` | Documents expected arguments for autocomplete | None |
| `allowed-tools` | Tools the command can use | Inherits from conversation |
| `model` | Model to use (`haiku`, `sonnet`, `opus`) | Inherits from conversation |
| `context` | Set to `fork` to run in isolated sub-agent | Inline |
| `agent` | Agent type when `context: fork` is set | `general-purpose` |
| `disable-model-invocation` | Prevent Skill tool from calling this command | false |
| `hooks` | Define hooks scoped to command execution | None |

## Arguments

### All arguments with `$ARGUMENTS`

Captures all arguments as a single string:

```markdown
---
argument-hint: <issue-number>
---

Fix issue #$ARGUMENTS following our coding standards.
```

Usage: `/fix-issue 123 high-priority` → `$ARGUMENTS` becomes `123 high-priority`

### Positional arguments with `$1`, `$2`, etc.

Access specific arguments individually:

```markdown
---
argument-hint: <pr-number> <priority> <assignee>
---

Review PR #$1 with priority $2 and assign to $3.
```

Usage: `/review-pr 456 high alice` → `$1`=456, `$2`=high, `$3`=alice

## File References

Include file contents using `@` prefix:

```markdown
# Reference argument as file
Review @$1 for security issues.

# Reference specific files
Compare @src/old.js with @src/new.js

# Reference static files
Check @package.json and @tsconfig.json for consistency.
```

## Bash Execution

Execute bash commands inline with `!` backticks. Requires `allowed-tools` with Bash:

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Task

Based on the above changes, create a single git commit.
```

## Command Hooks

Define hooks that run during command execution:

```markdown
---
description: Deploy to staging with validation
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/validate-deploy.sh"
          once: true
---

Deploy the current branch to staging environment.
```

The `once: true` option runs the hook only once per session.

## Namespacing

Use subdirectories to group related commands:

- `.claude/commands/frontend/component.md` → `/component` with description "(project:frontend)"
- `.claude/commands/backend/test.md` → `/test` with description "(project:backend)"

Commands in different subdirectories can share names.

## Best Practices

1. **Write for Claude** - Commands are instructions for Claude, not messages to users
2. **Single purpose** - One command, one task
3. **Document arguments** - Always include `argument-hint` when using arguments
4. **Scope tools** - Use specific `allowed-tools` like `Bash(git:*)` instead of `Bash(*)`
5. **Keep focused** - Avoid overly complex commands

## Common Patterns

### Review pattern
```markdown
---
description: Review PR changes
allowed-tools: Read, Bash(git:*)
---

Files changed: !`git diff --name-only`

Review each file for code quality, bugs, and security issues.
```

### Skill delegation pattern
```markdown
---
description: Create tasks from a document
argument-hint: <file-path>
---

Load the task-creator skill and use it to create tasks from $ARGUMENTS.
```

### Process pattern
```markdown
---
description: Run the full test suite
argument-hint: [test-filter]
---

Run tests matching "$ARGUMENTS" and fix any failures.
If no filter provided, run all tests.
```
