// This file will be replaced or provided at container runtime via a ConfigMap mount.
// It exposes a global runtime config object the app can read from `window.__RUNTIME_CONFIG__`.
(function () {
  // Default empty config; Kubernetes can mount a ConfigMap that defines MIP_BACKEND_URL
  window.__RUNTIME_CONFIG__ ||= {};
  // If an environment-specific global was injected, prefer that too
  if (window.MIP_BACKEND_URL) window.__RUNTIME_CONFIG__.MIP_BACKEND_URL = window.MIP_BACKEND_URL;
})();
