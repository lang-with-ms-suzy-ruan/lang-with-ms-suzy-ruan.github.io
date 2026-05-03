#!/usr/bin/env node
// Adds Vietnamese meanings to public/media/kanji/KanjiData.json via MyMemory API.
// Free tier: 5000 requests/day. Run once per day to gradually fill translations.
// Cached in scripts/.vi-cache.json — re-running is safe and fast (skips cached items).
// Run: node scripts/add-vietnamese.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'public/media/kanji/KanjiData.json');
const CACHE_FILE = path.join(ROOT, 'scripts/.vi-cache.json');

const REQUEST_DELAY_MS = 1200; // 1 req/sec — stays within MyMemory free tier

const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) : {};
const saveCache = () => writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
const wait = ms => new Promise(r => setTimeout(r, ms));

async function translateToVi(text) {
  if (!text || cache[text]) return cache[text] ?? '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    if (data.responseStatus === 429) {
      console.log('\nQuota exhausted — commit the progress so far and re-run tomorrow.');
      process.exit(0);
    }
    const translated = data.responseData?.translatedText ?? '';
    const clean = translated.toUpperCase().startsWith('MYMEMORY') ? '' : translated;
    cache[text] = clean;
    return clean;
  } catch (e) {
    console.warn(`\nError for "${text.slice(0, 40)}": ${e.message}`);
    return '';
  }
}

const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));

const allMeanings = [...new Set(
  data.flatMap(k => [...k.phrases, ...k.vocabulary])
    .map(v => v.meaning)
    .filter(m => m && !cache[m])
)];

console.log(`Unique meanings to translate: ${allMeanings.length} | Cached: ${Object.values(cache).filter(Boolean).length}`);
if (allMeanings.length === 0) { console.log('All done!'); }

let done = 0;
for (const meaning of allMeanings) {
  await translateToVi(meaning);
  done++;
  if (done % 10 === 0) saveCache();
  process.stdout.write(`\rTranslating: ${done}/${allMeanings.length} (${Math.round(100 * done / allMeanings.length)}%)`);
  await wait(REQUEST_DELAY_MS);
}
if (allMeanings.length > 0) { saveCache(); console.log('\nDone!'); }

// Write back with meaningVi added
const updated = data.map(k => ({
  ...k,
  phrases: k.phrases.map(v => ({ ...v, meaningVi: cache[v.meaning] ?? '' })),
  vocabulary: k.vocabulary.map(v => ({ ...v, meaningVi: cache[v.meaning] ?? '' })),
}));

writeFileSync(DATA_FILE, JSON.stringify(updated));
console.log(`Updated: ${DATA_FILE}`);
console.log('Remember to: git add public/media/kanji/KanjiData.json && git commit && git push');
