// Runtime configuration for local development.
// In Kubernetes this file is overridden by a ConfigMap volume mount.
window.__config = {
  API_BASE_URL: 'http://localhost:3100',
  APPLICATIONINSIGHTS_CONNECTION_STRING: ''
};
