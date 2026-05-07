#!/usr/bin/env node
// Extracts vocabulary from each Everyday Activities chapter via OCR,
// enriches with Vietnamese (MyMemory) and IPA (Free Dictionary API),
// outputs public/media/everyday/vocab.json.
// Run: node scripts/generate-everyday-vocab.mjs
// Safe to re-run — cached results are skipped.

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PDF = path.join(ROOT, 'public/media/everyday/english-for-everyday-activities-pdf-free.pdf');
const VOCAB_OUT = path.join(ROOT, 'public/media/everyday/vocab.json');
const CACHE_FILE = path.join(ROOT, 'scripts/.everyday-cache.json');
const TMP = tmpdir();

const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) : {};
const saveCache = () => writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
const wait = ms => new Promise(r => setTimeout(r, ms));

// Only the FIRST page of each chapter has the Key Vocabulary box.
const CHAPTERS = [
  { num: 1,  firstPage: 4  },
  { num: 2,  firstPage: 6  },
  { num: 3,  firstPage: 7  },
  { num: 4,  firstPage: 8  },
  { num: 5,  firstPage: 10 },
  { num: 6,  firstPage: 12 },
  { num: 7,  firstPage: 13 },
  { num: 8,  firstPage: 14 },
  { num: 9,  firstPage: 15 },
  { num: 10, firstPage: 16 },
  { num: 11, firstPage: 17 },
  { num: 12, firstPage: 18 },
  { num: 13, firstPage: 20 },
  { num: 14, firstPage: 21 },
  { num: 15, firstPage: 22 },
  { num: 16, firstPage: 24 },
  { num: 17, firstPage: 25 },
  { num: 18, firstPage: 26 },
  { num: 19, firstPage: 27 },
  { num: 20, firstPage: 28 },
  { num: 21, firstPage: 30 },
  { num: 22, firstPage: 31 },
  { num: 23, firstPage: 32 },
  { num: 24, firstPage: 34 },
  { num: 25, firstPage: 35 },
  { num: 26, firstPage: 36 },
  { num: 27, firstPage: 37 },
  { num: 28, firstPage: 38 },
  { num: 29, firstPage: 39 },
  { num: 30, firstPage: 40 },
  { num: 31, firstPage: 41 },
  { num: 32, firstPage: 42 },
  { num: 33, firstPage: 43 },
  { num: 34, firstPage: 44 },
  { num: 35, firstPage: 46 },
  { num: 36, firstPage: 48 },
  { num: 37, firstPage: 50 },
  { num: 38, firstPage: 51 },
  { num: 39, firstPage: 52 },
  { num: 40, firstPage: 53 },
  { num: 41, firstPage: 54 },
  { num: 42, firstPage: 55 },
  { num: 43, firstPage: 56 },
  { num: 44, firstPage: 57 },
  { num: 45, firstPage: 58 },
  { num: 46, firstPage: 59 },
  { num: 47, firstPage: 60 },
  { num: 48, firstPage: 62 },
  { num: 49, firstPage: 64 },
  { num: 50, firstPage: 65 },
  { num: 51, firstPage: 66 },
  { num: 52, firstPage: 67 },
  { num: 53, firstPage: 68 },
  { num: 54, firstPage: 69 },
  { num: 55, firstPage: 70 },
  { num: 56, firstPage: 71 },
  { num: 57, firstPage: 72 },
  { num: 58, firstPage: 74 },
  { num: 59, firstPage: 75 },
  { num: 60, firstPage: 76 },
  { num: 61, firstPage: 77 },
];

const SECTION_LABELS = new Set(['VERBS', 'NOUNS', 'ADJECTIVES', 'ADVERBS', 'OTHERS', 'OTHER', 'EXPRESSIONS', 'PHRASES']);

// Crop: left vocabulary box. Offset (60,330) from original 1240x1753 image.
const CROP = '380x820+60+330';
// Column split: gap > 20px between word right-edge and next word left-edge.
const COL_GAP = 20;
// Min confidence to include a word.
const MIN_CONF = 50;

function ocrChapterPage(pageNum) {
  const imgBase = path.join(TMP, `ea_p${pageNum}`);
  const paddedNum = String(pageNum).padStart(2, '0');
  const imgPath = `${imgBase}-${paddedNum}.png`;

  spawnSync('pdftoppm', ['-r', '150', '-png', '-f', String(pageNum), '-l', String(pageNum), PDF, imgBase]);
  if (!existsSync(imgPath)) {
    console.warn(`  Image not created for page ${pageNum}`);
    return [];
  }

  const cropPath = path.join(TMP, `ea_crop${pageNum}.png`);
  spawnSync('convert', [imgPath, '-crop', CROP, cropPath]);

  const tsvBase = path.join(TMP, `ea_tsv${pageNum}`);
  spawnSync('tesseract', [cropPath, tsvBase, '-l', 'eng', 'tsv']);
  const tsvPath = `${tsvBase}.tsv`;
  if (!existsSync(tsvPath)) return [];

  return parseTSV(readFileSync(tsvPath, 'utf-8'));
}

