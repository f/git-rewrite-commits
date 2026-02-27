import { AIProvider, ProviderOptions } from './types.js';
import { OpenAIProvider } from './openai.js';
import { OllamaProvider } from './ollama.js';
import { ClaudeCodeProvider } from './claude-code.js';
import { GeminiProvider } from './gemini.js';

export { AIProvider } from './types.js';
export { OpenAIProvider } from './openai.js';
export { OllamaProvider } from './ollama.js';
export { ClaudeCodeProvider } from './claude-code.js';
export { GeminiProvider } from './gemini.js';

export function createProvider(options: ProviderOptions): AIProvider {
  const providerType = options.provider || 'openai';

  if (providerType === 'ollama') {
    return new OllamaProvider(options.model || 'llama3.2', options.ollamaUrl);
  } else if (providerType === 'claude-code') {
    return new ClaudeCodeProvider(options.model || 'haiku');
  } else if (providerType === 'gemini') {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is required. Set GEMINI_API_KEY environment variable or pass it as an option.');
    }
    return new GeminiProvider(apiKey, options.model || 'gemini-2.5-flash-lite');
  } else {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it as an option.');
    }
    return new OpenAIProvider(apiKey, options.model || 'gpt-3.5-turbo');
  }
}
