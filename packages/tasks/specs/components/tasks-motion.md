# Tasks Motion and Gestures

Motion is functional feedback, not decoration. Exact observed timing bands and
reduced-motion fallbacks are defined in `src/lib/reference.ts`.

| Interaction | Default                         | Reduced motion               |
| ----------- | ------------------------------- | ---------------------------- |
| Completion  | 160–260ms state/layout response | instant state change         |
| Detail open | 180–300ms rail/pager transition | instant pane replacement     |
| Reorder     | 140–240ms lift/drop response    | instant ordered result       |
| Row swipe   | 180–320ms reveal/settle         | short fade or visible action |
| Pager back  | 220–360ms horizontal transition | short fade or instant back   |

Swipes must use pointer/touch thresholds and velocity, cancel on vertical scroll
intent, and expose the resulting action through keyboard and pointer controls.

## Captured observation

The 2026-07-20 native desktop pass shows one click selecting a row and revealing
its trailing details affordance. In that state, a second/double click does not
open a new pane; the explicit affordance opens task detail. The mobile web pass
shows a left drag translating the row while keeping the parent pane stationary.
See the redacted keyframes under `reference/superlist/2026-07-20/motion/`.
