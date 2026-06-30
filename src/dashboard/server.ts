/**
 * PromptShield Dashboard — React-based web UI
 */

import express from 'express';
import { PromptShield } from '../core/analyzer';

const app = express();
app.use(express.json());

const shield = new PromptShield();

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', version: '0.1.0' });
});

app.post('/v1/scan', async (req, res) => {
  const { prompt, policies } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }
  const result = await shield.scan(prompt);
  res.json(result);
});

app.post('/v1/policies/test', async (req, res) => {
  const { policy, prompts } = req.body;
  const results = await Promise.all(prompts.map((p: string) => shield.scan(p)));
  res.json({ policy, results });
});

app.get('/v1/analytics', (_req, res) => {
  res.json({
    total_scans: 1247,
    blocked: 342,
    flagged: 156,
    safe: 749,
    top_categories: [
      { name: 'harmful_instructions', count: 145 },
      { name: 'jailbreak', count: 98 },
      { name: 'data_extraction', count: 67 },
    ],
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`PromptShield API running on http://localhost:${PORT}`);
});

export default app;
