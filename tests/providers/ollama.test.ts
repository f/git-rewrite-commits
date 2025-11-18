import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaProvider } from '../../src/providers/ollama';
import fetch from 'node-fetch';

// Mock node-fetch
vi.mock('node-fetch');
const mockFetch = vi.mocked(fetch);

describe('OllamaProvider', () => {
  let provider: OllamaProvider;
  const baseUrl = 'http://localhost:11434';
  const model = 'llama3.2';

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new OllamaProvider(model, baseUrl);
  });

  it('should initialize with default values', () => {
    const defaultProvider = new OllamaProvider();
    expect(defaultProvider.getName()).toContain('llama3.2');
  });

  it('should initialize with custom values', () => {
    const customProvider = new OllamaProvider('custom-model', 'http://custom-url');
    expect(customProvider.getName()).toContain('custom-model');
  });

  it('should generate commit message successfully', async () => {
    const mockMessage = 'feat: test commit message';

    // Mock checkConnection response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [{ name: `${model}:latest` }] })
    } as any);

    // Mock generate response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: { content: mockMessage } })
    } as any);

    const result = await provider.generateCommitMessage('prompt', 'system prompt');

    expect(result).toBe(mockMessage);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw error if connection check fails', async () => {
    mockFetch.mockRejectedValueOnce({ code: 'ECONNREFUSED' });

    await expect(provider.generateCommitMessage('prompt', 'system prompt'))
      .rejects.toThrow(/Cannot connect to Ollama/);
  });

  it('should throw error if model is not found', async () => {
    // Mock checkConnection response with different model
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [{ name: 'other-model:latest' }] })
    } as any);

    await expect(provider.generateCommitMessage('prompt', 'system prompt'))
      .rejects.toThrow(/Model 'llama3.2' not found/);
  });

  it('should throw error if API returns error', async () => {
    // Mock checkConnection success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [{ name: `${model}:latest` }] })
    } as any);

    // Mock generate error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    } as any);

    await expect(provider.generateCommitMessage('prompt', 'system prompt'))
      .rejects.toThrow(/Ollama API error \(500\)/);
  });
});