function parseTSV(tsv) {
  // Collect level-5 (word) entries
  const words = [];
  for (const row of tsv.trim().split('\n')) {
    const c = row.split('\t');
    if (c[0] !== '5') continue;
    const conf = parseInt(c[10]);
    if (isNaN(conf) || conf < MIN_CONF) continue;
    const text = (c[11] ?? '').trim();
    if (!text) continue;
    words.push({
      block: parseInt(c[2]),
      par: parseInt(c[3]),
      lineIdx: parseInt(c[4]),
      x: parseInt(c[6]),
      w: parseInt(c[8]),
      text,
    });
  }

  // Group by (block, par, lineIdx)
  const lineMap = new Map();
  for (const w of words) {
    const key = `${w.block}:${w.par}:${w.lineIdx}`;
    if (!lineMap.has(key)) lineMap.set(key, []);
    lineMap.get(key).push(w);
  }

  const items = []; // { section, term }
  let currentSection = 'VERBS';

  for (const lineWords of lineMap.values()) {
    lineWords.sort((a, b) => a.x - b.x);

    // Split into columns at gaps > COL_GAP
    const cols = [[lineWords[0]]];
    for (let i = 1; i < lineWords.length; i++) {
      const prev = lineWords[i - 1];
      const gap = lineWords[i].x - (prev.x + prev.w);
      if (gap > COL_GAP) cols.push([]);
      cols[cols.length - 1].push(lineWords[i]);
    }

    for (const col of cols) {
      const raw = col.map(w => w.text).join(' ');
      const cleaned = cleanTerm(raw);
      if (!cleaned) continue;

      if (SECTION_LABELS.has(cleaned.toUpperCase())) {
        currentSection = cleaned.toUpperCase() === 'VERBS' ? 'VERBS'
          : cleaned.toUpperCase() === 'NOUNS' ? 'NOUNS'
          : cleaned.toUpperCase() === 'ADJECTIVES' ? 'ADJECTIVES'
          : cleaned.toUpperCase() === 'ADVERBS' ? 'ADVERBS'
          : 'OTHERS';
        continue;
      }

      // Skip the "Key Vocabulary" heading
      if (/^key\s+vocabulary$/i.test(cleaned)) continue;

      items.push({ section: currentSection, term: cleaned });
    }
  }

  return items;
}

function cleanTerm(raw) {
  return raw
    .replace(/\[.*?\]/g, '')          // remove [alternate forms]
    .replace(/^[^a-zA-Z(]+/, '')      // strip leading non-alpha (except open paren)
    .replace(/[.,;:!?—–|]+$/, '')     // strip trailing punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

// --- API lookups ---

async function lookupVi(term) {
  const key = `vi:${term}`;
  if (cache[key] !== undefined) return cache[key];
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(term)}&langpair=en|vi`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 429) {
      console.log('\nQuota exhausted — re-run tomorrow.');
      saveCache();
      process.exit(0);
    }
    const t = data.responseData?.translatedText ?? '';
    const clean = t.toUpperCase().startsWith('MYMEMORY') ? '' : t;
    cache[key] = clean;
    await wait(1200);
    return clean;
  } catch {
    cache[key] = '';
    return '';
  }
}

async function lookupIpa(term) {
  // IPA is only reliable for single words from the Free Dictionary API
  const word = term.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (!word) return '';
  const key = `ipa:${word}`;
  if (cache[key] !== undefined) return cache[key];
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) { cache[key] = ''; return ''; }
    const data = await res.json();
    const ipa = data[0]?.phonetics?.find(p => p.text)?.text ?? data[0]?.phonetic ?? '';
    cache[key] = ipa;
    await wait(200);
    return ipa;
  } catch {
    cache[key] = '';
    return '';
  }
}

// --- Main ---

// Phase 1: OCR all chapter pages
console.log('Phase 1: OCR vocabulary from each chapter page\n');
const rawVocab = {}; // chapterNum → [{section, term}]

for (const ch of CHAPTERS) {
  process.stdout.write(`Chapter ${String(ch.num).padStart(2)} (page ${ch.firstPage})... `);
  const items = ocrChapterPage(ch.firstPage);
  rawVocab[ch.num] = items;
  console.log(`${items.length} terms`);
}

// Phase 2: Collect unique terms and enrich
console.log('\nPhase 2: Translate and look up IPA\n');

const allTerms = [...new Set(
  Object.values(rawVocab).flat().map(v => v.term)
)];

console.log(`Unique terms: ${allTerms.length}`);
let done = 0;
for (const term of allTerms) {
  const vi = await lookupVi(term);
  const ipa = await lookupIpa(term);
  if (vi || ipa) {
    // store in cache (already done by lookup functions)
  }
  done++;
  if (done % 20 === 0) saveCache();
  process.stdout.write(`\r${done}/${allTerms.length}`);
}
saveCache();
console.log('\n');

// Phase 3: Assemble output
const vocab = {};
for (const ch of CHAPTERS) {
  vocab[ch.num] = rawVocab[ch.num].map(({ section, term }) => ({
    term,
    section,
    vi: cache[`vi:${term}`] ?? '',
    ipa: cache[`ipa:${term.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase()}`] ?? '',
  }));
}

writeFileSync(VOCAB_OUT, JSON.stringify(vocab));
console.log(`Wrote ${VOCAB_OUT}`);
console.log('Remember to: git add public/media/everyday/vocab.json && git commit && git push');
