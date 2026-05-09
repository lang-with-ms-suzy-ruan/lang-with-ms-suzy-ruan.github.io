#!/usr/bin/env node
// Adds pinyin to each kanji entry in public/media/kanji/KanjiData.json.
// Uses pinyin-pro (offline, pure JS — no API calls or quota limits).
// Safe to re-run: skips entries that already have a pinyin field.
// Run: node scripts/add-pinyin.mjs
// After: git add public/media/kanji/KanjiData.json && git commit && git push

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pinyin } from 'pinyin-pro';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'public/media/kanji/KanjiData.json');

const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));

let added = 0;
const updated = data.map(entry => {
  if (entry.pinyin !== undefined) return entry;
  const result = pinyin(entry.char, { toneType: 'symbol', separator: ' ' });
  added++;
  return { ...entry, pinyin: result || '' };
});

writeFileSync(DATA_FILE, JSON.stringify(updated));
console.log(`Added pinyin to ${added} entries (${data.length - added} already had it).`);
console.log('Remember to: git add public/media/kanji/KanjiData.json && git commit && git push');
