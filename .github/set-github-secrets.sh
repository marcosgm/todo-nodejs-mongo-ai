#!/usr/bin/env bash
# Sets GitHub Actions secrets into the "production" environment.
# Creates the environment if it does not already exist.
# Prerequisites: gh CLI installed and authenticated (gh auth login).
# Usage: bash .github/set-github-secrets.sh [--repo OWNER/REPO]

set -euo pipefail

ENVIRONMENT="production"

# ---------------------------------------------------------------------------
# Repository (defaults to the repo detected by gh from the current directory)
# ---------------------------------------------------------------------------
REPO_FLAG=""
REPO=""
if [[ "${1:-}" == "--repo" && -n "${2:-}" ]]; then
  REPO_FLAG="--repo $2"
  REPO="$2"
else
  REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
fi

# ---------------------------------------------------------------------------
# Ensure the environment exists (idempotent)
# ---------------------------------------------------------------------------
echo ""
echo "=== Ensuring environment '$ENVIRONMENT' exists ==="
gh api --method PUT "repos/${REPO}/environments/${ENVIRONMENT}" --silent
echo "  Environment '$ENVIRONMENT' is ready."

gh_secret() {
  local name="$1"
  local value="$2"
  echo "  Setting $name..."
  # shellcheck disable=SC2086
  gh secret set "$name" --body "$value" --env "$ENVIRONMENT" $REPO_FLAG
}

# Allow users to keep a single local value while supporting workflow secret names.
if [[ -z "${AZURE_CONTAINER_REGISTRY:-}" && -n "${IMAGE_REGISTRY:-}" ]]; then
  AZURE_CONTAINER_REGISTRY="$IMAGE_REGISTRY"
fi

echo ""
echo "=== Azure authentication secrets ==="
: "${AZURE_CLIENT_ID:?       Set AZURE_CLIENT_ID in your shell before running this script}"
: "${AZURE_TENANT_ID:?       Set AZURE_TENANT_ID in your shell before running this script}"
: "${AZURE_SUBSCRIPTION_ID:? Set AZURE_SUBSCRIPTION_ID in your shell before running this script}"

gh_secret "AZURE_CLIENT_ID"       "$AZURE_CLIENT_ID"
gh_secret "AZURE_TENANT_ID"       "$AZURE_TENANT_ID"
gh_secret "AZURE_SUBSCRIPTION_ID" "$AZURE_SUBSCRIPTION_ID"

echo ""
echo "=== AKS/ACR deployment secrets ==="
: "${AZURE_CONTAINER_REGISTRY:? Set AZURE_CONTAINER_REGISTRY in your shell before running this script}"
: "${RESOURCE_GROUP:?            Set RESOURCE_GROUP in your shell before running this script}"
: "${CLUSTER_NAME:?              Set CLUSTER_NAME in your shell before running this script}"
: "${NAMESPACE:?                 Set NAMESPACE in your shell before running this script}"

gh_secret "AZURE_CONTAINER_REGISTRY" "$AZURE_CONTAINER_REGISTRY"
gh_secret "RESOURCE_GROUP"            "$RESOURCE_GROUP"
gh_secret "CLUSTER_NAME"              "$CLUSTER_NAME"
gh_secret "NAMESPACE"                 "$NAMESPACE"

echo ""
echo "=== Application runtime secrets ==="
: "${AZURE_OPENAI_ENDPOINT:?               Set AZURE_OPENAI_ENDPOINT in your shell before running this script}"
: "${AZURE_OPENAI_DEPLOYMENT_NAME:?        Set AZURE_OPENAI_DEPLOYMENT_NAME in your shell before running this script}"
: "${AZURE_OPENAI_API_KEY:?                Set AZURE_OPENAI_API_KEY in your shell before running this script}"
: "${AZURE_MONGO_CONNECTION_STRING:?       Set AZURE_MONGO_CONNECTION_STRING in your shell before running this script}"
: "${AZURE_MONGO_DATABASE_NAME:?           Set AZURE_MONGO_DATABASE_NAME in your shell before running this script}"
: "${APPLICATIONINSIGHTS_CONNECTION_STRING:? Set APPLICATIONINSIGHTS_CONNECTION_STRING in your shell before running this script}"
: "${IMAGE_REGISTRY:?                      Set IMAGE_REGISTRY in your shell before running this script}"

gh_secret "AZURE_OPENAI_ENDPOINT"                "$AZURE_OPENAI_ENDPOINT"
gh_secret "AZURE_OPENAI_DEPLOYMENT_NAME"         "$AZURE_OPENAI_DEPLOYMENT_NAME"
gh_secret "AZURE_OPENAI_API_KEY"                 "$AZURE_OPENAI_API_KEY"
gh_secret "AZURE_MONGO_CONNECTION_STRING"        "$AZURE_MONGO_CONNECTION_STRING"
gh_secret "AZURE_MONGO_DATABASE_NAME"            "$AZURE_MONGO_DATABASE_NAME"
gh_secret "APPLICATIONINSIGHTS_CONNECTION_STRING" "$APPLICATIONINSIGHTS_CONNECTION_STRING"
gh_secret "IMAGE_REGISTRY"                       "$IMAGE_REGISTRY"


echo ""
echo ""
echo "All secrets set successfully in the '$ENVIRONMENT' environment."
