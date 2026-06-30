import { describe, it, expect } from 'vitest';

describe('PromptShield CLI', () => {
  it('should export PromptShield class', async () => {
    const { PromptShield } = await import('../src/core/analyzer');
    expect(PromptShield).toBeDefined();
  });

  it('should create instance with default config', () => {
    const { PromptShield } = require('../src/core/analyzer');
    const shield = new PromptShield();
    expect(shield).toBeInstanceOf(PromptShield);
  });
});
