# Tool output unavailable presentation

DC-AI-025 now requires the public shadcn Empty pattern for normalized unavailable
tool output, with an icon, title and the original refusal reason. The exact raw
capture and view toggle remain available. This source change supports the
user-requested Agent UI Empty/Unavailable review convention.

The exact regression was `pnpm exec vitest run --project storybook
src/shared/ai/tool-call-detail/ToolCallDetail.stories.svelte`. Before the source
change: 9 passed, 1 failed because Empty was absent. After adding Empty, the first
rerun found an incorrect test selector (`empty-media` is a data-ui-part, while
its data-slot is `empty-icon`); the next found the test used “captured” rather
than the fixture's actual recorded reason. Both assertions were corrected to
the actual public markup and exact refusal text. Final exact rerun: 10 passed,
0 failed.

Required shared-source lanes passed:

- `pnpm check`: strict source and public consumer type checks, 0 errors/warnings.
- `pnpm test:unit`: 859 passed, 0 failed.
- `pnpm test:storybook`: 909 passed, 0 failed, with accessibility enabled.
- `pnpm build-storybook`: static catalog build passed.
- `pnpm spec:check`: validate, mdbook and spec-first passed.

Agent UI consumes a fresh ignored local review archive through the documented
validation overlay. Publication, downstream application/service integration and
visual-baseline updates remain outside this slice. Visual review stays pending.
