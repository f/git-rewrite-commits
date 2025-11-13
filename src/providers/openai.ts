import OpenAI from 'openai';
import { AIProvider } from './types';

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateCommitMessage(prompt: string, systemPrompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
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
      temperature: 0.3,
      max_tokens: 200,
    });

    const message = response.choices[0]?.message?.content?.trim();
    if (!message) {
      throw new Error('No commit message generated');
    }

    return message;
  }
  async validateApiKey(): Promise<void> {
    try {
      await this.openai.models.list();
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid OpenAI API key');
      }
      throw error;
    }
  }
  getName(): string {
    return `OpenAI (${this.model})`;
  }
}
