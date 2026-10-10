# Root-file icon inset

Enclosing Jujutsu change `nyxnzqvv` corrects DC-DIFF-002 in the default source
workspace. Existing unrelated work remains in parent `soqpuosr`. Folder and
package root-file icons use the normal 8px inset, without the nested-file
disclosure allowance. Nested-file icons keep their previous depth/disclosure
alignment (40px at depth one). Eager and virtualized rendering share this
behavior. Public props, tree models, selection, keyboard and drag contracts are
unchanged; no baseline is updated and no package is published.

The new geometry story measures both modes and rendering paths. Before:
`pnpm test:storybook src/shared/diff/file-listing/FileListing.stories.svelte`
failed 1/9, observing a root inset of 28px instead of 8px. After: the same cold
command passes 9/9. An initial `-t 'Root file icons'` selected no cases because
the story runner uses PascalCase case names; it provides no acceptance evidence.

`pnpm checks` initially refused a non-atomic specification bullet (one failure);
the corrected single-sentence acceptance passes `pnpm spec:check`. The wider
rerun passes formatting, all four strict type-check lanes, 722 unit tests,
three Turbo tests, static Storybook build and metadata audit, and 675
interaction/accessibility stories. A separate cold `pnpm test:storybook` also
passes 675/675. Workspace pointer tests pass 14/15; the notification-toast test
times out before its assertions while waiting for the unchanged Visual Delta
story-readiness marker. The full aggregate therefore does not pass and stops
before later browser lanes, which are completed independently below. This is outside FileListing acceptance; its source
and readiness helper are unchanged by this change. Log:
`.local/root-files-checks-final.log`. The exact cold follow-up
`pnpm exec node scripts/with-storybook-env.mjs playwright test -c playwright.workspace.config.ts tests/workspace/notification-toasts.spec.ts`
passes 1/1 (23.3s), without a code change; the batch timeout remains recorded.
Log: `.local/root-files-toast-exact.log`.

`pnpm check:types` independently passes the source, shell, filter and source
consumer checks with zero errors/warnings. `pnpm package:local` prepares only an
ignored local built archive (0.1.2; SHA-256
`17313fca164e9e251cda1269affa155c5f9ee908ae8c70175406803ed768d1e3`).
jj-store refreshes that archive through its existing local pnpm hook, restores
its portable lockfile, and passes the exact consumer Files/Changes regression
for both modes plus historical inspector/card scenarios (5/5). Its types and
ownership checks pass. Live Files and selected-turn Changes both measure 8px
root icons in both modes; nested Files stay at 40px. Its frontend cache is
refreshed without restarting the backend, and the current draft is restored
without dispatch. Consumer evidence: E-CHAT-INSPECTOR-001 in default change
`nzltvopw`.

Visual comparisons/baseline approval and release qualification remain separate.
Existing deprecation and Svelte proxy warnings are retained. Next: keep the
unrelated notification story-readiness gate explicit; this slice qualifies root
file spacing and local consumer acceptance.

The remaining required browser lanes were then run explicitly:

- `pnpm test:shell:pointer`: 11/11 pass.
- `pnpm test:shadcn:pointer`: 48 pass, one existing skip.
- `pnpm test:ai-chat-browser`: one pass, two story-readiness timeouts before
  assertions under concurrent startup.
- `pnpm test:ai-chat-browser --workers=1`: a fresh complete rerun passes 3/3
  without code or assertion changes.

Logs: `.local/root-files-shell-browser.log`, `.local/root-files-shadcn-browser.log`,
`.local/root-files-ai-browser.log`, `.local/root-files-ai-browser-recheck.log`.
Every required lane has passing focused or complete evidence; the failed
aggregate attempts remain explicit and are not described as a full aggregate
pass. Visual comparison remains unapproved.
