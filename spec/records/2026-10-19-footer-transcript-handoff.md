# Footer and transcript integration

2026-10-19; enclosing Jujutsu change ysmlsmsy.

The desktop's concurrent AI-history integration consumes newer transcript
components than the footer qualification archive. Combine source commits
`87d0db7b8d6789d0161bbf0c041b4f023af7976c` and
`0ad075a2a67d35c202ffb159a69dec315def141d` in the isolated `status-footer`
workspace. `jj new tlwwtrzr rnvsrvkm -m "Combine verified footer with current
transcript components"` merges without conflicts. `jj resolve --list` reports
no conflicts (exit 2); no production source is edited during integration.

Unchanged contracts: DC-WS-003/019/028/029/045 retain the approved footer,
three-region status placement, overflow, Settings and reserved shell space.
DC-CHAT-002/006 and DC-AI-011 retain composer attachment drawers, plain custom
transcript results and existing comment/link presentation. The merge preserves
each parent's owned implementation and canonical chapters. It does not add a
consumer override or alter public contracts. The original footer and individual
transcript records remain immutable.

The footer parent records full source checks, 833 units, 865 catalog cases,
static metadata and pointer qualification. Companion transcript records retain
their focused/type/spec evidence and deferred gates. Recheck the combined
affected source families and public package types, then pack a distinct archive
for desktop handoff. Keep the original qualified footer archive intact. Desktop
E-CATALOG-009 owns installation, combined consumer acceptance and application
after its main checkout is clean.

Combined qualification:

- `pnpm check:types`: four source/consumer configurations pass with zero errors
  and warnings; `.local/verification/footer/combined-types.log`.
- `pnpm test:unit`: 833 tests in 135 files pass, zero skips;
  `.local/verification/footer/combined-unit.log`.
- `pnpm test:storybook src/shared/workspace/status-bar
src/shared/workspace/app-shell
src/shared/workspace/demo/ReusableFrameworkDemo.stories.svelte
src/shared/workspace/bottom-panel src/shared/chat/transcript
src/shared/chat/markdown-composer
src/shared/ai/composer/Composer.stories.svelte
src/shared/ai/composer-drawer/ComposerDrawer.stories.svelte`: 100 cases in
  16 files pass from fresh package/Storybook transforms;
  `.local/verification/footer/combined-stories.log`.

These integration runs cover the complete directly affected source families;
they do not claim another full catalog or pointer matrix. Each original slice's
broader and deferred qualification remains recorded in its owning evidence.

Milestone review: the footer design and combined source checks pass. Desktop
handoff remains owned by E-CATALOG-009. No release, publication, native product
gate or visual baseline is promoted.

`pnpm spec:check` passes validation, mdBook and spec-first. The new record is
formatted with Prettier. `packLocal(process.cwd(), { suffix:
"-footer-integrated" })` builds declarations and ordinary browser CSS (3 sheets
compiled, 254 audited, zero utility references). Archive:
`.local/packages/lapismd-design-core-0.5.1-footer-integrated.tgz`, SHA256
`751f2ec018ca4c71e57a28d0d11dfb3669e1688f149df7942f09aaee1be202fc`.
Logs: `.local/verification/footer/combined-spec.log`, `combined-format.log` and
`combined-package.log`. Both qualified source parents remain ancestors of the
integration. Main-workspace retirement and desktop acceptance are recorded by
the desktop handoff; neither original package archive is replaced.
