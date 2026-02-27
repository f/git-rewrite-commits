import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './types.js';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash-lite') {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateCommitMessage(prompt: string, systemPrompt: string): Promise<string> {
    const generativeModel = this.genAI.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 200,
      },
    });

    const result = await generativeModel.generateContent(prompt);
    const message = result.response.text().trim();

    if (!message) {
      throw new Error('No commit message generated');
    }

    return message;
  }

  getName(): string {
    return `Gemini (${this.model})`;
  }
}
