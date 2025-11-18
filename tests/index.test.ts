import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitCommitRewriter } from '../src/index';
import * as fs from 'fs';
import { execSync } from 'child_process';

// Mock dependencies
vi.mock('child_process');
vi.mock('fs');
vi.mock('ora', () => {
  return {
    default: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      succeed: vi.fn(),
      fail: vi.fn(),
      info: vi.fn()
    })
  };
});

// Mock OpenAI provider to avoid API calls
vi.mock('../src/providers/openai', () => {
  return {
    OpenAIProvider: class {
      generateCommitMessage = vi.fn().mockResolvedValue('feat: mocked commit message');
      getName = () => 'OpenAI (mock)';
    }
  };
});

describe('GitCommitRewriter', () => {
  const mockExecSync = vi.mocked(execSync);
  const mockFs = vi.mocked(fs);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
    // Default mock for execSync to return empty string or success
    mockExecSync.mockReturnValue('');
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const rewriter = new GitCommitRewriter({ apiKey: 'test' });
      expect(rewriter).toBeDefined();
    });

    it('should throw error if openai key is missing for openai provider', () => {
      delete process.env.OPENAI_API_KEY;
      expect(() => new GitCommitRewriter({ provider: 'openai' }))
        .toThrow('OpenAI API key is required');
    });
  });

  describe('assessCommitQuality', () => {
    let rewriter: GitCommitRewriter;

    beforeEach(() => {
      rewriter = new GitCommitRewriter({ apiKey: 'test' });
    });

    it('should score well-formed conventional commit high', () => {
      // Access private method via any cast
      const result = (rewriter as any).assessCommitQuality('feat: add new feature');
      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.isWellFormed).toBe(true);
    });

    it('should score poorly formed commit low', () => {
      const result = (rewriter as any).assessCommitQuality('fixed bug');
      expect(result.score).toBeLessThan(7);
      expect(result.isWellFormed).toBe(false);
    });

    it('should detect generic messages', () => {
      const result = (rewriter as any).assessCommitQuality('update');
      expect(result.reason).toContain('too generic');
    });
  });

  describe('generateForStaged', () => {
    let rewriter: GitCommitRewriter;

    beforeEach(() => {
      rewriter = new GitCommitRewriter({
        apiKey: 'test',
        quiet: true, // Skip prompts
        skipRemoteConsent: true
      });
    });

    it('should throw if not a git repo', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('rev-parse --git-dir')) throw new Error('Not a git repo');
        return '';
      });

      await expect(rewriter.generateForStaged())
        .rejects.toThrow('Not a git repository!');
    });

    it('should throw if no staged changes', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('diff --cached --name-only')) return '';
        return '';
      });

      await expect(rewriter.generateForStaged())
        .rejects.toThrow('No staged changes found');
    });

    it('should generate message for staged changes', async () => {
      mockExecSync.mockImplementation((cmd) => {
        if (cmd.includes('diff --cached --name-only')) return 'file1.ts\nfile2.ts';
        if (cmd === 'git diff --cached') return 'diff content';
        return '';
      });

      const message = await rewriter.generateForStaged();
      expect(message).toBe('feat: mocked commit message');
    });
  });
});
