export interface AIProvider {
  generateCommitMessage(prompt: string, systemPrompt: string): Promise<string>;
  getName(): string;
}

export interface ProviderOptions {
  provider?: 'openai' | 'ollama' | 'claude-code';
  apiKey?: string;
  model?: string;
  ollamaUrl?: string;
}
