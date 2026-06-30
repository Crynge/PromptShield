/**
 * PromptShield — Enterprise LLM Security Framework
 * Core analyzer implementation in TypeScript
 */

export interface ScanResult {
  prompt: string;
  verdict: 'safe' | 'suspicious' | 'malicious';
  score: number;
  categories: string[];
  details: CategoryDetail[];
  latency_ms: number;
  timestamp: string;
}

export interface CategoryDetail {
  category: string;
  score: number;
  matched_patterns: string[];
  action: 'allow' | 'flag' | 'block';
}

export interface PromptShieldConfig {
  apiKey?: string;
  policies?: string;
  analyzers?: {
    heuristic?: boolean;
    semantic?: boolean;
    llmJudge?: boolean;
    rustMatcher?: boolean;
  };
  thresholds?: {
    safe?: number;
    suspicious?: number;
    malicious?: number;
  };
}

export class PromptShield {
  private config: PromptShieldConfig;

  constructor(config: PromptShieldConfig = {}) {
    this.config = {
      analyzers: { heuristic: true, semantic: false, llmJudge: false, rustMatcher: false },
      thresholds: { safe: 0.3, suspicious: 0.6, malicious: 0.8 },
      ...config,
    };
  }

  async scan(prompt: string): Promise<ScanResult> {
    const start = Date.now();
    const categories: CategoryDetail[] = [];
    let maxScore = 0;

    if (this.config.analyzers?.heuristic) {
      const result = this.heuristicAnalysis(prompt);
      categories.push(...result);
      maxScore = Math.max(maxScore, ...result.map(r => r.score));
    }

    const verdict = maxScore >= (this.config.thresholds?.malicious ?? 0.8)
      ? 'malicious'
      : maxScore >= (this.config.thresholds?.suspicious ?? 0.6)
        ? 'suspicious'
        : 'safe';

    return {
      prompt,
      verdict,
      score: maxScore,
      categories: categories.map(c => c.category),
      details: categories,
      latency_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  }

  private heuristicAnalysis(prompt: string): CategoryDetail[] {
    const results: CategoryDetail[] = [];
    const patterns: Record<string, { regex: RegExp; score: number; action: 'allow' | 'flag' | 'block' }> = {
      ignore_instructions: { regex: /ignore\s+(all\s+)?(previous|above|prior)\s+instructions/i, score: 0.85, action: 'block' },
      dan_mode: { regex: /(dan|do\s+anything\s+now|jailbreak)/i, score: 0.9, action: 'block' },
      developer_mode: { regex: /developer\s*mode/i, score: 0.7, action: 'flag' },
      harmful_instructions: { regex: /(hack|bomb|weapon|kill|steal|fraud)/i, score: 0.9, action: 'block' },
      data_extraction: { regex: /(extract|exfiltrate|leak|dump)\s+(data|training|prompt|system)/i, score: 0.75, action: 'block' },
      roleplay_bypass: { regex: /act\s+as\s+(if|though|you\s+are)\s+(an?\s+)?(unrestricted|free|without\s+rules)/i, score: 0.7, action: 'flag' },
    };

    for (const [category, config] of Object.entries(patterns)) {
      if (config.regex.test(prompt)) {
        results.push({
          category,
          score: config.score,
          matched_patterns: [config.regex.source],
          action: config.action,
        });
      }
    }

    return results;
  }
}
