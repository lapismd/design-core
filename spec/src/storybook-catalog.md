# Storybook catalog

Storybook is the interactive catalog and acceptance surface. It documents components but does not supersede canonical specification Markdown. The specification sidebar includes the Diff chapter after AI.

## Public surface coverage

| Surface               | Public boundary         | Requirement |
| --------------------- | ----------------------- | ----------- |
| Catalog metadata      | Storybook               | DC-CAT-001  |
| Autodocs inventory    | Storybook               | DC-CAT-002  |
| Guidance and Welcome  | Documentation surface   | DC-CAT-003  |
| Catalog validation    | Storybook               | DC-CAT-004  |
| Specification mirrors | Storybook documentation | DC-CAT-005  |
| Consumer source       | Storybook documentation | DC-CAT-006  |
| Explicit source       | Storybook documentation | DC-CAT-007  |
| Highlighted source    | Storybook documentation | DC-CAT-008  |

## DC-CAT-001 — Catalog metadata

**Requirement.** The Catalog metadata family MUST derive component documentation from colocated stories and public component metadata.

### Acceptance details

- Story titles and hierarchy must remain stable discovery identifiers unless a migration is documented.
- Storybook documentation must link or derive from the owning source instead of copying normative contracts.

## DC-CAT-002 — Autodocs inventory

**Requirement.** The Autodocs inventory family MUST publish every current public or catalogued family exactly once under its owning layer.

### Acceptance details

- The recorded baseline is 143 Autodocs families in the current static catalog.
- Storybook documentation must link or derive from the owning source instead of copying normative contracts.

## DC-CAT-003 — Guidance and Welcome

**Requirement.** The Guidance and Welcome family MUST classify overview, guidance, and welcome pages as documentation rather than runtime component exports.

### Acceptance details

- Story titles and hierarchy must remain stable discovery identifiers unless a migration is documented.
- Storybook documentation must link or derive from the owning source instead of copying normative contracts.

## DC-CAT-004 — Catalog validation

**Requirement.** The Catalog validation family MUST typecheck interactions, build the static catalog, and enforce confirmed accessibility violations as errors.

### Acceptance details

- Story titles and hierarchy must remain stable discovery identifiers unless a migration is documented.
- Storybook documentation must link or derive from the owning source instead of copying normative contracts.

## DC-CAT-005 — Specification mirrors

**Requirement.** The Specification mirrors family MUST render every non-summary canonical specification chapter through a metadata-only raw Markdown import.

### Acceptance details

- Story titles and hierarchy must remain stable discovery identifiers unless a migration is documented.
- Normative prose must remain in `spec/src`; mirrors may contain only Storybook metadata and a raw import.
- Specification must sort first and its nested titles must follow `SUMMARY.md` order.

## DC-CAT-006 — Consumer source

**Requirement.** Every Storybook Docs Show Code panel MUST present copy-pasteable usage of the real documented component boundary.

### Acceptance details

- Public components must use public package imports and include the state or composition needed to reproduce the scenario.
- Show Code must not present a story-only demo, harness, fixture, story surface, or inferred story args as consumer API.

## DC-CAT-007 — Explicit source

**Requirement.** An Autodocs story whose render path differs from consumer usage MUST define an explicit `parameters.docs.source` object.

### Acceptance details

- The source object must define `code`, `language`, and `type: "code"`.
- Nontrivial source should live in a colocated `*.example-sources.ts` module and derive from the scenario's public boundary.

## DC-CAT-008 — Highlighted source

**Requirement.** Every authored Storybook code example MUST select a language grammar that produces syntax-highlight tokens in the current catalog.

### Acceptance details

- Svelte component markup must use Storybook's bundled `tsx` grammar while the catalog has no working Svelte or HTML alias.
- Specification validation must reject the known plain-text `html`, `svelte`, and `markup` language values in authored MDX and Docs source metadata.
