# Desktop window controls and settings headings

DC-WS-069 now defaults Settings section headings to weight 700, including the
Lapis theme. Explicit ancestor size/weight overrides remain authoritative.
DC-WS-070 adds the public overlay window-controls inset (default 0px) for
maximized top and stacked tab groups. Hosts can reserve the full native controls
area independently of sidebar/ribbon spacing.

The four exact Settings and tab-group stories failed before the changes and
passed 4/4 afterward. All directly affected Settings, top-tabs, and stacked-tabs
stories passed 19/19. The full Storybook interaction/accessibility lane passed
686/686; unit tests passed 728/728 in 113 files. Governance, formatting, types,
consumer types, tooling tests (3/3), release tests (10/10), the static Storybook
build, and visual metadata audit passed in the aggregate run.

The initial aggregate browser stage was interrupted after a notification-toast
readiness timeout during competing builds. Its exact rerun passed 1/1, followed
by a full workspace-pointer pass (15/15). Shell browser acceptance passed 11/11;
shadcn pointer/browser acceptance passed 56 with one governed skip. The first AI
browser attempt had two readiness timeouts and one pass; the unchanged cold
rerun passed 3/3. No functional or accessibility failures remain in those lanes.
The interrupted aggregate itself is not recorded as passing.

The four-story canonical Docker comparison built Storybook successfully, then
failed while persisting its cache with EACCES in `canonical-build-cache/entries`.
The compare-only runner also rejected the redirected log as an artifact. This
is a Visual Delta runner limitation, not a passing screenshot comparison.

Visual comparison remains a separate review lane. Stories remain
`visual-pending`; no baselines have been updated. Desktop consumer acceptance
uses a checksum-verified local archive while manifests and lockfiles retain
portable npm ranges. The patch changeset requires a subsequent Design Core
release and consumer refresh before registry-only release qualification.
