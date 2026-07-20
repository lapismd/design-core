# Tasks interaction evidence

This is the bridge between the product contract and the redacted live capture.
It separates observed behavior from deliberately specified behavior that still
needs a synthetic-fixture repeat.

## Observed on 2026-07-20

| Interaction             | Result                                                         | Evidence                                             |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| Desktop row click       | selects the row and reveals trailing actions                   | `motion/task-open/00-before.jpg` → `01-selected.jpg` |
| Desktop double click    | no separate pane transition in the selected-row state          | task-open manifest                                   |
| Desktop details action  | opens a right task-detail rail                                 | `01-selected.jpg` → `02-detail.jpg`                  |
| Mobile left drag on row | translates the row left; the parent pane does not move         | `motion/mobile-row-swipe/`                           |
| Responsive Inbox        | remains one focused surface at 1024×768, 768×1024, and 390×844 | web screenshots                                      |

## Specified, pending fixture repeat

- Completion/reopen and any undo feedback.
- Drag reorder and keyboard reorder.
- Property picker commits and inline title editing.
- Mobile task-detail back path and right swipe after opening a detail pane.
- Reduced-motion equivalents.

A future capture must use a repaired, exact-name private fixture with synthetic
rows before upgrading any pending entry to observed behavior.
