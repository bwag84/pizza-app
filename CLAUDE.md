# CLAUDE.md

## Project
[One line: what this project does]

## Stack
[Framework, language, database, deployment target]

## Commands
- Dev: `pnpm dev`
- Build: `pnpm build`
- Test single: `pnpm vitest run src/lib/__tests__/[file]`
- Test all: `pnpm test`
- Lint: `pnpm lint --fix`
- Type check: `npx tsc --noEmit`

## Architecture
- src/app/ → pages and API routes
- src/components/ → stateless UI components
- src/lib/services/ → business logic and data fetching
- src/lib/hooks/ → custom React hooks
- src/lib/utils/ → shared helpers
- src/lib/types/ → TypeScript types

## Rules
- NEVER commit .env files or secrets
- All database queries through src/lib/services/, never in components
- All async calls must use try/catch
- Prefix commits: feat:, fix:, docs:, refactor:, test:, chore:
- IMPORTANT: run type check after every code change
- No console.log in production code

## Workflow
- Ask before making architectural decisions
- Make minimal changes, don't refactor unrelated code
- Run tests after every change, fix failures before moving on
- Create separate commits per logical change
- When unsure between two approaches, explain both and let me choose

## Out of scope
- migrations/ → managed by ORM CLI, don't create manually
- public/assets/ → static files, don't modify
- .github/workflows/ → CI/CD, don't touch without asking