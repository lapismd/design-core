# Validator 0.2.1 main-range handoff

DC-ARCH-008, DC-PKG-008 and DC-GOV-004 retain their implemented contracts.
The coordinator's genuine development-only PR #87 updates the normal root
`@lapismd/spec-validator` range and lock from 0.2.0 to 0.2.1 after the approved exact-state
Core recovery and retirement of the withdrawn coordinator advisory. It adds no
runtime package release intent, component behavior or registry publication.

## Exact original regression

Against admitted source 8c9d4974becd27506c506575e52829905c8656a9 and original bot
head ec5f72624058a2cb177cd9ebfb44e476870061c9, the actual command
`pnpm spec:first --base 8c9d4974becd27506c506575e52829905c8656a9 --head @`
reports exactly two SPEC-FIRST-MISSING findings: Architecture and Packages.
Bot PR-only exemptions can pass Governance but do not qualify this main range.
The repair changes only those owning factual floor/unchanged-contract paragraphs
and this validation record, preserving the genuine bot manifest/lock patch.

## Boundary and validation

The Node-only validator patch corrects doctor verification-matrix discovery;
normal validation, configured canonical authority, source/runtime contracts and
strict diagnostics remain unchanged. Full frozen installation succeeds with
the reviewed 0.2.1 lock. Semantic QMD discovery succeeds. Doctor reports 10 passes
and the existing custom-wrapper-alias warning; it does not claim warning-free
qualification. No component or baseline change participates.

The exact repaired main-range gate and all three `pnpm spec:check` lanes pass.
The required native `pnpm checks` run passes 1,133 unit tests, 40 release-control
tests, 1,062 Storybook interaction/accessibility cases, Workspace 27, Shell 17
and AI 3 browser cases, quality checks, static build and visual metadata audit.
Its Shadcn lane reports 189 passed, seven failed and one existing skip: all seven
fail before launching WebKit because the local browser executable is absent.
Installing matching WebKit exposes unsupported host libraries; no source,
assertions, skips, baselines or host library substitutions are changed.

Qualification therefore repeats the exact seven WebKit cases, then the full
failed Shadcn lane, cold in the official Playwright 1.64.1 Linux image
`mcr.microsoft.com/playwright@sha256:2f05f8a734509a7b3f26a912639488ee08f58a7b292d14d62271bcff9038768f`.
With verified Node 24.15.0, pnpm 10.32.1 and a frozen install, the exact command
`CI=true pnpm test:shadcn:pointer --project=webkit --retries=0` passes 7/7;
`CI=true pnpm test:shadcn:pointer --retries=0` then passes 196 cases with the same
one existing skip. Both runs start fresh Storybook processes. The container exits
zero and is removed after retaining its logs and result. It receives only public
tracked source, no host dependency tree, credentials or Docker socket. Its tested
source snapshot is `e99652813d21abce0c6119a4dce19b1c2e2c6831`, archive SHA-256
`6c60feeec7eb644a28b4934980e0255e298c2460e331580e3486f4cbd8701da7`;
only this evidence record and Markdown spacing change afterward. This is
replacement browser evidence for the unsupported local host, not a claim that
the original native aggregate command exited zero. Current-head hosted checks
and merged-main acceptance remain separate gates. The shared
canonical intake engine's existing exact-override profile is not silently
expanded to this semver-only validator family; this source review does not claim
automated preparation for an unsupported policy profile.

Before push, the repository's open Dependabot query returns no entries, so no
empty consolidation PR is created. This is a dependency-only repair, not a
package release; unrelated workspaces and product changes remain untouched.

## Main handoff

PR #87 was automatically squash-merged as
`7db7fe09edcdcb7ab23fd3b937559dbe91ff04a3` before this local documentation repair
was pushed. Its hosted main CI and release workflow both pass. This follow-up
retains the source-owned main-range canonical coverage established above, on top
of that accepted registry dependency update. It does not rewrite or reopen the
merged bot branch and introduces no additional dependency or release intent.
