/**
 * PromptShield CLI — Command-line interface
 */

import { Command } from 'commander';
import { PromptShield } from '../core/analyzer';
import * as fs from 'fs';

const program = new Command();

program
  .name('promptshield')
  .description('Enterprise LLM prompt security and red-teaming framework')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan a prompt for security violations')
  .argument('[prompt]', 'The prompt to scan')
  .option('-f, --file <path>', 'File containing prompts')
  .option('--verbose', 'Show detailed output')
  .action(async (prompt, options) => {
    const shield = new PromptShield();
    let prompts: string[] = [];

    if (options.file) {
      const content = fs.readFileSync(options.file, 'utf-8');
      prompts = content.split('\n').filter(Boolean);
    } else if (prompt) {
      prompts = [prompt];
    } else {
      console.error('Error: Provide a prompt or use --file');
      process.exit(1);
    }

    for (const p of prompts) {
      const result = await shield.scan(p);
      if (options.verbose) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`[${result.verdict.toUpperCase()}] (${(result.score * 100).toFixed(0)}%) ${p.slice(0, 60)}...`);
      }
    }
  });

program
  .command('interactive')
  .description('Start an interactive scanning session')
  .action(async () => {
    const shield = new PromptShield();
    console.log('PromptShield Interactive — Type prompts to scan (Ctrl+C to quit)\n');
    process.stdin.setEncoding('utf-8');
    let buffer = '';
    process.stdin.on('data', async (chunk: string) => {
      buffer += chunk;
      if (buffer.includes('\n')) {
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim()) {
            const result = await shield.scan(line.trim());
            console.log(`\n  [${result.verdict.toUpperCase()}] Score: ${(result.score * 100).toFixed(0)}%`);
            if (result.categories.length) {
              console.log(`  Categories: ${result.categories.join(', ')}`);
            }
            console.log(`  Latency: ${result.latency_ms}ms\n`);
          }
        }
      }
    });
  });

program.parse(process.argv);
