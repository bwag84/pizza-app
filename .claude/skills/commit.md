---
name: commit
description: Create structured git commits from current changes.
  Use when user says "commit", "save changes", or after finishing a feature.
allowed-tools: Read, Bash(git *)
---

1. Run `git status` and `git diff` to see all changes
2. Group related changes into logical units
3. For each unit, create a commit:

   type(scope): description under 50 chars

   - What changed
   - Why (if not obvious)

4. Stage and commit each unit separately
5. Show summary: "Created N commits: [titles]"

Types: feat, fix, refactor, docs, test, chore