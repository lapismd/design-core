# Collapsed transcript tool groups

2026-10-19; enclosing Jujutsu change onplkvxy; DC-CHAT-006.

Notes' native discussion acceptance exposed an expanded but empty live tool
group. Two new source stories exercise initially collapsed groups in Document
and Classic using an external TranscriptController, independent inner tool
opening, and a single tool becoming a group with replaced item objects.

This slice adds coverage and makes the existing disclosure expectation explicit.
It changes no production component, public API, persistence or authority. Source
regression tests pass on unchanged production code. The actual consumer defect
is duplicate namespaced tool identities during provider/application callback
pairing; Notes owns that fix and native qualification in E-AI-053.

Before/after observations:

- The original fixture compilation failed on a captured reactive `dynamic`
  prop (`state_referenced_locally`). `untrack` makes the deliberate initial
  snapshot explicit; `.local/transcript-collapsed-tools-dynamic-before.log`.
- `pnpm test:storybook src/shared/chat/transcript/Transcript.tools.stories.svelte`
  passes both stories with unchanged production code, including replaced item
  objects; `.local/transcript-collapsed-tools-replaced-before.log`.
- An ignored production Vite diagnostic passes Chromium and WebKit with source
  components. The same public-archive probe passes in Notes with its installed
  package/compiler. These are diagnostic checks, not native acceptance.
- A tentative force-mounted content experiment also passed the source examples
  but established no source defect; its production edit was removed. Its packed
  archive was never installed. The ordinary source archive was regenerated after
  removing the experiment; no package publication or dependency change.

Final checks and native consumer results follow below. Broader package/release,
provider/platform, visual baseline and unrelated catalog lanes remain deferred
under the user's visible functional-delivery scope. No original milestone gate
is completed by these source-only examples.

- `pnpm test:storybook src/shared/chat/transcript` passes 29 interaction/axe
  checks in two files on unchanged production code, from a fresh process;
  `.local/transcript-tools-family.log`.
- Initial `pnpm check:types` found two missing required `raw` fixture fields;
  `.local/transcript-tools-types.log`. Add representative raw captures rather
  than weakening the public TranscriptTool contract.
- `pnpm check:no-tailwind` passes; `.local/transcript-tools-css.log`.
- Regenerating the unmodified production archive restores exactly the original
  SHA256 `37478adcc1b7f7db4c741c9e05dec5df5aae85242cc77c10568b0631bbd6242a`;
  `.local/transcript-group-unmodified-pack.log`. No consumer reinstall is needed.
- Final `pnpm check:types` passes source, shell, filter and source-consumer
  profiles with zero errors/warnings; `.local/transcript-tools-types-final.log`.
- `pnpm spec:first` passes two protected files/two canonical chapters;
  `pnpm spec:validate` passes eight validators/31 chapters/299 requirements;
  `pnpm spec:check` passes validate, book and source-first lanes. Logs:
  `.local/transcript-tools-{first,spec,spec-check}.log`.
- Notes' actual Codex acceptance now passes in 84.14s after its local pairing
  repair, with exact code/table/tool anchors, continuation and two cold History
  reopens. That evidence remains owned by Notes E-AI-053.
