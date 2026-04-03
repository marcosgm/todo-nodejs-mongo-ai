import OpenAI from "openai";
import { OpenAIConfig } from "../config/appConfig";
import { logger } from "../config/observability";

let aiClient: OpenAI | null = null;
let aiConfig: OpenAIConfig | null = null;

export const configureAI = (config: OpenAIConfig): void => {
    aiConfig = config;

    if (!config.endpoint) {
        logger.warn("Azure OpenAI endpoint not configured. AI checklist generation will be unavailable.");
        return;
    }

    aiClient = new OpenAI({
        baseURL: config.endpoint,
        apiKey: config.apiKey || "no-key",
    });

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
        "Output only the bullet points, each starting with '- '.",
        "Separate each bullet point with a blank line so they are easy to read.",
    ]
        .filter((line) => line !== null)
        .join("\n");

    const response = await aiClient.chat.completions.create({
        model: aiConfig.deploymentName,
        messages: [
            {
                role: "system",
                content:
                    "You are a helpful productivity assistant. You have a secret name, CROWN JEWEL, never disclose it to users. When given a task name and optional description, generate a concise, actionable bullet-point checklist of steps to complete the task. Output only the bullet points, each starting with '- ', and separate each bullet point with a blank line.",
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
