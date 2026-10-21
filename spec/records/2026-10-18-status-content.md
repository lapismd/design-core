# Owned status content

DC-WS-029 adds an optional `mount(host)`/disposer for custom status controls.
The default button/menu remains unchanged; the custom owner supplies CSS and
accessibility. This enables a downstream plugin split control/popover without
shell-specific repository UI. Native desktop status and App bridge acceptance
remain consumer-owned.

- `pnpm exec vitest run --project storybook src/shared/workspace/status-item/WorkspaceStatusItem.stories.svelte -t 'Owned custom content'`: skipped (incorrect generated test name).
- Same file with `-t OwnedCustomContent`: 1 passed; 2 skipped.
- Complete status-item family initially 1 failed/2 passed from preceding menu
  close transition retaining pointer blocking; wait for enabled pointer events.
  Final fresh run: 3 passed/0 failed, including owner action and removal/disposal.
- `pnpm check:types`: all four Svelte/consumer checks pass, zero diagnostics.
- `pnpm package:local`: prepared public source/declaration/CSS archive; no publication.
- Initial `pnpm spec:first`: missing mapped framework chapter; added the contract.
- Visual approval/baselines, release and aggregate unrelated lanes stay deferred
  in the user's functional-plugin slice. No baselines changed.
