---
name: agent-dev
description: This skill should be used when the user asks to "create an agent", "create a subagent", "add a new agent", "write an agent", "build a custom agent", "make a subagent", "update an agent", "modify an agent", "edit an agent", "improve an agent", "fix an agent", or needs guidance on agent configuration, frontmatter fields, tool restrictions, permission modes, or hooks for agents.
---

# Developing Custom Subagents for Claude Code

This skill provides guidance for creating and updating subagents (specialized AI assistants) in Claude Code.

## Overview

Subagents are specialized AI assistants that handle specific types of tasks. Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions. Claude delegates to subagents based on their description field.

### When to Create or Update Subagents

Create subagents to:

- **Preserve context** - Keep exploration and implementation out of the main conversation
- **Enforce constraints** - Limit which tools a subagent can use
- **Specialize behavior** - Provide focused system prompts for specific domains
- **Reuse configurations** - Share agents across projects

Update existing subagents to:

- **Refine behavior** - Improve system prompts based on observed performance
- **Adjust permissions** - Add or remove tools as requirements change
- **Fix issues** - Correct problems with triggers, workflows, or constraints
- **Extend functionality** - Add hooks, skills, or new capabilities

## Subagent File Structure

Subagents are Markdown files with YAML frontmatter stored in specific locations:

| Location                     | Scope                     | Priority |
| :--------------------------- | :------------------------ | :------- |
| `.claude/agents/`            | Current project           | High     |
| `~/.claude/agents/`          | All projects (user-level) | Medium   |
| Plugin's `agents/` directory | Where plugin is enabled   | Low      |

### Basic File Format

```markdown
---
name: agent-name
description: When Claude should delegate to this agent
tools: Read, Grep, Glob
model: opus
---

System prompt content goes here.
Provide clear instructions for what the agent should do.
```

## Required Frontmatter Fields

### name (required)

Unique identifier using lowercase letters and hyphens.

```yaml
name: code-reviewer
name: test-runner
name: db-query-validator
```

### description (required)

Determines when Claude delegates to this agent. Include specific trigger phrases and "use proactively" for automatic delegation.

**Effective descriptions:**

```yaml
description: Expert code reviewer. Use proactively after code changes to check quality and security.
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering issues.
description: Execute read-only database queries. Use when analyzing data or generating reports.
```

**Weak descriptions (avoid):**

```yaml
description: Reviews code  # Too vague
description: Helps with debugging  # No trigger context
```

## Optional Frontmatter Fields

### tools

Specify which tools the agent can use. If omitted, inherits all tools from the main conversation.

**Available tools:** Read, Edit, Write, Bash, Grep, Glob, WebFetch, WebSearch, Task, NotebookEdit, AskUserQuestion

```yaml
# Read-only agent
tools: Read, Grep, Glob

# Full access (can modify files)
tools: Read, Edit, Write, Bash, Grep, Glob

# Research agent
tools: Read, Grep, Glob, WebFetch, WebSearch
```

### disallowedTools

Deny specific tools (removed from inherited or specified list).

```yaml
tools: Read, Edit, Bash, Grep, Glob
disallowedTools: Write # Can edit but not create new files
```

### model

Choose the AI model for the agent:

- `opus` - Claude Opus 4.5, the most capable model (recommended)

```yaml
model: opus  # Recommended for all agents
```

### permissionMode

Control how the agent handles permission prompts:

| Mode                | Behavior                                      |
| :------------------ | :-------------------------------------------- |
| `default`           | Standard permission checking with prompts     |
| `acceptEdits`       | Auto-accept file edits                        |
| `dontAsk`           | Auto-deny permission prompts                  |
| `bypassPermissions` | Skip all permission checks (use with caution) |
| `plan`              | Plan mode (read-only exploration)             |

```yaml
permissionMode: acceptEdits # Trust agent to make file changes
```

### skills

Preload skill content into the agent's context at startup:

```yaml
skills:
    - api-conventions
    - error-handling-patterns
```

### hooks

Define lifecycle hooks scoped to this agent:

```yaml
hooks:
    PreToolUse:
        - matcher: 'Bash'
          hooks:
              - type: command
                command: './scripts/validate-command.sh'
    PostToolUse:
        - matcher: 'Edit|Write'
          hooks:
              - type: command
                command: './scripts/run-linter.sh'
```

## System Prompt Guidelines

The Markdown body becomes the agent's system prompt. Effective system prompts:

1. **Define the role** - State what the agent specializes in
2. **Provide workflow** - Numbered steps for common tasks
3. **Set constraints** - What the agent should/shouldn't do
4. **Specify output format** - How to present results

### Template Structure

