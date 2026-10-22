# Shell

The App Shell owns application structure and responsive layout while consumers own navigation and domain state.

## Public surface coverage

| Surface                 | Public boundary                 | Requirement  |
| ----------------------- | ------------------------------- | ------------ |
| Shared Shell invariants | Shell layer                     | DC-SHELL-001 |
| App Shell               | `@lapismd/design-core/shell`    | DC-SHELL-002 |
| Shell Guidance          | Documentation surface           | DC-SHELL-003 |
| Top bar                 | `AppShell.Topbar`               | DC-SHELL-004 |
| Resize observation      | Shell geometry lifecycle        | DC-SHELL-005 |
| Attached panels         | `Sidebar` and `Sidebar.Section` | DC-SHELL-006 |
| Overlay page chrome     | `SurfaceLayer` compound parts   | DC-SHELL-007 |

## DC-SHELL-001 — Shared Shell invariants

**Requirement.** Shell contracts MUST own responsive application structure and transient layout state while leaving routing, domain data, and persistence adapters to consumers.

### Acceptance details

- Responsive variants must keep landmarks, labels, focus order, and consumer actions equivalent, and panel selectors must include their visible selected panel in the accessible name.
- Layout-only mobile stage and lane wrappers must stay semantically neutral so application content remains contained by its real navigation and main landmarks.
- Mobile panel entry and focus restoration must not scroll the translated stage or move the active panel outside the bounded viewport.
- Shell tokens must remain the supported styling extension boundary, including `--ui-shell-main-border` with the inset, radius, and shadow main-surface tokens.

## DC-SHELL-002 — App Shell

**Requirement.** The App Shell family MUST compose root, toolbar, navigation, main, body, sidebars, and responsive controls through documented compound parts.

### Acceptance details

- The intended content pane, rather than the page or translated mobile stage, must own scrolling when the bounded-shell composition is used; `Sidebar.Body scrollable={false}` must retain bounded flex geometry while allowing a child chat or editor to own the only scroll viewport.
- Body regions must support the documented scrollbar modes and an explicit non-main semantic element for embedded shell content, while compact and reference compositions preserve shell radius, bounded extension points, and component-owned presentation styling, including token-driven default padding on the shared main Toolbar.
- Arbitrary same-side sidebars must support deterministic priority and structural ordering, independent persisted geometry, transparent rail borders and resize indicators in expanded, hover, preview and dragging states, per-panel previews, and exact main-surface replacement that restores inline automatically; keyboard resize focus MUST remain visible, and consumer hide/show transitions MUST retain the controller's closed state with zero layout width or restore an open panel at its retained width.
- One compound `SurfaceLayer` must own covered bounds, logical-direction observation, dismissal, focus and inert restoration, transient panel suspension, mobile placement outside inert lane subtrees, active-lane mobile hosting, opt-in root mobile hosting for whole-stage overlays, teardown that removes live teleported nodes without reattaching removed nodes, and configured leading allowance across desktop and mobile, while explicit-controller toggles and public controller types remain consumer-safe under `exactOptionalPropertyTypes`.

## DC-SHELL-003 — Shell Guidance

**Requirement.** Shell guidance MUST show the canonical topology, toggle placement, header alignment, collapsed rails, responsive states, and persistence boundary.

### Acceptance details

- Examples must use public App Shell contracts and the shared standard PanelToggleIcon for outer and body-local visibility controls, deriving expanded state from the effective desktop, preview or mobile panel state.
- Guidance must identify consumer-owned routing and persistence concerns.

## DC-SHELL-004 — Top bar

**Requirement.** AppShell.Topbar MUST provide reusable application chrome above Root and opt-in relocation into an explicit body-header target while retaining the canonical sidebar/main topology.

### Acceptance details

- The top bar MUST support leading content before back/forward controls, centre and trailing snippets, optional back/forward callbacks and an explicit main-element reference for centre alignment.
- Measurements MUST avoid overlap in narrow layouts and release observers and queued frames during teardown; body placement MUST use the existing controller's resolved mode and a neutral `Topbar.Target` outside scrolling content.
- The top bar MUST share the outer body background by default, and the full-height catalog MUST compose icon-collapse left navigation, body-local sidebars, an independent right inspector and a transparent far-right rail using existing controllers and shared Panel Toggle icons, with ResponsiveTabs and independently scrolling content bodies rather than page scrolling.
- The default top placement MUST remain compatible; opt-in body placement MUST move one mounted bar, preserve drafts, focus and open widgets, fall back to its original position without a target, and allow native hosts to retain top placement explicitly.

## DC-SHELL-005 — Resize observation

**Requirement.** Shell geometry observers MUST defer reactive layout changes out of ResizeObserver delivery and release queued work on teardown.

### Acceptance details

- Automatic, constrained and multi-panel shells MUST settle without ResizeObserver loop diagnostics.
- Observations MUST coalesce into animation frames and retain the initial bounded-root measurement.
- Unmounting MUST disconnect observers and cancel pending frames.

## DC-SHELL-006 — Attached panels and rail sections

**Requirement.** AppShell.Sidebar MUST offer an opt-in attached surface variant and reusable neutral content sections without changing controller or persistence ownership.

### Acceptance details

- Adjacent visible inline attached panels and Main MUST share background and outer edges, with one internal divider and no intervening gap; independent outer rails MUST remain outside the group.
- Hidden, closed, suspended, previewed and mobile panels MUST leave no stale joined edges; constrained replacement MUST retain the corresponding exposed edges.
- `Sidebar.Section` MUST accept host-owned heading, actions and content snippets, use public spacing tokens, and infer no heading level or navigation state.
- Existing sidebar variants, independent widths, pointer/keyboard resizing, priorities and persisted state MUST retain their contracts.

## DC-SHELL-007 — Overlay page chrome

**Requirement.** SurfaceLayer MUST provide opt-in fixed footer and contextual close parts, child-owned scrolling and responsive inset tokens through its existing single-layer contract.

### Acceptance details

- `SurfaceLayer.Close` MUST delegate to the owner's current `onDismiss`, inherit its accessible dismissal label and respect a prevented click; it MUST NOT create open state.
- Header and Footer MUST remain outside the bounded body viewport; `Body scrollable={false}` MUST allow a child to own scrolling while the default retains its Scroll Area.
- Mobile inset tokens MUST fall back to existing desktop inset values when unset; header/footer spacing and separators MUST use public tokens.
- Scrim/Escape dismissal, portalled-menu Escape handling, focus return, coverage, panel suspension and restoration MUST retain their existing contracts.
