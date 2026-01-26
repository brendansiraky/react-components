#!/bin/bash
set -e

SCRIPT_PATH="$(realpath "$0")"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <task_file> <max_iterations>"
  exit 1
fi

TASK_FILE="$1"
MAX_ITERATIONS="$2"
TASK_NUM="${3:-1}"

if [ ! -f "$TASK_FILE" ]; then
  echo "Error: Task file '$TASK_FILE' not found"
  exit 1
fi

if [ "$TASK_NUM" -gt "$MAX_ITERATIONS" ]; then
  echo "Max iterations reached."
  exit 0
fi

echo ""
echo "========================================"
echo "Starting task $TASK_NUM (max $MAX_ITERATIONS)"
echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

start_time=$(date +%s)

result=$(claude --dangerously-skip-permissions -p "/implement-task $TASK_FILE")

end_time=$(date +%s)
duration=$((end_time - start_time))

echo "$result"
echo ""
minutes=$((duration / 60))
seconds=$((duration % 60))
if [ "$minutes" -gt 0 ]; then
  echo "Task completed in ${minutes}m ${seconds}s"
else
  echo "Task completed in ${seconds}s"
fi

if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
  echo "All tasks complete!"
  exit 0
fi

# Recursively exec into the next iteration (allows script updates between runs)
exec "$SCRIPT_PATH" "$TASK_FILE" "$MAX_ITERATIONS" "$((TASK_NUM + 1))"