#!/usr/bin/env node
// Extracts vocabulary and "For Special Attention" notes from each Everyday
// Activities chapter via OCR, enriches with Vietnamese + IPA, and writes:
//   public/media/everyday/vocab.json  — per-chapter vocabulary
//   public/media/everyday/notes.json  — per-chapter special-attention notes
// Run: node scripts/generate-everyday-vocab.mjs
// Safe to re-run — all API results are cached in scripts/.everyday-cache.json.

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PDF = path.join(ROOT, 'public/media/everyday/english-for-everyday-activities-pdf-free.pdf');
const VOCAB_OUT = path.join(ROOT, 'public/media/everyday/vocab.json');
const NOTES_OUT = path.join(ROOT, 'public/media/everyday/notes.json');
const CACHE_FILE = path.join(ROOT, 'scripts/.everyday-cache.json');
const TMP = tmpdir();

const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf-8')) : {};
const saveCache = () => writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
const wait = ms => new Promise(r => setTimeout(r, ms));
let quotaExhausted = false;

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

// Vocab box: left strip, upper portion
const VOCAB_CROP = '380x820+60+330';
// Special attention: left strip, lower portion (y=1195 to bottom)
const ATTN_CROP = '380x558+60+1195';

const MIN_CONF_VOCAB = 50;
const MIN_CONF_ATTN = 40;
const COL_GAP = 20;

// --- Page image helper (shared between vocab and notes OCR) ---

function ensurePageImage(pageNum) {
  const imgBase = path.join(TMP, `ea_p${pageNum}`);
  const paddedNum = String(pageNum).padStart(2, '0');
  const imgPath = `${imgBase}-${paddedNum}.png`;
  if (!existsSync(imgPath)) {
    spawnSync('pdftoppm', ['-r', '150', '-png', '-f', String(pageNum), '-l', String(pageNum), PDF, imgBase]);
  }
  return existsSync(imgPath) ? imgPath : null;
}

// --- Vocabulary extraction ---

function ocrVocabPage(pageNum) {
  const imgPath = ensurePageImage(pageNum);
  if (!imgPath) { console.warn(`  Image not created for page ${pageNum}`); return []; }

  const cropPath = path.join(TMP, `ea_vocab${pageNum}.png`);
  spawnSync('convert', [imgPath, '-crop', VOCAB_CROP, cropPath]);

  const tsvBase = path.join(TMP, `ea_vocab_tsv${pageNum}`);
  spawnSync('tesseract', [cropPath, tsvBase, '-l', 'eng', 'tsv']);
  const tsvPath = `${tsvBase}.tsv`;
  if (!existsSync(tsvPath)) return [];

  return parseVocabTSV(readFileSync(tsvPath, 'utf-8'));
}

function parseVocabTSV(tsv) {
  const words = [];
  for (const row of tsv.trim().split('\n')) {
    const c = row.split('\t');
    if (c[0] !== '5') continue;
    const conf = parseInt(c[10]);
    if (isNaN(conf) || conf < MIN_CONF_VOCAB) continue;
    const text = (c[11] ?? '').trim();
    if (!text) continue;
    words.push({ block: parseInt(c[2]), par: parseInt(c[3]), lineIdx: parseInt(c[4]), x: parseInt(c[6]), w: parseInt(c[8]), text });
  }

  const lineMap = new Map();
  for (const w of words) {
    const key = `${w.block}:${w.par}:${w.lineIdx}`;
    if (!lineMap.has(key)) lineMap.set(key, []);
    lineMap.get(key).push(w);
  }

  const items = [];
  let currentSection = 'VERBS';

  for (const lineWords of lineMap.values()) {
    lineWords.sort((a, b) => a.x - b.x);
    const cols = [[lineWords[0]]];
    for (let i = 1; i < lineWords.length; i++) {
      const prev = lineWords[i - 1];
      if (lineWords[i].x - (prev.x + prev.w) > COL_GAP) cols.push([]);
      cols[cols.length - 1].push(lineWords[i]);
    }

    for (const col of cols) {
      const raw = col.map(w => w.text).join(' ');
      const cleaned = cleanVocabTerm(raw);
      if (!cleaned) continue;
      if (SECTION_LABELS.has(cleaned.toUpperCase())) {
        currentSection = normalized(cleaned.toUpperCase());
        continue;
      }
      if (/^key\s+vocabulary$/i.test(cleaned)) continue;
      items.push({ section: currentSection, term: cleaned });
    }
  }
  return items;
}

function normalized(label) {
  if (label === 'VERBS') return 'VERBS';
  if (label === 'NOUNS') return 'NOUNS';
  if (label === 'ADJECTIVES') return 'ADJECTIVES';
  if (label === 'ADVERBS') return 'ADVERBS';
  return 'OTHERS';
}

