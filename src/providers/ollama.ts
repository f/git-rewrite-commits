import fetch from 'node-fetch';
import { AIProvider } from './types.js';

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
}

interface OllamaTagsResponse {
  models?: { name: string }[];
}

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(model: string = 'llama3.2', baseUrl: string = 'http://localhost:11436') {
    this.model = model;
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash if present
  }

  async generateCommitMessage(prompt: string, systemPrompt: string): Promise<string> {
    const url = `${this.baseUrl}/api/chat`;
    
    try {
      // Check if Ollama is running
      await this.checkConnection();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          stream: false,
          options: {
            temperature: 0.3,
            max_tokens: 200,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as OllamaChatResponse;
      const message = data.message?.content?.trim();
      
      if (!message) {
        throw new Error('No commit message generated from Ollama');
      }

      return message;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Make sure Ollama is running (run 'ollama serve' in terminal)`);
      }
      throw error;
    }
  }

  private async checkConnection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Ollama server is not responding correctly');
      }

      const data = await response.json() as OllamaTagsResponse;
      const models = data.models || [];
      const modelNames = models.map((m: any) => m.name.split(':')[0]);
      
      if (!modelNames.includes(this.model.split(':')[0])) {
        throw new Error(
          `Model '${this.model}' not found in Ollama. Available models: ${modelNames.join(', ')}\n` +
          `To pull the model, run: ollama pull ${this.model}`
        );
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Ollama at ${this.baseUrl}. Make sure Ollama is running (run 'ollama serve' in terminal)`);
      }
      throw error;
    }
  }

  getName(): string {
    return `Ollama (${this.model})`;
  }
}
