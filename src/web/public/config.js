// Runtime configuration for local development.
// In Kubernetes this file is overridden by a ConfigMap volume mount —
// do NOT import.meta.env bake values into the production image.
window.__config = {
  API_BASE_URL: 'http://localhost:3100',
  APPLICATIONINSIGHTS_CONNECTION_STRING: ''
};
