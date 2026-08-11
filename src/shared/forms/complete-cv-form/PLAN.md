# Complete CV Form story

## Boundary

- Story: `UI Forms/Examples/Complete CV Form`.
- Composition: `AppShell.Root -> Main -> Body`, with Body as the sole page scroll owner.
- Source snapshot: `/Users/stevejuma/code/cv/data/cvs/sample-cv.yml`, copied on 2026-08-11 into `sample-cv.fixture.yml` (9578 source bytes before the final newline).
- Ownership: all implementation is story-local. There are no Design Core exports, dependencies, or CV repository changes.
- Out of scope: persistence, routing, preview/rendering, evidence, and AI review.

## Checklist

- [x] Snapshot the complete John Doe fixture.
- [x] Add typed source, entry, path, UI identity, default factory, and movement helpers.
- [x] Add wrapped/unwrapped fragment YAML parsing, minimum structural validation, and invalid-text preservation.
- [ ] Build the body-only App Shell, tabs, toolbar, and responsive layout.
- [ ] Render CV profile, networks, roles, all nine section types, and nested repeatables.
- [ ] Render all Design, Locale, and Settings groups with CV Studio defaults.
- [ ] Wire live per-tab YAML round-trip and deterministic reset.
- [ ] Link a bounded consumer example from Forms Guidance.
- [ ] Add the primary interaction story and deterministic reset-at-end coverage.
- [ ] Run focused tests, repository checks, Storybook build, live wide/narrow/a11y acceptance, and compare-only visual checks.
- [ ] Commit the model/YAML and rendered-story slices separately with Jujutsu.

## Validation evidence

Pending implementation.

## Visual baseline

The story will be tagged `visual-ready`. Compare-only results and any missing baseline will be recorded here. No reference image may be created or updated without separate human approval.
