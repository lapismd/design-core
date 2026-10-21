# Fixed transcript footer containment

2026-10-18; enclosing Jujutsu change tyklkyrm; DC-CHAT-006/009.

The user authorized finishing UI and then continuing all planned slices. The
previous footer correction fixed its 48px height but reader overflow could
still programmatically scroll the workspace when focus changed. Source browser
regression measured 3877px overflow in a 640px reading region before repair.
The bounded transcript grid and its scroll region now clip overflowing reader
content; the existing ScrollArea viewport remains the scroll owner. The test
also verifies the scrollable viewport still changes scroll position and expansion preserves footer
geometry without outer overflow. No consumer selectors hide this source defect.

Before: `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte -t InlineFooterFormatting` fails once
(`/tmp/transcript-containment-before.log`). After the containment fix the exact
case passes (`/tmp/transcript-containment-after.log`). A first wider run passed 26/27 but the test harness's synthetic PageDown did
not invoke a browser default scroll. The final regression directly checks the
scrollport's computed scrollability and scrolling, then fixed-footer containment;
it does not waive overflow or geometry assertions.

Validation:

- `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte`: 27/27 interaction and axe cases pass; `/tmp/transcript-containment-stories-final.log`.
- `pnpm check:types`: source plus three public-consumer profiles pass, zero errors/warnings; `/tmp/transcript-containment-types.log`.
- `pnpm spec:first`, `pnpm spec:validate`, `pnpm check:no-tailwind` and changed-file formatting run before commit, followed by `pnpm package:local` for the Notes archive refresh.
- Notes E-AI-041 owns installed-package acceptance and normal plugin adoption. Original runtime, storage and publication authority remain unchanged.

No browser baseline changes or release/publication. Broad qualification remains
deferred. Human review is distinct from test evidence; local browser control was
disabled during this follow-up, so no new CUA inspection is claimed.
