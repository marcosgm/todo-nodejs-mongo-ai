#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
NETWORK=todo-network

MONGO_CONTAINER=todo-mongodb
API_CONTAINER=todo-api
WEB_CONTAINER=todo-web

API_IMAGE=todo-api:local
WEB_IMAGE=todo-web:local
MONGO_IMAGE=mongo:7

API_PORT=3100
WEB_PORT=8080
MONGO_PORT=27017

MONGO_DB_NAME=Todo
# API connects to MongoDB over the shared Docker network using the container name
MONGO_CONN_STR="mongodb://${MONGO_CONTAINER}:27017"

# ── Azure OpenAI (AI checklist feature) ──────────────────────────────────────
# Set AZURE_OPENAI_ENDPOINT in your environment to enable AI-powered checklists.
# AZURE_OPENAI_DEPLOYMENT_NAME defaults to gpt-4o if not set.
# AZURE_OPENAI_API_KEY is optional; omit to use DefaultAzureCredential instead.
AZURE_OPENAI_ENDPOINT="${AZURE_OPENAI_ENDPOINT:-}"
AZURE_OPENAI_DEPLOYMENT_NAME="${AZURE_OPENAI_DEPLOYMENT_NAME:-gpt-4o}"
AZURE_OPENAI_API_KEY="${AZURE_OPENAI_API_KEY:-}"

if [[ -z "$AZURE_OPENAI_ENDPOINT" ]]; then
  echo "[warn] AZURE_OPENAI_ENDPOINT is not set. The 'Generate AI-powered checklist' feature will be disabled."
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Build images ─────────────────────────────────────────────────────────────
echo "==> Building API image..."
docker build -t "$API_IMAGE" "$SCRIPT_DIR/src/api"

echo "==> Building Web image..."
# VITE_API_BASE_URL is baked at build time. The Dockerfile default falls back to
# http://localhost:3100, which is correct because the browser calls the API
# directly from the host machine. Pass explicitly for clarity.
docker build \
  --build-arg VITE_API_BASE_URL="http://localhost:${API_PORT}" \
  -t "$WEB_IMAGE" "$SCRIPT_DIR/src/web"

# ── Network ──────────────────────────────────────────────────────────────────
echo "==> Ensuring Docker network '${NETWORK}'..."
docker network inspect "$NETWORK" > /dev/null 2>&1 \
  || docker network create "$NETWORK"

# ── Remove stale containers ──────────────────────────────────────────────────
echo "==> Removing any existing containers..."
for c in "$MONGO_CONTAINER" "$API_CONTAINER" "$WEB_CONTAINER"; do
  if docker ps -a --format '{{.Names}}' | grep -qx "$c"; then
    docker rm -f "$c"
    echo "    Removed: $c"
  fi
done

# ── Start MongoDB ─────────────────────────────────────────────────────────────
echo "==> Starting MongoDB..."
docker run -d \
  --name  "$MONGO_CONTAINER" \
  --network "$NETWORK" \
  -p "${MONGO_PORT}:27017" \
  "$MONGO_IMAGE"

# ── Start API ─────────────────────────────────────────────────────────────────
echo "==> Starting API..."
docker run -d \
  --name "$API_CONTAINER" \
  --network "$NETWORK" \
  -p "${API_PORT}:3100" \
  -e AZURE_MONGO_CONNECTION_STRING="$MONGO_CONN_STR" \
  -e AZURE_MONGO_DATABASE_NAME="$MONGO_DB_NAME" \
  -e NODE_ENV=production \
  -e API_ALLOW_ORIGINS="http://localhost:${WEB_PORT}" \
  -e AZURE_OPENAI_ENDPOINT="$AZURE_OPENAI_ENDPOINT" \
  -e AZURE_OPENAI_DEPLOYMENT_NAME="$AZURE_OPENAI_DEPLOYMENT_NAME" \
  -e AZURE_OPENAI_API_KEY="$AZURE_OPENAI_API_KEY" \
  "$API_IMAGE"

# ── Start Web ─────────────────────────────────────────────────────────────────
echo "==> Starting Web..."
docker run -d \
  --name "$WEB_CONTAINER" \
  --network "$NETWORK" \
  -p "${WEB_PORT}:80" \
  "$WEB_IMAGE"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "All services running:"
echo "  Web     → http://localhost:${WEB_PORT}"
echo "  API     → http://localhost:${API_PORT}"
echo "  MongoDB → mongodb://localhost:${MONGO_PORT}"
echo ""
echo "To stop and remove all containers:"
echo "  docker rm -f ${WEB_CONTAINER} ${API_CONTAINER} ${MONGO_CONTAINER}"
