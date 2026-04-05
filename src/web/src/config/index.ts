/// <reference types="vite/client" />

export interface ApiConfig {
    baseUrl: string
}

export interface ObservabilityConfig {
    connectionString: string
}

export interface AppConfig {
    api: ApiConfig
    observability: ObservabilityConfig
}

// Runtime config injected by /config.js (nginx-served, overridden in k8s via ConfigMap).
// Falls back to Vite build-time env vars so local `npm run dev` still works.
declare global {
    interface Window {
        __config?: {
            API_BASE_URL?: string;
            APPLICATIONINSIGHTS_CONNECTION_STRING?: string;
        };
    }
}

const runtimeConfig = window.__config || {};

const config: AppConfig = {
    api: {
        baseUrl: runtimeConfig.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3100'
    },
    observability: {
        connectionString: runtimeConfig.APPLICATIONINSIGHTS_CONNECTION_STRING || import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING || ''
    }
}

export default config;