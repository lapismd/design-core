# Released Mira activation cohort intake

The active activation delivery requires one coherent Mira renderer line across
Design Core, Notes, Markdown and Notebook. The existing dependency PR 78 already
updates Core's normal registry range and lockfile to `~0.2.0`; this slice retains
that dependency-only change and its patch Changeset rather than opening another
PR. No component, public export or application activation policy changes.

The PR's hosted unit lane reports 1,129 passes and one failure in
`src/shared/forms/code-editor/editor-shell-boundary.spec.ts`: its registry
boundary still requires the superseded 0.1.x line. The exact isolated before
command is:

```sh
pnpm exec vitest run --project unit src/shared/forms/code-editor/editor-shell-boundary.spec.ts -t 'uses the published Mira package without the aggregate CodeMirror dependency'
```

On the actual published Mira 0.2.0 graph it fails once (three other cases excluded
by the name filter). The repaired boundary retains all portable-registry,
no-sibling and no-aggregate-CodeMirror checks, accepts 0.2.0 and compatible patch
updates, and rejects the old line and 0.3.0. DC-FORM-033 now names that cohort.
The unchanged isolated command now passes once; all 121 affected Code Editor,
YAML, Chat and AI unit cases pass. Complete `pnpm checks` passes 1,130 units,
1,060 cold interaction/accessibility cases, static catalog metadata, all type
and formatting checks, 27 Workspace, 17 Shell, three AI and 196 shared-control
browser cases. The existing single WebKit-related skip remains unchanged.
Public archive and hosted exact-head gates remain pending.

An initial invocation through `pnpm test:unit -- ...` forwarded a literal
separator that ran all 1,130 tests; it reproduces the same single failure but
is supporting full-suite evidence, not the isolated regression. Both logs are
retained separately. Actual isolated source is `75afe09c`, above bot `55201a16`.

Validation uses fresh task-owned containers on omarchy with exact Jujutsu
object-pack/source verification, a pinned Node 24 toolchain image, frozen npm
registry install and no dependency overrides or sibling archives. Original
timeouts, assertions and browser fixtures remain. Receipts are under
`lapis-server-terminal-pr/.local/core-mira-activation/`; no harness, local
configuration, screenshot baseline or generated output is committed here.

The first full attempt passed unit, type, specification and static catalog
lanes but collected no Storybook cases because the temporary runner's browser
install path differed from Turbo's inherited default. Only the ignored runner
environment was corrected; the identical source `c3a7d3be` then passed the
complete aggregate in `lapis-core-activation-573f4453-0fd8-4442-851f-fb5e1e1cbe44`.
The failed launch is retained separately and is not interaction evidence.

During qualification a concurrent commit `06f5c435` pushed the exact same range
test correction to PR 78. This change preserves that commit, its canonical
requirements and verification rows. Our remaining changes are documentation
and qualification evidence; package, lockfile and test bytes match the fully
qualified candidate.

The release inventory records 32 workspaces: 19 available and 13 legacy
registrations without a recorded root. Other available roots are unchanged;
the stale Bases checkout was compared read-only against all 4,389 tracked
files at its recorded operation, with zero differences and no workspace update.
Mobile commits are patch-equivalent to merged `969a5070`. Older independent
Transcript, tooling, artwork and qualification candidates remain preserved
outside this registry dependency intake. Equivalence is claimed only where
exact file or normalized patch evidence exists. No Dependabot PR was open at
preflight; no empty consolidation PR or unrelated feature merge is introduced.
