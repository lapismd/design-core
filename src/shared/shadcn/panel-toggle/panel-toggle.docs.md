# Panel Toggle

Import `PanelToggle` and `PanelToggleIcon` from
`@lapismd/design-core/shadcn/panel-toggle`. This is a project-authored native CSS
family that composes Button; no registry conversion is required.

`expanded` is controlled. `side` defaults to `left` and may be `right`, `top` or
`bottom`. `iconVariant` defaults to `compact`; choose `standard` for Workspace's
larger frame proportions. Both variants support all four directions. Top bars thicken downward and bottom
bars thicken upward while the frame stays in its original orientation.
Button attributes, events, size, variant, ref and custom children pass through.
Provide an accessible label describing the panel. Hover and focus animate the
bar toward the next state without invoking the action. Disabled controls do not
preview. Reduced motion disables the transition.

The decorative icon can be placed inside an existing native button with
`data-panel-toggle` for hover/focus behavior. It is hidden from assistive
technology; the button supplies semantics. Column Canvas uses this composition
in collapsed rails and preserves custom rail and icon snippets.

Without `data-panel-toggle` on the enclosing control, the icon only displays
`expanded`; it does not add hover behavior. Standard icons default to 16×16px,
and do not resize automatically when expanded. Hosts can retain their existing
state-dependent dimensions using the standard sizing tokens. Native SVG
`class`, `style` and `data-*` attributes pass through; geometry, internal semantic
markers and the decorative accessibility attributes remain component-owned.
`PanelToggleIconProps` is exported for typed composition.

| Token                                                | Default              |
| ---------------------------------------------------- | -------------------- |
| `--ui-panel-toggle-width`                            | `1.75rem` (28px)     |
| `--ui-panel-toggle-height`                           | `1.5rem` (24px)      |
| `--ui-panel-toggle-icon-width`                       | `1.125rem` (18px)    |
| `--ui-panel-toggle-icon-height`                      | `0.75rem` (12px)     |
| `--ui-panel-toggle-expanded-bar`                     | `9px` (SVG units)    |
| `--ui-panel-toggle-collapsed-bar`                    | `3px` (SVG units)    |
| `--ui-panel-toggle-motion-duration`                  | `150ms`              |
| `--ui-panel-toggle-standard-icon-width`              | `1rem` (16px)        |
| `--ui-panel-toggle-standard-icon-height`             | `1rem` (16px)        |
| `--ui-panel-toggle-standard-expanded-bar`            | `5.76px` (SVG units) |
| `--ui-panel-toggle-standard-collapsed-bar`           | `2px` (SVG units)    |
| `--ui-panel-toggle-standard-horizontal-expanded-bar` | `5px` (SVG units)    |

The original icon-size and bar tokens apply to compact icons; the standard
tokens are independent. Motion duration applies to both. Each icon imports its
own CSS with token fallbacks, so it can be composed without importing Button's
styles. Button sizing, labels, children and callbacks remain compatible.

Compact top/bottom bars use `--ui-panel-toggle-horizontal-expanded-bar` (5 SVG units)
instead of the wider left/right expansion, keeping clear space beside the indicated edge.

Ghost paint uses low-specificity selectors so a composing family can retain its
public hover/focus color tokens. Column Canvas header action colors remain
authoritative around this Button.

Prefer `PanelToggleIcon` for sidebar visibility icons, `PanelToggle` for a standalone controlled button, and the existing Workspace/AppShell toggle when controller integration is needed.
