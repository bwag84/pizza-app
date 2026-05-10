# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project
Takes my pizza recipes from Google Drive and builds an app around them. Deployed to GitHub Pages.

## Current state
Repo is **not yet scaffolded** — only `CLAUDE.md` and `.gitignore` exist. The Stack/Commands/Architecture sections below describe the *intended* setup, not the present reality. Confirm with me before scaffolding.

## Task
Fetch this design file, read its readme, and implement the relevant aspects of the design:
https://api.anthropic.com/v1/design/h/QIODkAGV7iL1aiHGb8NK3A?open_file=Pizza+App.html
Implement: `Pizza-App.html`

## Intended stack
- Static site, released on GitHub Pages
- pnpm-based tooling, TypeScript, Vitest

## Intended commands (once scaffolded)
- Dev: `pnpm dev`
- Build: `pnpm build`
- Test single: `pnpm vitest run src/lib/__tests__/[file]`
- Test all: `pnpm test`
- Lint: `pnpm lint --fix`
- Type check: `npx tsc --noEmit`

## Intended architecture
- `src/app/` → pages and API routes
- `src/components/` → stateless UI components
- `src/lib/services/` → business logic and data fetching (incl. Google Drive)
- `src/lib/hooks/` → custom React hooks
- `src/lib/utils/` → shared helpers
- `src/lib/types/` → TypeScript types

## Rules
- All data fetching through `src/lib/services/`, never in components
- All async calls must use try/catch
- Prefix commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Run type check after every code change
- No `console.log` in production code

## Workflow
- Ask before making architectural decisions
- Make minimal changes; don't refactor unrelated code
- Run tests after every change; fix failures before moving on
- One logical change per commit
- When torn between two approaches, present both and let me choose

## Out of scope
- `migrations/` → managed by ORM CLI, don't create manually
- `public/assets/` → static files, don't modify
- `.github/workflows/` → CI/CD, don't touch without asking