function cleanVocabTerm(raw) {
  return raw
    .replace(/\[.*?\]/g, '')
    .replace(/^[^a-zA-Z(]+/, '')
    .replace(/[.,;:!?—–|]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// --- Special attention extraction ---

function ocrSpecialAttention(pageNum) {
  const imgPath = ensurePageImage(pageNum);
  if (!imgPath) return [];

  const cropPath = path.join(TMP, `ea_attn${pageNum}.png`);
  spawnSync('convert', [imgPath, '-crop', ATTN_CROP, cropPath]);

  const tsvBase = path.join(TMP, `ea_attn_tsv${pageNum}`);
  spawnSync('tesseract', [cropPath, tsvBase, '-l', 'eng', 'tsv']);
  const tsvPath = `${tsvBase}.tsv`;
  if (!existsSync(tsvPath)) return [];

  return parseAttentionTSV(readFileSync(tsvPath, 'utf-8'));
}

function parseAttentionTSV(tsv) {
  // Each Tesseract paragraph (block, par) is one bullet point.
  // block=1 contains the "For Special Attention" heading — skip it.
  const words = [];
  for (const row of tsv.trim().split('\n')) {
    const c = row.split('\t');
    if (c[0] !== '5') continue;
    const conf = parseInt(c[10]);
    if (isNaN(conf) || conf < MIN_CONF_ATTN) continue;
    const text = (c[11] ?? '').trim();
    if (!text) continue;
    const block = parseInt(c[2]);
    if (block === 1) continue; // skip heading block
    words.push({
      block,
      par: parseInt(c[3]),
      lineIdx: parseInt(c[4]),
      wordNum: parseInt(c[5]),
      x: parseInt(c[6]),
      y: parseInt(c[7]),
      text,
    });
  }
  if (words.length === 0) return [];

  // Group by (block, par) → bullet; within that group by lineIdx
  const bulletMap = new Map();
  for (const w of words) {
    const bKey = `${w.block}:${w.par}`;
    if (!bulletMap.has(bKey)) bulletMap.set(bKey, new Map());
    const lineMap = bulletMap.get(bKey);
    const lKey = w.lineIdx;
    if (!lineMap.has(lKey)) lineMap.set(lKey, []);
    lineMap.get(lKey).push(w);
  }

  const bullets = [];
  for (const [, lineMap] of bulletMap) {
    // Sort lines by lineIdx, words by wordNum
    const lines = [...lineMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, ws]) => ws.sort((a, b) => a.wordNum - b.wordNum).map(w => w.text).join(' '));

    const fullText = lines.join(' ').replace(/\s+/g, ' ').trim();
    if (fullText.length < 8) continue; // skip noise

    // Detect and normalize the bullet marker (* / +) at the start
    const firstLine = lines[0] ?? '';
    const firstWord = firstLine.trim().split(/\s+/)[0];
    let marker = '*';
    let content = fullText;

    if (/^[*«x+>|]/.test(firstWord) && firstWord.length <= 2) {
      marker = firstWord.includes('+') ? '+' : '*';
      content = fullText.slice(firstWord.length).trim();
    }

    if (content.length >= 8) {
      bullets.push({ marker, en: content });
    }
  }

  return bullets;
}

// --- API lookups ---

async function lookupVi(text) {
  const key = `vi:${text}`;
  if (cache[key] !== undefined) return cache[key];
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 429) {
      console.log('\nQuota exhausted — writing partial output and exiting.');
      quotaExhausted = true;
      saveCache();
      return '';
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

// Phase 1: OCR all chapter pages (vocab + notes)
console.log('Phase 1: OCR vocabulary and special-attention notes\n');
const rawVocab = {};
const rawNotes = {};

for (const ch of CHAPTERS) {
  process.stdout.write(`Chapter ${String(ch.num).padStart(2)} (page ${ch.firstPage})... `);
  rawVocab[ch.num] = ocrVocabPage(ch.firstPage);
  rawNotes[ch.num] = ocrSpecialAttention(ch.firstPage);
  console.log(`${rawVocab[ch.num].length} vocab | ${rawNotes[ch.num].length} notes`);
}

// Phase 2: Collect unique strings and translate
console.log('\nPhase 2: Translate vocabulary terms\n');

const allTerms = [...new Set(Object.values(rawVocab).flat().map(v => v.term))];
console.log(`Vocab terms: ${allTerms.length}`);
let done = 0;
for (const term of allTerms) {
  if (quotaExhausted) break;
  await lookupVi(term);
  await lookupIpa(term);
  done++;
  if (done % 20 === 0) saveCache();
  process.stdout.write(`\r${done}/${allTerms.length}`);
}
saveCache();
console.log('\n');

console.log('Phase 3: Translate special-attention notes\n');
const allNoteTexts = [...new Set(
  Object.values(rawNotes).flat().map(b => b.en)
)];
console.log(`Note bullets: ${allNoteTexts.length}`);
done = 0;
for (const text of allNoteTexts) {
  if (quotaExhausted) break;
  await lookupVi(text);
  done++;
  if (done % 20 === 0) saveCache();
  process.stdout.write(`\r${done}/${allNoteTexts.length}`);
}
saveCache();
console.log('\n');

// Phase 4: Assemble and write output files
const vocab = {};
for (const ch of CHAPTERS) {
  vocab[ch.num] = rawVocab[ch.num].map(({ section, term }) => ({
    term,
    section,
    vi: cache[`vi:${term}`] ?? '',
    ipa: cache[`ipa:${term.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '').toLowerCase()}`] ?? '',
  }));
}

const notes = {};
for (const ch of CHAPTERS) {
  notes[ch.num] = rawNotes[ch.num].map(({ marker, en }) => ({
    marker,
    en,
    vi: cache[`vi:${en}`] ?? '',
  }));
}

writeFileSync(VOCAB_OUT, JSON.stringify(vocab));
writeFileSync(NOTES_OUT, JSON.stringify(notes));
console.log(`Wrote ${VOCAB_OUT}`);
console.log(`Wrote ${NOTES_OUT}`);
console.log('Remember to commit and push both files.');
