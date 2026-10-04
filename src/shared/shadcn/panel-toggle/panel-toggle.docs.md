# Panel Toggle

Import `PanelToggle` and `PanelToggleIcon` from
`@lapismd/design-core/shadcn/panel-toggle`. This is a project-authored native CSS
family that composes Button; no registry conversion is required.

`expanded` is controlled. `side` defaults to `left` and may be `right`.
Button attributes, events, size, variant, ref and custom children pass through.
Provide an accessible label describing the panel. Hover and focus animate the
bar toward the next state without invoking the action. Disabled controls do not
preview. Reduced motion disables the transition.

The decorative icon can be placed inside an existing native button with
`data-panel-toggle` for hover/focus behavior. It is hidden from assistive
technology; the button supplies semantics. Column Canvas uses this composition
in collapsed rails and preserves custom rail and icon snippets.

| Token                               | Default           |
| ----------------------------------- | ----------------- |
| `--ui-panel-toggle-width`           | `1.75rem` (28px)  |
| `--ui-panel-toggle-height`          | `1.5rem` (24px)   |
| `--ui-panel-toggle-icon-width`      | `1.125rem` (18px) |
| `--ui-panel-toggle-icon-height`     | `0.75rem` (12px)  |
| `--ui-panel-toggle-expanded-bar`    | `9px` (SVG units) |
| `--ui-panel-toggle-collapsed-bar`   | `3px` (SVG units) |
| `--ui-panel-toggle-motion-duration` | `150ms`           |

Ghost paint uses low-specificity selectors so a composing family can retain its
public hover/focus color tokens. Column Canvas header action colors remain
authoritative around this Button.
