#!/usr/bin/env bash
set -eu

: "${IMAGE_REGISTRY:?IMAGE_REGISTRY must be set}"
: "${AZURE_MONGO_DATABASE_NAME:?AZURE_MONGO_DATABASE_NAME must be set}"
: "${AZURE_OPENAI_DEPLOYMENT_NAME:?AZURE_OPENAI_DEPLOYMENT_NAME must be set}"
: "${AZURE_OPENAI_ENDPOINT:?AZURE_OPENAI_ENDPOINT must be set}"
: "${AZURE_MONGO_CONNECTION_STRING:?AZURE_MONGO_CONNECTION_STRING must be set}"
: "${APPLICATIONINSIGHTS_CONNECTION_STRING:?APPLICATIONINSIGHTS_CONNECTION_STRING must be set}"
: "${AZURE_OPENAI_API_KEY:?AZURE_OPENAI_API_KEY must be set}"

echo "Applying namespace..."
kubectl apply -f "namespace.yaml"

echo "Applying RBAC..."
kubectl apply -f "rbac.yaml"

echo "Applying secrets..."
envsubst < "secrets.yaml" | kubectl apply -f -

echo "Applying configmaps..."
envsubst < "configmap.yaml" | kubectl apply -f -
envsubst < "web-configmap.yaml" | kubectl apply -f -

echo "Applying deployments..."
envsubst < "api-deployment.yaml" | kubectl apply -f -
envsubst < "web-deployment.yaml" | kubectl apply -f -

echo "Applying ingress..."
kubectl apply -f "ingress.yaml"

echo "Done."
