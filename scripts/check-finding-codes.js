#!/usr/bin/env node
// Every finding the rate engine can return has its own sentence here, and
// every sentence here is for a finding the engine can return (F6).
//
// The engine's codes are READ FROM THE ENGINE -- `ALL_CODES` in
// src/rate_engine/findings.py, imported by Python from the engine's own source
// at the commit in rate-engine.pin (the engine the recorded answers in
// test/platform-shapes.json were priced by) -- never copied into this repository.
// They are compared with FINDING_CODES in src/rates.js both ways: a code the
// engine gained that has no sentence, and a sentence for a code it no longer has.
//
//   node scripts/check-finding-codes.js
//
// RATE_ENGINE_SRC names a checkout of the engine to read; its HEAD must be the
// pin. Without it the engine is fetched at the pin (git, one commit deep) into
// node_modules/.cache/rate-engine/<pin> and read from there.

import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { engineAtPin, enginePin } from './engine-at-pin.js';
import { FINDING_CODES, LONGEST_STAY_DAYS } from '../src/rates.js';
import { DICTIONARIES } from '../src/i18n/index.js';

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed:\n${r.stderr || r.stdout}`);
  return r.stdout.trim();
}

const pin = enginePin();

/** `MAX_STAY_DAYS`, the longest stay the engine prices, from its own module. */
function readEngineMaxStayDays(src) {
  const out = sh('python3', ['-I', '-c', 'import sys; sys.path.insert(0, sys.argv[1]); from rate_engine.engine import MAX_STAY_DAYS; print(MAX_STAY_DAYS)', join(src, 'src')]);
  const days = Number(out);
  if (!Number.isInteger(days) || days < 1) throw new Error(`the engine's MAX_STAY_DAYS read back as ${out}`);
  return days;
}

/** `ALL_CODES`, as the engine's own module says it. Python, isolated, the engine's source alone on its path. */
function readEngineCodes(src) {
  const out = sh('python3', ['-I', '-c', 'import json, sys; sys.path.insert(0, sys.argv[1]); from rate_engine.findings import ALL_CODES; print(json.dumps(list(ALL_CODES)))', join(src, 'src')]);
  const codes = JSON.parse(out);
  if (!Array.isArray(codes) || codes.length < 5 || !codes.every((c) => typeof c === 'string')) throw new Error(`the engine's ALL_CODES read back as ${out}`);
  return codes;
}

try {
  const src = engineAtPin();
  const engineCodes = readEngineCodes(src);
  const ours = new Set(FINDING_CODES);
  const theirs = new Set(engineCodes);
  const unworded = engineCodes.filter((c) => !ours.has(c));
  const stale = FINDING_CODES.filter((c) => !theirs.has(c));
  console.log(`  the engine at ${pin.slice(0, 7)} can return ${engineCodes.length} finding codes; these screens word ${FINDING_CODES.length}`);
  for (const c of unworded) console.log(`  FAIL ${c}: the engine can return it, and these screens have no sentence of its own for it`);
  for (const c of stale) console.log(`  FAIL ${c}: a sentence for a code the engine at the pin cannot return`);
  // The screens' longest stay is the engine's: LONGEST_STAY_DAYS (src/rates.js),
  // which fills {days} in the rule and in the engine's refusal of a longer stay,
  // must equal the engine's MAX_STAY_DAYS at the pin.
  const maxDays = readEngineMaxStayDays(src);
  const wrongDays = [];
  if (LONGEST_STAY_DAYS !== maxDays) {
    wrongDays.push('LONGEST_STAY_DAYS');
    console.log(`  FAIL LONGEST_STAY_DAYS is ${LONGEST_STAY_DAYS}; the engine at the pin refuses stays over ${maxDays} days`);
  }
  for (const [language, words] of Object.entries(DICTIONARIES)) {
    const said = words['rates.finding.GAP_STAY_LONGER_THAN_MAX_STAY'] ?? '';
    if (said.includes('{days}') && !/\d/.test(said)) continue;
    wrongDays.push(language);
    console.log(`  FAIL ${language}: the sentence for GAP_STAY_LONGER_THAN_MAX_STAY does not take its days from LONGEST_STAY_DAYS: ${said}`);
  }
  if (unworded.length || stale.length || wrongDays.length) process.exit(1);
  console.log('  ok   every finding code the engine can return has its own sentence, and no other');
  console.log(`  ok   the longest stay is ${maxDays} days on these screens and in the engine, and its sentences take it from LONGEST_STAY_DAYS`);
} catch (err) {
  console.error(`  FAIL the engine's codes could not be read: ${err.message}`);
  process.exit(1);
}
