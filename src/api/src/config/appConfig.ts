export interface ObservabilityConfig {
    connectionString: string
    roleName: string
}

export interface DatabaseConfig {
    connectionString: string
    databaseName: string
}

export interface OpenAIConfig {
    endpoint: string
    deploymentName: string
    apiKey: string
}

export interface AppConfig {
    observability: ObservabilityConfig
    database: DatabaseConfig
    openai: OpenAIConfig
}
