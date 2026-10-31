# Version PR keyboard focus readiness

Version Packages PR 39 at 88fecb1554fa7fa850deb30b3041a578491ce52e fails
one Storybook case while 973 pass: FileListing / Virtualizes a large host-owned
list expects file-0001 to have focus but file-0000 still has it.

The owning keyboard path deliberately scrolls the virtualizer, awaits Svelte
tick, then focuses the mounted target in requestAnimationFrame. userEvent's
keyboard promise does not guarantee that animation-frame handoff has completed.
The original exact case passes once locally, consistent with the hosted race.

Acceptance now waits for the same real target's toHaveFocus assertion before
continuing to the continuation and bounded-row assertions. It adds no sleep,
retry of a mutation, weaker assertion, timeout change or production workaround.
After the change, the exact case passes once, the complete FileListing family
passes all 13 cases, and the complete Storybook interaction/accessibility lane
passes all 976 cases. The preceding full `pnpm checks` also passes: 917 unit,
976 Storybook, static/type/spec/metadata checks, Workspace 16, Shell 17, AI 3,
and Shadcn 153 with one existing skip. Hosted source and refreshed version-PR
checks remain required. Existing visual-pending tags and baselines are unchanged.
