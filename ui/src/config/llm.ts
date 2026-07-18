// =============================================================================
// MODEL CONFIGURATION — Edit THIS file to switch models or backends
// =============================================================================

export const LLM_CONFIG = {
  // The base URL of your OpenAI-compatible API server
  // Ollama:  "http://localhost:11434/v1"
  // vLLM:    "http://localhost:8000/v1"
  // OpenAI:  "https://api.openai.com/v1"
  apiBaseUrl: "http://localhost:11434/v1",

  // The model identifier (must match what the server knows)
  // Ollama: "qwen2.5:3b" | "qwen2.5:1.5b" | "llama3.2:3b"
  // OpenAI: "gpt-4o"     | "gpt-4o-mini"
  model: "qwen2.5:3b",

  // Optional: API Key — leave blank for Ollama
  apiKey: "",

  // Default system prompt — controls the AI's personality
  systemPrompt:
    "You are a helpful, concise AI assistant running locally on an RTX 3060. Keep responses clear and well-structured. Use markdown formatting when helpful.",

  // UI display name shown in the header
  modelDisplayName: "Qwen 2.5 3B",
  engineName: "Ollama",

  // Generation parameters
  temperature: 0.7,
  maxTokens: 1024,
} as const;

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
};
