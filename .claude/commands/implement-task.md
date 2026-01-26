---
argument-hint: <task file path>
description: Implement the highest-priority pending task from a task file
---

Read the task file at `$ARGUMENTS` and `progress.txt` to understand the current state.

## Process

1. **Find the highest-priority pending task** from the task file.

2. **Load required skills**: BEFORE IMPLEMENTING, load all skills listed in the task using `/skill-name`. This is mandatory - do not skip.

3. **Implement the task**.

4. **Verify the task**:
   - Identify the testing skill from the task's `skills` array (one of: `bun-testing`, `vitest-testing`, `e2e-testing`)
   - Load the testing skill using `/testing-skill-name` if not already loaded in step 2 *This is mandatory - do not skip*
   - Write tests for the new functionality following the loaded skill's patterns
   - Run the full test suite to verify both new tests pass AND existing tests are not broken
   - If tests fail, fix the issues before proceeding
   - **For UI features**: Use the `/dev-browser` skill to manually verify the feature works correctly in the browser before marking complete

5. **Run linting and type checking**:
   - Run `bun lint:fix` to fix any linting issues
   - Run `bun typecheck` to ensure there are no type errors
   - If any issues are found and fixed, go back to step 4 to re-run verification

6. **Update the task file** marking the task as completed.

7. **Append a single sentence** summarizing your progress to `progress.txt`.

8. **Commit your changes**.

## Important

- **ONLY WORK ON A SINGLE TASK** - do not implement multiple tasks in one run.

## Output

- **If there are no pending tasks** when you first check the task file: Output ONLY `<promise>COMPLETE</promise>` and nothing else.
- **After completing a task**: Output a brief summary of what you implemented and what task you expect will be performed next.
