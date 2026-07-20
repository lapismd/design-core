# Tasks interaction evidence

This is the bridge between the product contract and the synthetic-fixture
capture. It separates browser-observed desktop behavior from deliberately
specified responsive behavior that still needs a live fixture repeat.

## Observed on 2026-07-20

| Interaction            | Result                                                | Evidence                                                               |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| Desktop row click      | selects the row and reveals trailing actions          | `motion/synthetic-browser-task-open/00-before.png` → `01-selected.png` |
| Desktop double click   | no separate pane transition in the selected-row state | browser fixture observation                                            |
| Desktop details action | opens a right task-detail rail                        | `01-selected.png` → `02-detail.png`                                    |

## Specified, pending fixture repeat

- Completion/reopen and any undo feedback.
- Drag reorder and keyboard reorder.
- Property picker commits and inline title editing.
- Mobile left drag, task-detail back path, and right swipe after opening a detail pane.
- Reduced-motion equivalents.

A future capture must use the dedicated synthetic fixture list before upgrading
any pending entry to observed behavior.
