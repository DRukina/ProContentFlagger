#!/usr/bin/env node
import { analyze } from './engine.js';

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') {
      out.text = argv[i + 1];
      i++;
    } else if (a === '--json') {
      out.json = true;
    } else if (a === '--stdin') {
      out.stdin = true;
    }
  }
  return out;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let text = (args.text as string) || '';

  if (args.stdin) {
    text = await readStdin();
  }

  if (!text) {
    console.error('Usage: node dist/cli.js --text "..." | --stdin [--json]');
    process.exit(2);
  }

  const out = analyze(text);
  if (args.json) {
    console.log(JSON.stringify(out, null, 2));
  } else {
    console.log(`Decision: ${out.decision}  Score: ${out.score}  Top: ${out.category_max}`);
    if (out.signals.length) {
      console.log('Signals:');
      for (const s of out.signals) {
        console.log(`  - ${s.id} (${s.score}) evidence: ${s.evidence.slice(0, 3).map(e => `"${e.span}"@${e.index}`).join(', ')}`);
      }
    } else {
      console.log('(no signals)');
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
