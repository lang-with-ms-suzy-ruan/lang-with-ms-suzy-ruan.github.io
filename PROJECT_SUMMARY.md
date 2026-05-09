# Project Summary — English with Ms. Suzy Ruan

Read this file at the start of a new session to get full context.
For coding conventions, see `CLAUDE.md`.

---

## What This Is

A classroom English (and some Japanese) learning web app for Ms. Suzy Ruan's students.
Deployed as a static site on **GitHub Pages**. No backend — all data is in `public/`.

- **Live URL:** https://lang-with-ms-suzy-ruan.github.io/
- **Repo:** https://github.com/lang-with-ms-suzy-ruan/lang-with-ms-suzy-ruan.github.io
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui

---

## Architecture

**Entry:** `src/main.tsx` → `src/App.tsx` → `src/components/LandingPage.tsx`

Routing is **state-based** — no router library. `LandingPage` owns all top-level state and renders sub-apps by switching a `view` string. Each sub-app receives `onBack: () => void`.

**App store config:** `src/data/apps.json` — defines all app cards (id, name, desc, icon, bg color, access level). Edit this file to change what appears on the app store without touching component code. Access levels: `"all"` (guests too), `"student"`, `"admin"`.

**Auth levels:**
| Level | How |
|---|---|
| Admin | `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars compiled at build time via `vite.config.ts` |
| Student | SHA-256 password hashes in `src/data/students.json` |
| Guest | No login; sees a limited app list |

**Path alias:** `@` → project root (not `src/`). shadcn components live at `components/ui/` and `lib/utils.ts`, both at the root.

---

## Sub-Apps

| Component | File | Purpose |
|---|---|---|
| VocabularyApp | `src/components/VocabularyApp.tsx` | Flashcard vocab from CSV files under `public/media/`. Has trial mode for guests. |
| MoversLetsTalkApp | `src/components/MoversLetsTalkApp.tsx` | PDF slides (1–8) for speaking practice with arrow-key navigation + fullscreen. |
| MoversQuizApp | `src/components/MoversQuizApp.tsx` | Multiple-choice quiz over vocabulary CSVs. Modes: picture / word→VI / VI→word. |
| KanjiApp | `src/components/KanjiApp.tsx` | Browse kanji with vocabulary + phrases. Data from `KanjiData.json`. Displays `pinyin` and `hanViet` below the character if present. Shows only Vietnamese meanings. |
| EverydayActivitiesApp | `src/components/EverydayActivitiesApp.tsx` | 61-chapter picture-process book with PDF viewer, audio player, vocabulary sidebar, and lesson notes. See details below. |
| StudentManagerApp | `src/components/StudentManagerApp.tsx` | Admin only. Add/remove students. Changes must be downloaded and committed. |

---

## Everyday Activities App (most complex)

**Book:** *English for Everyday Activities* — 61 chapters, 6 sections, pages 4–77 in the PDF.

**PDF page formula:** PDF page = book page − 2 (e.g., book p.6 → PDF p.4).

**Media files** (`public/media/everyday/`):
| File/Dir | Description |
|---|---|
| `english-for-everyday-activities-pdf-free.pdf` | 78-page scanned PDF (no text layer) |
| `english_for_everyday_activities_a_picture_process_dictionary_cd/` | 61 MP3 files: `English for Everyday Activities 01.mp3` … `61.mp3` |
| `vocab.json` | Per-chapter key vocabulary (1700 terms total) with `term`, `section`, `vi`, `ipa` |
| `notes.json` | Per-chapter "For Special Attention" bullets (150 total) with `marker`, `en`, `vi` |
| `lesson-notes-{N}.md` | Optional per-chapter teacher notes in Markdown (e.g., `lesson-notes-1.md`) |

**Audio:** Oxford Learner's Dictionary male US pronunciation (`us_pron` MP3s) with Web Speech API TTS fallback for multi-word phrases or missing entries. Same pattern used in VocabularyApp and MoversQuizApp.

**UI layout:** Two collapsible drawers (both open by default), toggled from the header on any screen size.
- **Lessons drawer** (left, w-52) — chapter list grouped by section
- **Vocabulary drawer** (right, w-52) — font size slider (9–18px, affects vocab + Special Attention), key vocabulary, special attention notes, lesson notes button
- **PDF area** (centre) — A-/A+ zoom controls (75–200%) in the bottom bar alongside audio player and prev/next nav

**Vocabulary drawer features:**
1. **Key Vocabulary** — clicking a term plays Oxford audio and opens a detail card (IPA + Vietnamese); small speaker icon is a visual cue only
2. **Special Attention** — OCR'd notes with English + Vietnamese; supports `**bold**` markdown in the source text
3. **Lesson Notes** — yellow button appears when `lesson-notes-{N}.md` exists; opens a modal with rendered Markdown (tables, headings supported via `react-markdown` + `remark-gfm`)

**Generation script** (`scripts/generate-everyday-vocab.mjs`):
- Phase 1: OCR each chapter's first page with `pdftoppm` + Tesseract to extract vocabulary and "For Special Attention" text
- Phase 2: Translate vocab terms via MyMemory API + IPA from Free Dictionary API
- Phase 3: Translate note bullets via MyMemory API
- Caches all results in `scripts/.everyday-cache.json`
- **Quota:** MyMemory free tier ~5000 chars/day. Script exits gracefully on 429 and still writes output files. Re-run the next day to fill remaining translations.
- Run: `node scripts/generate-everyday-vocab.mjs`
- After running: `git add public/media/everyday/vocab.json public/media/everyday/notes.json && git commit && git push`

**To add a lesson note for a chapter:**
1. Create `public/media/everyday/lesson-notes-{N}.md`
2. Write standard Markdown (headings, bold, tables all render)
3. Commit and push — the "Lesson Notes" button appears automatically

---

## Kanji Data

**File:** `public/media/kanji/KanjiData.json`
- 1130 kanji, ~2929 vocab+phrase entries
- Each kanji entry: `{ char, pinyin, hanViet, related[], phrases[], vocabulary[] }` — field order is fixed
- `pinyin` populated for all 1130 entries via `scripts/add-pinyin.mjs`; `hanViet` present on all entries (empty string until filled manually)
- Each vocab/phrase item: `{ word, reading, meaning, meaningVi? }`
- Edit `pinyin` and `hanViet` directly in the JSON file
- Vietnamese coverage: ~2070/2929 (70%) — remaining items are untranslatable Japanese-specific terms

**Script:** `scripts/add-vietnamese.mjs`
- Adds `meaningVi` fields via MyMemory API (1.2 sec/request, safe to re-run)
- Caches in `scripts/.vi-cache.json`
- Run: `node scripts/add-vietnamese.mjs`

**Script:** `scripts/enrich-kanji.mjs` — enriches other kanji metadata (separate from Vietnamese)

---

## Design System (Neobrutalist)

| Token | Value | Usage |
|---|---|---|
| `brand-primary` | `#FFD93D` yellow | Active states, highlights, buttons |
| `brand-secondary` | `#4ECDC4` teal | Accents (light mode); `#FFF9E6` in dark mode |
| `ink` | `#2D3436` dark | Text, borders |
| Border style | `border-4 border-ink` | Cards, buttons |
| Shadow style | `shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]` | Neobrutalist offset shadow |
| Radius | `rounded-2xl` / `rounded-[40px]` | Varies by element |

