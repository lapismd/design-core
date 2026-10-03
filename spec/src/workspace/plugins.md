# Workspace / Plugins

Workspace plugins extend controllers and presentation through explicit registration rather than global mutation.

## Public surface coverage

| Surface              | Public boundary                                        | Requirement |
| -------------------- | ------------------------------------------------------ | ----------- |
| F-Mode plugin        | `@lapismd/design-core/workspace/plugins/fmode`         | DC-WS-035   |
| F-Mode edge cases    | Catalog documentation                                  | DC-WS-036   |
| Notifications plugin | `@lapismd/design-core/workspace/plugins/notifications` | DC-WS-037   |

## DC-WS-035 — F-Mode plugin

**Requirement.** The F-Mode plugin family MUST register focused-mode workspace behavior through explicit plugin contracts and reversible controller state.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/plugins/fmode`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-036 — F-Mode edge cases

**Requirement.** The F-Mode edge cases family MUST demonstrate focus-mode recovery, unavailable targets, repeated activation, and layout changes.

### Acceptance details

- The public boundary is Catalog documentation.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-037 — Notifications plugin

**Requirement.** The Notifications plugin family MUST register controlled notification state and presentation without owning transport or persistence.

### Acceptance details

- The public boundary MUST remain `@lapismd/design-core/workspace/plugins/notifications`, with compatible app and controlled-record inputs.
- Controlled callbacks MUST expose dismissal, actions and timer pause/resume while hosts retain lifetime and persistence ownership.
- Each record MUST announce once and distinguish severity with icons and theme colors.
- The optional portal MUST retain modal keyboard access without stealing focus, anchor the stack at the bottom end of the viewport away from header controls and remove detached DOM on teardown.
