"""PromptShield Python backend — LLM security analysis and reporting."""

from typing import Optional
import httpx
import json
import time


class ScanResult:
    def __init__(self, prompt: str, verdict: str, score: float, categories: list, latency_ms: float):
        self.prompt = prompt
        self.verdict = verdict
        self.score = score
        self.categories = categories
        self.latency_ms = latency_ms

    def to_dict(self) -> dict:
        return {
            "prompt": self.prompt,
            "verdict": self.verdict,
            "score": self.score,
            "categories": self.categories,
            "latency_ms": self.latency_ms,
        }

    def __repr__(self) -> str:
        return f"<ScanResult {self.verdict} score={self.score:.2f}>"


class PromptShield:
    def __init__(self, api_key: Optional[str] = None, policies: Optional[str] = None):
        self.api_key = api_key
        self.policies = policies
        self._patterns = self._load_patterns()

    def _load_patterns(self) -> dict:
        return {
            "ignore_instructions": r"ignore\s+(all\s+)?(previous|above|prior)\s+instructions",
            "dan_mode": r"(dan|do\s+anything\s+now|jailbreak)",
            "harmful": r"(hack|bomb|weapon|kill|steal|fraud)",
            "data_extraction": r"(extract|exfiltrate|leak|dump)\s+(data|training|prompt|system)",
            "roleplay": r"act\s+as\s+(if|though|you\s+are)\s+(an?\s+)?(unrestricted|free|without\s+rules)",
        }

    def scan(self, prompt: str) -> ScanResult:
        import re
        start = time.time()
        max_score = 0.0
        matched_categories = []

        for category, pattern in self._patterns.items():
            if re.search(pattern, prompt, re.IGNORECASE):
                max_score = max(max_score, 0.8)
                matched_categories.append(category)

        verdict = "malicious" if max_score >= 0.8 else "suspicious" if max_score >= 0.5 else "safe"
        latency = (time.time() - start) * 1000

        return ScanResult(prompt, verdict, max_score, matched_categories, latency)

    def scan_batch(self, prompts: list) -> list:
        return [self.scan(p) for p in prompts]
