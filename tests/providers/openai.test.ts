import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider } from '../../src/providers/openai';

// Mock OpenAI class
const mockCreate = vi.fn();
vi.mock('openai', () => {
  return {
    default: class {
      chat = {
        completions: {
          create: mockCreate
        }
      }
    }
  };
});

describe('OpenAIProvider', () => {
  const apiKey = 'test-api-key';
  let provider: OpenAIProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new OpenAIProvider(apiKey);
  });

  it('should initialize with api key and default model', () => {
    expect(provider).toBeDefined();
    expect(provider.getName()).toContain('gpt-3.5-turbo');
  });

  it('should initialize with custom model', () => {
    const customProvider = new OpenAIProvider(apiKey, 'gpt-4');
    expect(customProvider.getName()).toContain('gpt-4');
  });

  it('should throw error if api key is missing', () => {
    expect(() => new OpenAIProvider('')).toThrow('OpenAI API key is required');
  });

  it('should generate commit message successfully', async () => {
    const mockMessage = 'feat: test commit message';
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: mockMessage
        }
      }]
    });

    const result = await provider.generateCommitMessage('prompt', 'system prompt');

    expect(result).toBe(mockMessage);
    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'system prompt' },
        { role: 'user', content: 'prompt' }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });
  });

  it('should throw error if no message is generated', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          content: ''
        }
      }]
    });

    await expect(provider.generateCommitMessage('prompt', 'system prompt'))
      .rejects.toThrow('No commit message generated');
  });

  it('should propagate openai errors', async () => {
    const error = new Error('OpenAI API Error');
    mockCreate.mockRejectedValueOnce(error);

    await expect(provider.generateCommitMessage('prompt', 'system prompt'))
      .rejects.toThrow(error);
  });
});
