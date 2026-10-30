# Hosted browser investigation

The first PR 38 Storybook job (Actions 41110912949) passes 963 cases and fails
11 AppShell cases on ResizeObserver loop diagnostics. These failures remain
blocking until the required hosted gate passes; no warning is filtered.

The exact MobilePanelFocus case passes locally once and in a fresh bounded
Linux container once. The entire original AppShell file passes all 16 cases in
that container. The original resize warning has not reproduced there.

The same Linux tool image, exact source e03b6776 and frozen registry install
produce different full-catalog failures: 968 pass and six fail, both with normal
scheduling and with explicit sequential scheduling. The latter experiment does
not repair the failures and does not justify changing normal scheduling.
Failures involve filter autocomplete, popup dismissal/focus or readiness in
QuantityInput, EmojiPicker, WorkspaceStackedTabs and WorkspaceStatusItem; these
diagnostic runs are not passing qualification. Full logs are retained by the
task. The required macOS owning checks and hosted Linux gate remain distinct.

A native resize-delivery probe on the current stream Layout passes before any
Layout change. That probe supplies no failing regression for a stream-layout
repair and is not retained as product acceptance. No speculative Layout change
is made. One deliberate retry of the original hosted Storybook job will check
whether its exact warning recurs; actual results must be retained separately.

The deliberate hosted retry passes all 974 Storybook cases, followed by audits
and aggregate validation; PR 38 merges at 63657fe6 with every required check
green. The diagnostic tool-image failures above are not promoted to Docker
qualification. Version PR 39's later independent focus-readiness failure is
recorded in `2026-10-30-version-pr-focus-readiness.md`.
