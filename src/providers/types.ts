export interface AIProvider {
  generateCommitMessage(prompt: string, systemPrompt: string): Promise<string>;
  getName(): string;
  validateApiKey?(): Promise<void>;
}

export interface ProviderOptions {
  provider?: 'openai' | 'ollama';
  apiKey?: string;
  model?: string;
  ollamaUrl?: string;
}
