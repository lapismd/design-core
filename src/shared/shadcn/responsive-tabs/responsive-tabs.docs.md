# Responsive Tabs

Import `{ ResponsiveTabs, type ResponsiveTab }` from
`@lapismd/design-core/shadcn/responsive-tabs`. The component measures natural
control widths, retains tabs that fit and puts the remainder in More. At the
narrowest width every choice remains in that menu. Disabled choices remain
visible but cannot change selection.

Bind `value`, or supply `value` and `onValueChange`. `items` have `value`, `label`,
optional `disabled` and `Icon`. `leading` and `trailing` snippets consume their
natural width before fitting the tabs. `presentation` is `pill` or `line`.

For content panels, put the control inside `Tabs.Root bind:value`, pass
`inheritContext` and bind the same `value`. Name each `Tabs.Content` with
`aria-label` so an overflowed trigger is not its only accessible name.

`--ui-responsive-tabs-gap` defaults to `0.4rem`. Each family imports its own CSS.
Observers and queued measurements are released on unmount.
