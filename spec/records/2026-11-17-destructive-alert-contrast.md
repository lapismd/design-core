# Destructive alert description contrast

## Source owner and exact reproduction

jj-store's `RefusalRetainsAnEditableDraft` interaction preserves its editable,
unsent prompt but fails the blocking contrast audit for Alert.Description:
foreground #ea1a23 on white measures 4.49:1 instead of the required 4.5:1.
Its consumer applies no local override. Core's owned Alert root dilutes the
semantic destructive foreground to 90 percent opacity for its description.

The new source-owned light and dark cases use the public Alert parts with
normal-size text and the standard themes. Before the product edit,
`pnpm test:storybook src/shared/shadcn/alert/Alert.stories.svelte --testNamePattern 'DestructiveDescription'`
reports one failed/one passed/two unselected: the light case reproduces the
identical #ea1a23/white 4.49:1 violation. The generated upstream Preview has an
existing todo accessibility disposition; these owned regressions inherit the
blocking global audit and do not modify that generated file or its disposition.
Original logs: `/tmp/jj-store-next-seven-boundaries-before.log` and
`/tmp/core-alert-contrast-before.log`.

## Repair and qualification scope

DC-SHA-012 and DC-CSS-004 now explicitly require readable destructive description
text. Remove only the translucent colour override; the existing full semantic
foreground rule remains. Default alert colours, host tokens, layout, roles,
message content and every diagnostic threshold remain unchanged. No consumer
CSS workaround, package alias, patch, baseline change or accessibility exception
participates. Both new stories remain visual-pending with public, highlighted
consumer examples in an owned module, leaving generated examples untouched.

The patch Changeset is genuine runtime release intent. This is a follow-up on
the existing source PR, before its patch release, so the original reaction and
cold-validation fixes are retained in one combined release candidate. Exact
source regressions, the complete owning family, current canonical/types/units,
full relevant interaction/browser/static lanes and clean packed-consumer checks
must qualify the combined source. Registry publication and the original
jj-store consumer acceptance remain separate gates. Qualification is pending.

## Source and public-archive regression follow-up

The exact source target passes both light and dark cases after the colour edit;
the complete Alert family passes all five cases. The combined native source
run passes governance, four zero-error/zero-warning type lanes, 1,133 unit cases,
40 release controls, static build/audit and all 1,066 Storybook cases, including
the new blocking regressions. Browser/packed qualification remains in progress.

The existing packed-consumer state checker now also exercises the destructive
variant in both modes and both development/production hosts. Running that exact
exported consumer check against the independently SRI-verified published0.13.4
archive fails one semantic-foreground assertion: its description computes as
`oklab(0.577 0.217662 0.112464 / 0.9)` while its full foreground remains
`oklch(0.577 0.245 27.325)`. This proves the defect exists in the actual public
artifact, rather than only in a source catalog. Published archive SHA256 is
936d2bca9002998fbcc5d249ef5f953f01c3c3e09e23d6bbdd4f8d35e10439cb.
The exact checker invocation is retained in `/tmp/core-alert-packed-before.log`;
its immutable input and registry metadata remain in
`~/.cache/core-alert-public-consumer-20261117/`.

Prepare the changed source archive and rerun the same consumer boundary before
the wider `pnpm packages:pack` gate. The new assertion preserves all previous
states and verifies actual computed colours; it changes no production palette,
contrast threshold, patch bytes or audit decision. The original published0.13.4
is retained as failing historical evidence; the repaired release and subsequent
jj-store registry adoption must provide the final consumer proof.

## Completed combined qualification

The native aggregate completes Workspace27, Shell17 and AI3, after its passing
source/spec/type/unit/static/1,066-story gates. Its Shadcn lane retains186 passed,
10 failed and one existing skip. Seven failures are unsupported local WebKit
launches. Three Chromium startup/context failures are retained separately;
a fresh exact three-case command passes two and encounters one dynamic-import
startup failure. No timeout, retry, readiness, context assertion or baseline is
changed. Native traces remain under
`/tmp/core-alert-native-shadcn-first-failures/` and the exact diagnostic log is
`/tmp/core-alert-native-three-exact.log`. The native aggregate remains a failed
command, not an inferred exit-zero result.

Cold qualification uses the same reviewed Playwright1.64.1 Linux image and
verified Node24.15.0/pnpm10.32.1 tuple as the earlier source record. Both exact
Alert regressions and all five family cases pass. A newly prepared source
archive passes the same exported public-consumer checker that rejects the
published0.13.4 archive. It exercises actual destructive-description colour in
both modes and development/production, with strict types and the retained Bits
UI byte guards. The wider `pnpm packages:pack` gate then passes, including a
zero-finding production audit. Exact WebKit7 passes, followed by the entire
Shadcn lane196 passed/one existing skip, including all three native failing
Chromium targets. All40 release controls pass afterward. The owned container
exits zero and is removed after retaining its logs and audit receipt.

Tested source snapshot: `edd1c7e94fd1d16c210fe149f4fc52a6b56e1b06`.
Source archive SHA256:
`46d46cf85051a0a2b6757da17d89a363f97f6d81b2986d48a30a37265c2555cd`.
Prepared exact-consumer archive SHA256:
`3d525c3bb21b73dc40a7536eba9c306b570531d44eb87fd385838d1169466af8`.
Receipts and logs: `~/.cache/core-alert-supported-20261117/`. A current-tree
comparison confirms all non-spec tracked inputs remain identical to the tested
source; only completion evidence changes afterward. Current canonical and
formatting checks, fresh pre-push dependency disposition, hosted combined-head
acceptance, publication and jj-store registry adoption remain separate gates.

Final local canonical validation passes all three lanes. The complete main-range
spec-first check from c06db73f through the combined candidate passes eight
protected files and seven canonical chapters. Release configuration and the
format check over the full combined diff pass. Fresh origin fetch reports no
change; the default workspace contains both owned source slices, while both
registered foundation-auth-base workspaces remain clean and their c1e19ba1
parents are already included in main. The fresh paginated Dependabot query is
empty, so no dependency-consolidation PR is manufactured. This completes local
qualification and pre-push disposition; combined-head hosted checks and the
actual registry release/consumer handoff remain open.
