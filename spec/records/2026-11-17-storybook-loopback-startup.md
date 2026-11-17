# Explicit loopback Storybook startup

## Reproduction and owner

Core's full reaction-fix qualification passes1133 source units,40 release-script
controls, governance, quality, static build/audit and1064 interaction/accessibility
stories. Its workspace pointer lane then reports26 passed/one failed. The
measured virtual Kanban drag times out at the initial story-ready gate, before
any card measurement or drag executes. The saved Playwright context shows the
Storybook preview rejecting vite-app.js on127.0.0.1 and requesting an explicit
host option. This is a catalog-launcher boundary, not a Kanban behavior change.

Exact unchanged reproduction command:
`pnpm test:workspace:pointer tests/workspace/kanban-pointer.spec.ts:30`.
It passes1/1 in a fresh invocation, retaining evidence of the intermittent cold
bootstrap failure rather than relabeling the original aggregate as green.
The failed trace/context/screenshots remain under
`/tmp/core-reaction-workspace-first-failure/`; full and narrow logs remain at
`/tmp/core-reaction-checks-final.log` and`/tmp/core-kanban-pointer-exact-before.log`.

## Repair and qualification scope

The owning supervisor previously supplies no host argument. Supply the exact
loopback host already used by each browser base URL. Forwarded caller options,
port selection, process ownership, readiness, host validation, drag assertions,
45-second readiness bound and visual baselines remain unchanged. No allowedHosts
wildcard, browser retry policy or fixed startup delay is introduced.

DC-TOOL-003 records the launcher contract. This development-tool slice carries
no independent package-version intent; the separate genuine reaction Changeset
still owns its public-package patch. Workspace/dependency preflight remains in
the reaction release record and must be refreshed before pushing/publication.

Rerun the exact Kanban target after the change, then the complete27-case workspace
pointer lane and the remaining aggregate source/browser/package gates. Until
those execute successfully, this record is pending qualification. The initial
non-deterministic pass does not by itself prove bootstrap reliability.

## Actual follow-up evidence

After the host argument is added, the exact Kanban command passes one case and
the complete `pnpm test:workspace:pointer` lane passes all 27 cases from a fresh
process. Supported cold Linux qualification repeats both commands with the same
result. The current source archive, environment and remaining release gates are
recorded in the separate reaction record; no native aggregate exit-zero claim
is made from those individual results.

Supported follow-up also completes Shell 17, AI 3 and Shadcn 196 browser cases,
with the same one existing Shadcn skip. All 1,064 Storybook interactions and
accessibility cases pass. The clean archive consumer subsequently passes after
the separately recorded package-manager binding repair. Current launcher and
all source/browser inputs match the complete supported browser snapshot.
