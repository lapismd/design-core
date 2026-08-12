---
id: vcs
title: Committing verified changes
summary: Commit after each verified change; prefer Jujutsu (jj) when available.
sources:
  - AGENTS.md
  - docs/agent/testing.md
---

# Committing verified changes

After a self-contained change is validated (see `pnpm ui guide testing`), **commit
it before starting the next unrelated unit of work**. Do not leave finished work
only in a dirty working copy across task boundaries.

## Prefer Jujutsu when available

If `jj` is on `PATH` and the repo is colocated / jj-backed (`.jj` present):

1. Prefer **`jj`** for status, diffs, and commits — not Git write commands
   (`git add`, `git commit`, `git checkout`, `git reset`, …).
2. Inspect, then commit the verified change:

```bash
jj --no-pager st
jj --no-pager diff --summary
# protected changes: pnpm spec:first
# validation already done (stories / checks / focused tests as appropriate)
jj commit -m "Concise why-focused message"
jj --no-pager st
```

3. Always pass `-m` / `--message` so commits never open an editor.
4. Use `jj commit -m "…" -- path/a path/b` to commit only selected paths.
5. For remotes/bookmarks use `jj git …` (fetch/push/bookmark), not raw
   `git push` / `git pull`, unless the user explicitly overrides.

If `jj` is missing or the tree is Git-only, fall back to the usual Git commit
workflow (stage relevant files, `git commit -m "…"`, verify with `git status`).

## Cadence

- **After every verified change** — one logical fix/feature slice → validate →
  commit. Prefer small commits over a large end-of-session dump.
- **Do not** invent commits for speculative WIP, failing checks, or secrets.
- **Do not** push, force-push, or rewrite published history unless the user asks.
- Visual baseline updates stay gated (`VISUAL_UPDATE_APPROVED=1` / explicit
  human approval) even when committing other verified work.

## Relation to testing

`pnpm ui guide testing` covers _what_ to validate. This topic covers _when_ to
record that work in version control. For UI package changes, run the appropriate
checks (focused tests while iterating; `pnpm checks` or `pnpm storybook:check`
before a handoff commit when the slice touches catalog surfaces).
