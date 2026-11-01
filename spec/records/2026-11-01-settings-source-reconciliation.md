# Reconcile Settings after a lost write acknowledgement

The shared Settings controller now rereads its source after a rejected write.
A native service may commit the change before its acknowledgement is lost;
reverting the visible value to the previous renderer value misrepresents the
saved selection. Reconciliation does not replay the mutation. If the source
cannot be read, the previous value and original write error remain visible.

## Exact regression

`pnpm exec vitest run --project unit
src/shared/workspace/settings/settings-source-recovery.spec.ts` initially had
one failure and one pass. After the repair both cases pass; the combined
Settings unit family passes 15 cases. The production Settings feedback stories
pass five interaction/accessibility cases, including lost acknowledgement.

## Complete source checks

`pnpm checks` passes governance, formatting/types, 1,120 unit cases, the static
catalog, 1,034 interaction/axe cases, 16 workspace browser cases, 17 shell browser
cases and three AI browser cases. Its first Shadcn browser attempt reports
194 passes, two transcript readiness timeouts and one existing skip.

A targeted repeat was interrupted when the first run shut down their shared
owned server. An isolated cold repeat on port 9409 then passes all nine
transcript author/parity cases without changing assertions, timeouts or product
code. The complete isolated cold Shadcn lane passes 196 cases, with zero
failures and the same one existing skip, and is retained separately in
`.local/ui-parity/settings-shadcn-cold-complete.log`.

Packed public CSS/exports and consumer acceptance remain separate from these
source checks. Visual review stays pending; no screenshot comparison or
baseline update was performed.
