# Author avatar fallback labels

The Notes transcript consumer exposed label-content-name-mismatch when an
avatar-only AuthorCard showed YO/AI but its trigger name only contained the
author's full name. AuthorCard now retains the full/custom label and includes
its visible initials/emoji fallback. The mention and profile content contracts
are unchanged; this is an accessibility correction to DC-SHA-058.

Focused AuthorCard source stories and public-package Notes transcript acceptance
are recorded below. Whole-catalog/provider/release qualification is deferred by
the user's visible AI delivery instruction; visual baselines remain untouched.

- Before: Notes' new transcript family reports label-content-name-mismatch for
  `About You`/YO and `About Assistant`/AI (three scenarios); no axe rule is waived.
- `pnpm exec vitest run --project storybook src/shared/shadcn/author-card/AuthorCard.stories.svelte`:
  two source interaction/accessibility cases pass, including the exact fallback
  trigger label, profile actions and hover details.
- `pnpm spec:validate`: eight validators, 31 chapters and 299 requirements pass.
- `pnpm spec:first`: two protected files/two canonical chapters pass.
- Changed files pass Prettier. The built public archive is produced through
  `pnpm package:local`; its consumer hash and exact acceptance are recorded in
  Notes E-AI-039. No package is published or installed globally.

Milestone review: DC-SHA-058 remains Implemented; no visual approval, provider,
release or whole-catalog milestone is promoted. Custom labels retain their text
and receive a visible-fallback suffix when absent from that text. Stored author
identities, host routing, profile details and avatar image selection are unchanged.

Consumer follow-up: Notes uses axe 4.14, which removes parenthetical text while
checking label/name matches. The source catalog uses axe 4.12.1; its passing
source family did not expose that normalization. The refreshed Notes family
therefore still failed seven accessibility cases although its interactions,
tables, code blocks and avatar centering passed. The fallback now follows a
comma instead of parentheses, retaining the visible initials under both engines.
Exact source labels and Notes acceptance are rerun without rule changes.