Animations via `motion/react` (`AnimatePresence`, `motion.div`).

---

## Commands

```bash
npm run dev          # dev server at http://localhost:3000
npm run build        # production build → dist/
npm run lint         # TypeScript type-check only (tsc --noEmit)
npm run preview      # preview production build

node scripts/generate-everyday-vocab.mjs   # OCR + translate Everyday Activities vocab/notes
node scripts/add-vietnamese.mjs            # add Vietnamese to KanjiData.json
node manage-students.js list               # list students
node manage-students.js add <ID> <pass>    # add student
node manage-students.js delete <ID>        # remove student
```

---

## Environment

Copy `.env.example` → `.env.local`:
```
ADMIN_USERNAME="..."
ADMIN_PASSWORD="..."
```
These are baked into the build. In CI they come from GitHub repository secrets.

---

## Deployment

GitHub Actions (`.github/workflows/`) builds and deploys to GitHub Pages on every push to `main`.
Secrets `ADMIN_USERNAME` and `ADMIN_PASSWORD` must be set in the repo's Settings → Secrets.

---

## Known Issues / Things Left To Do

- **KanjiData Vietnamese:** ~859 items still untranslatable (Japanese-specific terms, single chars, proper nouns). MyMemory consistently rejects them — accepted ceiling.
- **LandingPage.tsx type error:** Pre-existing `TS2322` on line 1831 (`gallery.accent` mismatch in translations). Not blocking — build still works.
- **Everyday Activities OCR quality:** Some vocabulary terms have minor OCR errors (e.g., misread letters in lower-confidence regions). The `vocab.json` and `notes.json` files can be manually corrected — see file structure above.
- **MyMemory daily quota:** ~5000 chars/day free tier. The generation script handles this gracefully. Re-run on subsequent days to fill remaining translations.