```markdown
You are a [role description] specializing in [domain].

When invoked:

1. [First step]
2. [Second step]
3. [Third step]

Key practices:

- [Practice 1]
- [Practice 2]
- [Practice 3]

For each [task], provide:

- [Output element 1]
- [Output element 2]
- [Output element 3]

[Any constraints or limitations]
```

## Agent Development Workflow

### Creating a New Agent

#### Step 1: Define Purpose

Identify what specific task the agent handles:

- What triggers should invoke it?
- What tools does it need?
- What constraints should it have?

#### Step 2: Choose Configuration

Select appropriate settings:

- **Read-only agent:** `tools: Read, Grep, Glob`
- **Code modification agent:** `tools: Read, Edit, Bash, Grep, Glob`
- **Research agent:** `tools: Read, Grep, Glob, WebFetch, WebSearch`
- **All agents:** `model: opus` (Claude Opus 4.5 recommended)

#### Step 3: Write the File

Create the agent file in the appropriate location:

```bash
# Project-level agent
touch .claude/agents/my-agent.md

# User-level agent
touch ~/.claude/agents/my-agent.md
```

#### Step 4: Test the Agent

Invoke the agent explicitly to verify behavior:

```
Use the my-agent subagent to [specific task]
```

### Updating an Existing Agent

#### Step 1: Locate the Agent

Find the agent file in one of these locations:

```bash
# Project-level agents
ls .claude/agents/

# User-level agents
ls ~/.claude/agents/
```

#### Step 2: Identify Changes Needed

Common update scenarios:

| Issue | Solution |
| :---- | :------- |
| Agent not triggering | Improve description with specific trigger phrases |
| Wrong tools being used | Adjust `tools` or `disallowedTools` list |
| Poor output quality | Refine system prompt with clearer workflow |
| Too slow | Consider task decomposition or caching |
| Missing capabilities | Add `skills` or `hooks` configuration |
| Over-permissioned | Restrict tools or add validation hooks |

#### Step 3: Make Targeted Edits

When updating agents:

- **Preserve working parts** - Only modify what needs to change
- **Test incrementally** - Verify each change before making more
- **Keep descriptions specific** - Maintain clear trigger phrases
- **Document changes** - Add comments for complex configurations

#### Step 4: Test the Updated Agent

Re-invoke the agent to verify improvements:

```
Use the my-agent subagent to [specific task that was problematic]
```

## Common Agent Patterns

### Read-Only Reviewer

```yaml
---
name: code-reviewer
description: Expert code review specialist. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: opus
---
```

### Debugging Specialist

```yaml
---
name: debugger
description: Debugging specialist for errors and test failures. Use proactively when encountering issues.
tools: Read, Edit, Bash, Grep, Glob
---
```

### Fast Explorer

```yaml
---
name: quick-search
description: Fast codebase search and exploration. Use for finding files and understanding structure.
tools: Read, Grep, Glob
model: opus
---
```

### Conditional Validator (with hooks)

```yaml
---
name: db-reader
description: Execute read-only database queries.
tools: Bash
hooks:
    PreToolUse:
        - matcher: 'Bash'
          hooks:
              - type: command
                command: './scripts/validate-readonly-query.sh'
---
```

## Additional Resources

### Reference Files

For detailed patterns and advanced configurations:

- **`references/agent-patterns.md`** - Complete agent examples with full system prompts
- **`references/hooks-for-agents.md`** - Hook configuration patterns for agents

### Example Files

Working agent examples in `examples/`:

- **`code-reviewer.md`** - Read-only code review agent
- **`debugger.md`** - Debugging specialist with edit access
- **`data-scientist.md`** - Domain-specific analysis agent

## Validation Checklist

Before deploying a new or updated agent:

- [ ] `name` uses lowercase letters and hyphens
- [ ] `description` includes specific trigger phrases
- [ ] `tools` list matches agent's needs (not over-permissioned)
- [ ] `model` appropriate for task complexity
- [ ] System prompt provides clear workflow
- [ ] File saved to correct location (project vs user level)
- [ ] Agent tested with explicit invocation

Additional checks when updating:

- [ ] Changes address the identified issue
- [ ] Working functionality preserved
- [ ] No unintended permission changes
- [ ] Trigger behavior still correct

## Quick Reference

| Field             | Required | Default      |
| :---------------- | :------- | :----------- |
| `name`            | Yes      | -            |
| `description`     | Yes      | -            |
| `tools`           | No       | Inherits all |
| `disallowedTools` | No       | None         |
| `model`           | No       | `inherit`    |
| `permissionMode`  | No       | `default`    |
| `skills`          | No       | None         |
| `hooks`           | No       | None         |
