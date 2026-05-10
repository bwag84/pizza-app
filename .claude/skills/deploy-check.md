---
name: deploy-check
description: Run pre-deployment checks. Use when user mentions
  "deploy", "ship", "release", or "production".
allowed-tools: Read, Bash(npm *), Bash(npx tsc *), Bash(git *), Grep
---

Run in order, stop at first failure:

1. `npx tsc --noEmit` — types pass
2. `npm test` — tests pass
3. `npm run lint` — no lint errors
4. `npm run build` — build succeeds
5. grep for console.log in src/
6. Check for .env references in committed code
7. git status — no uncommitted changes

Output: ✅ or ❌ per check
Summary: "Ready to deploy" or "N issues to fix first"