#!/usr/bin/env node
// Reads public/media/kanji/Kanji.csv and outputs public/media/kanji/KanjiData.json.
// Looks up readings and English meanings from Jisho API, with local cache for resumability.
// Run: node scripts/enrich-kanji.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CSV_FILE = path.join(ROOT, 'public/media/kanji/Kanji.csv');
const OUTPUT_FILE = path.join(ROOT, 'public/media/kanji/KanjiData.json');
const CACHE_FILE = path.join(ROOT, 'scripts/.jisho-cache.json');

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 600;

const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) : {};
const saveCache = () => writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

const wait = ms => new Promise(r => setTimeout(r, ms));
const toHiragana = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

async function lookup(word) {
  if (cache[word] !== undefined) return cache[word];
  try {
    const res = await fetch(`https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`);
    if (!res.ok) { cache[word] = null; return null; }
    const { data } = await res.json();
    if (!data?.length) { cache[word] = null; return null; }
    const entry = data[0];
    // Only use the reading when Jisho has an exact word match (avoids wrong reading for phrases)
    const jpExact = entry.japanese.find(j => j.word === word);
    const reading = jpExact?.reading ? toHiragana(jpExact.reading) : '';
    const meaning = entry.senses[0]?.english_definitions?.slice(0, 4).join(', ') ?? '';
    cache[word] = { reading, meaning };
    return cache[word];
  } catch (e) {
    console.warn(`\nFailed to look up "${word}": ${e.message}`);
    cache[word] = null;
    return null;
  }
}

// Parse CSV: kanji, related (col2), phrases (col3 separated by 、), vocabulary (col4 separated by 、)
const csv = readFileSync(CSV_FILE, 'utf-8');
const parsed = csv.split('\n')
  .filter(r => r.trim())
  .map(row => {
    const parts = row.split(',');
    return {
      char: parts[0]?.trim() ?? '',
      related: (parts[1] ?? '').split('、').map(s => s.trim()).filter(Boolean),
      phrases: (parts[2] ?? '').split('、').map(s => s.trim()).filter(Boolean),
      vocabulary: (parts[3] ?? '').split('、').map(s => s.trim()).filter(Boolean),
    };
  })
  .filter(k => k.char);

const uniqueWords = [...new Set(parsed.flatMap(k => [...k.phrases, ...k.vocabulary]))];
const toFetch = uniqueWords.filter(w => cache[w] === undefined);
console.log(`Unique words: ${uniqueWords.length} | Cached: ${uniqueWords.length - toFetch.length} | To fetch: ${toFetch.length}`);

let fetched = 0;
for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
  const batch = toFetch.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(w => lookup(w)));
  fetched += batch.length;
  saveCache();
  const pct = Math.round((fetched / toFetch.length) * 100);
  process.stdout.write(`\rFetching: ${fetched}/${toFetch.length} (${pct}%)`);
  if (i + BATCH_SIZE < toFetch.length) await wait(BATCH_DELAY_MS);
}
if (toFetch.length > 0) console.log('\nDone fetching.');

const empty = { reading: '', meaning: '' };
const enriched = parsed.map(k => ({
  char: k.char,
  related: k.related,
  phrases: k.phrases.map(w => ({ word: w, ...(cache[w] ?? empty) })),
  vocabulary: k.vocabulary.map(w => ({ word: w, ...(cache[w] ?? empty) })),
}));

writeFileSync(OUTPUT_FILE, JSON.stringify(enriched));
console.log(`Written: ${OUTPUT_FILE}`);
