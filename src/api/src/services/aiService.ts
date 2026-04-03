import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { OpenAIConfig } from "../config/appConfig";
import { logger } from "../config/observability";

let aiClient: AzureOpenAI | null = null;
let aiConfig: OpenAIConfig | null = null;

export const configureAI = (config: OpenAIConfig): void => {
    aiConfig = config;

    if (!config.endpoint) {
        logger.warn("Azure OpenAI endpoint not configured. AI checklist generation will be unavailable.");
        return;
    }

    if (config.apiKey) {
        aiClient = new AzureOpenAI({
            endpoint: config.endpoint,
            apiKey: config.apiKey,
            deployment: config.deploymentName,
            apiVersion: "2024-08-01-preview",
        });
    } else {
        const credential = new DefaultAzureCredential();
        const azureADTokenProvider = getBearerTokenProvider(
            credential,
            "https://cognitiveservices.azure.com/.default"
        );
        aiClient = new AzureOpenAI({
            endpoint: config.endpoint,
            azureADTokenProvider,
            deployment: config.deploymentName,
            apiVersion: "2024-08-01-preview",
        });
    }

    logger.info("Azure OpenAI client configured successfully.");
};

export const generateChecklist = async (name: string, description?: string): Promise<string> => {
    if (!aiClient || !aiConfig) {
        throw new Error("Azure OpenAI client is not configured. Set AZURE_OPENAI_ENDPOINT to enable AI features.");
    }

    const userMessage = [
        `Task name: ${name}`,
        description ? `Task description: ${description}` : null,
        "",
        "Generate a concise, actionable bullet-point checklist of steps to complete this task.",
        "Output only the bullet points, one per line, starting each with '- '.",
    ]
        .filter((line) => line !== null)
        .join("\n");

    const response = await aiClient.chat.completions.create({
        model: aiConfig.deploymentName,
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful productivity assistant. When given a task name and optional description, generate a concise, actionable bullet-point checklist of steps to complete the task. Output only the bullet points.",
            },
            {
                role: "user",
                content: userMessage,
            },
        ],
        max_tokens: 500,
        temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() ?? "";
};
