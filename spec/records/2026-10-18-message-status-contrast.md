# Dark message error-status contrast

Scope: DC-AI-007 and DC-CSS-004. Notes' renewed package clears all 25 affected
disclosure cases in each light-mode viewport. Desktop-dark then exposes the
same Message Metadata error text in Skills And Slash, Malformed Record and
Failed Message And Retry: 22 pass, three fail; narrow-dark does not run.

The existing destructive color is also used as a small text foreground. The
owning component stylesheet now mixes that existing semantic color with the
existing foreground in dark scopes. This retains the visible error wording,
icon and inherited host palette, with no new public props or tokens. Light
metadata and destructive action backgrounds retain their original styling.

## Before and after

`node scripts/with-storybook-env.mjs pnpm exec vitest run --project storybook
src/shared/ai/message-metadata/MessageMetadata.contrast.stories.svelte` before
the repair: two failures. Axe measures 3.45:1 on the Lapis conversation surface
and 3.13:1 on its muted surface; both require 4.5:1 for the 11px label. The
regressions mount the actual Message Metadata component in both public theme
surfaces and assert its visible, named error status.

The same exact source command after the repair passes both cases. The complete
affected AI/Chat lane passes 188 cases in 39 files. `pnpm spec:first` passes
16 protected files and six canonical chapters. `pnpm package:local` passes its
253-file CSS audit with three compiled inputs and zero utility references; the
prepared archive has SHA256
`3f7fefb5ca546ea3ce4abfcb87ef1099c2b181fb4b506ad29cd286884b726525`.
Notes installs it through all 14 verified public import routes without tracked
dependency-file changes. Its exact cold desktop-dark regression for Skills And
Slash, Malformed Record and Failed Message And Retry now passes all three cases,
with ten unrelated cases skipped.

The eight affected consumer families and complete source/consumer qualification
remain open. The shared stylesheet and multiple independent component families
require the full `pnpm checks` source lane after exact/affected regressions. The
earlier aggregate is explicitly interrupted after the consumer identifies this
necessary source fix; completed lanes remain in
`history-dc-compatible-checks.log`, not a complete passing-run claim.
The original disclosure names, contrast assertions and axe rules remain enabled.
All new review cases stay visual-pending; no baselines or installed apps change.

## Final source and affected-consumer qualification

The final `pnpm checks` exits zero with source files held fixed: 821 unit
tests, 834 Storybook cases in 242 files, all strict type profiles, specification,
formatting and static catalog checks pass. Browser acceptance passes 16 workspace,
11 shell, three AI and 142 shadcn cases (172 total), with one existing
platform-specific skip. This supersedes the interrupted attempt above without
rewriting its outcome. The original panel-toggle case passes its cold retry.

The eight affected Notes families pass all 25 cases in every desktop/narrow and
light/dark combination (100 checks) through the final public archive, SHA256
`3f7fefb5ca546ea3ce4abfcb87ef1099c2b181fb4b506ad29cd286884b726525`,
packed from snapshot `2c6f0b9efe75fdaa7d9a07034fd944b6e2dfb4b5`.
Current-app intake retains desktop `447f8244` and the API's existing guarded
merge contract. Its 17 history cases pass all four configurations (68 checks).
The renewed complete app catalog now passes all 173 cases in each of the four
theme/viewport configurations (692 total). Current-app types, all 191
renderer/governance cases, renderer build and static catalog build pass.
This closes the required source and public-package consumer gates for this
slice. Native visible history, durable capture and visual approval remain
separate. A compare-only Visual Delta run for the exact dark diff story is
running separately; no baseline creation or approval is claimed.
Logs are retained in jj-store's ignored
`.local/reusable-conversations/history-dc-final-checks.log` and consumer logs.
