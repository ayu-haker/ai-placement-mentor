#!/bin/sh
set -e

OLLAMA_BASE_URL="${OLLAMA_BASE_URL:-http://ollama:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-llama3}"
OLLAMA_FALLBACK_MODEL="${OLLAMA_FALLBACK_MODEL:-gemma}"
MAX_RETRIES=30
RETRY_INTERVAL=5

echo "========================================"
echo "  Ollama Model Initializer"
echo "========================================"
echo "  Base URL:    $OLLAMA_BASE_URL"
echo "  Primary:     $OLLAMA_MODEL"
echo "  Fallback:    $OLLAMA_FALLBACK_MODEL"
echo "========================================"

wait_for_ollama() {
  echo "[$(date)] Waiting for Ollama service..."
  i=1
  while [ $i -le $MAX_RETRIES ]; do
    if curl -sf "$OLLAMA_BASE_URL/api/tags" > /dev/null 2>&1; then
      echo "[$(date)] Ollama service is ready"
      return 0
    fi
    echo "[$(date)] Attempt $i/$MAX_RETRIES: Ollama not ready, waiting ${RETRY_INTERVAL}s..."
    sleep $RETRY_INTERVAL
    i=$((i + 1))
  done
  echo "[$(date)] ERROR: Ollama service did not become ready"
  return 1
}

model_exists() {
  local model="$1"
  curl -sf "$OLLAMA_BASE_URL/api/tags" 2>/dev/null | \
    grep -q "\"name\":\"$model\"\|"name":"$model:" || \
    curl -sf "$OLLAMA_BASE_URL/api/tags" 2>/dev/null | \
    grep -q "\"name\":\"${model%:*}\""
}

pull_model() {
  local model="$1"
  echo "[$(date)] Pulling model: $model..."
  curl -X POST "$OLLAMA_BASE_URL/api/pull" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$model\", \"stream\": false}" \
    --connect-timeout 10 \
    --max-time 600
  echo ""
  echo "[$(date)] Model $model pulled successfully"
}

wait_for_ollama || exit 1

echo ""
echo "[$(date)] Checking models..."

if model_exists "$OLLAMA_MODEL"; then
  echo "[$(date)] Primary model '$OLLAMA_MODEL' already exists"
else
  echo "[$(date)] Primary model '$OLLAMA_MODEL' not found"
  pull_model "$OLLAMA_MODEL" || {
    echo "[$(date)] Failed to pull primary model, trying fallback..."
    pull_model "$OLLAMA_FALLBACK_MODEL"
  }
fi

echo ""
echo "[$(date)] Verifying available models:"
curl -sf "$OLLAMA_BASE_URL/api/tags" | python3 -c "
import json, sys
data = json.load(sys.stdin)
models = [m['name'] for m in data.get('models', [])]
print(f'  Available models: {len(models)}')
for m in models:
    print(f'    - {m}')
" 2>/dev/null || echo "  (could not parse model list)"

echo ""
echo "[$(date)] Ollama initialization complete!"
exit 0
