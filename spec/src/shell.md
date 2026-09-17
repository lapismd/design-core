# Shell

The App Shell owns application structure and responsive layout while consumers own navigation and domain state.

## Public surface coverage

| Surface                 | Public boundary              | Requirement  |
| ----------------------- | ---------------------------- | ------------ |
| Shared Shell invariants | Shell layer                  | DC-SHELL-001 |
| App Shell               | `@lapismd/design-core/shell` | DC-SHELL-002 |
| Shell Guidance          | Documentation surface        | DC-SHELL-003 |

## DC-SHELL-001 — Shared Shell invariants

**Requirement.** Shell contracts MUST own responsive application structure and transient layout state while leaving routing, domain data, and persistence adapters to consumers.

### Acceptance details

- Responsive variants must keep landmarks, labels, focus order, and consumer actions equivalent.
- Mobile panel entry and focus restoration must not scroll the translated stage or move the active panel outside the bounded viewport.
- Shell tokens must remain the supported styling extension boundary, including `--ui-shell-main-border` with the inset, radius, and shadow main-surface tokens.

## DC-SHELL-002 — App Shell

**Requirement.** The App Shell family MUST compose root, toolbar, navigation, main, body, sidebars, and responsive controls through documented compound parts.

### Acceptance details

- The intended content pane, rather than the page or translated mobile stage, must own scrolling when the bounded-shell composition is used.
- Body regions must support the documented scrollbar modes, while compact and reference compositions preserve shell radius, bounded extension points, and component-owned presentation styling.
- Arbitrary same-side sidebars must support deterministic priority and structural ordering, independent persisted geometry, transparent rails, per-panel previews, and exact main-surface replacement that restores inline automatically.
- One compound `SurfaceLayer` must own covered bounds, logical-direction observation, dismissal, focus and inert restoration, and transient panel suspension, while explicit-controller toggles and public controller types remain consumer-safe under `exactOptionalPropertyTypes`.

## DC-SHELL-003 — Shell Guidance

**Requirement.** Shell guidance MUST show the canonical topology, toggle placement, header alignment, collapsed rails, responsive states, and persistence boundary.

### Acceptance details

- Examples must use public App Shell contracts.
- Guidance must identify consumer-owned routing and persistence concerns.
