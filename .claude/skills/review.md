---
name: review
description: Review code for bugs, security issues, and style violations.
  Use when reviewing PRs, checking code quality, or when user mentions
  "review", "PR", "code quality".
allowed-tools: Read, Grep, Glob, Bash(git diff *)
---

Review the current diff or specified files for:

1. Bugs: logic errors, null handling, race conditions
2. Security: hardcoded secrets, SQL injection, XSS
3. Performance: N+1 queries, unnecessary re-renders
4. Style: naming, dead code, TODOs

Output as checklist grouped by severity: CRITICAL / WARNING / INFO
End with summary: "X critical, Y warnings, Z info"