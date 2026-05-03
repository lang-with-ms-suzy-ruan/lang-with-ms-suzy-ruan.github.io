# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Project-Specific Guidelines

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build → dist/
npm run lint       # TypeScript type-check only (tsc --noEmit)
npm run preview    # preview the production build locally
```

No test framework is configured — `lint` is the only static check.

## Environment

Copy `.env.example` to `.env.local` and fill in credentials:

```
ADMIN_USERNAME="..."
ADMIN_PASSWORD="..."
```

These are injected at build time via `vite.config.ts` and exposed on `process.env.ADMIN_USERNAME` / `process.env.ADMIN_PASSWORD`. They gate the admin panel (StudentManagerApp) inside the app.

## Architecture

**Entry point:** `src/main.tsx` → `src/App.tsx` → `src/components/LandingPage.tsx`

`LandingPage.tsx` is the main shell and owns all top-level state:

- `LanguageContext` — provides `lang` (EN/VI), `t` (typed translation strings from `src/translations.ts`), `view` ("home" | "appstore"), and their setters to the entire tree via context.
- Routing is purely state-based (no router library). Switching between the landing page and sub-apps is done by setting state in `LandingPage`.

**Sub-apps** rendered from `LandingPage`:

| Component | Purpose |
|---|---|
| `VocabularyApp` | Flashcard vocabulary practice. Loads word data from CSV at `/public/media/{appId}/` (or `{appId}_trial/` for non-authenticated users). Supports interactive reveal mode. |
| `MoversLetsTalkApp` | PDF-based speaking slides from `/public/media/movers_talk/1.pdf`–`8.pdf`. Arrow-key navigation and fullscreen mode. |
| `MoversQuizApp` | Multiple-choice quiz over the same vocabulary CSVs. Supports picture / word→VI / VI→word modes and word-range presets. |
| `StudentManagerApp` | Admin-only. Add/delete students; passwords stored as SHA-256 hashes in `src/data/students.json`. Changes must be downloaded and committed. |

**Path alias:** `@` resolves to the project root (not `src/`). shadcn/ui components live at `components/ui/` and `lib/utils.ts`, both at the project root — not inside `src/`.

**Static media:** vocabulary images and PDFs live under `public/media/`. CSV vocabulary files are fetched at runtime by `VocabularyApp` and `MoversQuizApp` using `PapaParse`.

## Student Management

Use the CLI helper to modify `src/data/students.json` outside the browser:

```bash
node manage-students.js list
node manage-students.js add <StudentID> <password>
node manage-students.js delete <StudentID>
```

After changes, commit `src/data/students.json` and push to redeploy.

## Deployment

GitHub Actions (`.github/workflows/`) builds and deploys to GitHub Pages on every push to `main`. `ADMIN_USERNAME` and `ADMIN_PASSWORD` are passed as repository secrets during CI build.
