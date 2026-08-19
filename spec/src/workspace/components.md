# Workspace / Components

Workspace components compose reusable visual surfaces on top of framework and shell contracts.

## Public surface coverage

| Surface                       | Public boundary                                  | Requirement |
| ----------------------------- | ------------------------------------------------ | ----------- |
| About Dialog                  | `@lapismd/design-core/workspace/about-dialog`    | DC-WS-008   |
| Bottom Panel                  | `@lapismd/design-core/workspace/bottom-panel`    | DC-WS-009   |
| Bottom Panel status clearance | `@lapismd/design-core/workspace/bottom-panel`    | DC-WS-045   |
| Command Palette               | `@lapismd/design-core/workspace/command-palette` | DC-WS-010   |
| Command Palette tabs          | `@lapismd/design-core/workspace/command-palette` | DC-WS-053   |
| Command Palette groups        | `@lapismd/design-core/workspace/command-palette` | DC-WS-054   |
| Command Palette open tab      | `@lapismd/design-core/workspace/command-palette` | DC-WS-055   |
| Settings dialog reveal        | `@lapismd/design-core/workspace/settings`        | DC-WS-056   |
| Drop Overlay                  | `@lapismd/design-core/workspace/drop-overlay`    | DC-WS-011   |
| Empty View                    | `@lapismd/design-core/workspace/empty`           | DC-WS-012   |
| Floating Layer                | `@lapismd/design-core/workspace/floating-layer`  | DC-WS-013   |
| Floating Window               | `@lapismd/design-core/workspace/floating-window` | DC-WS-014   |
| Workspace Icon                | `@lapismd/design-core/workspace/icon`            | DC-WS-015   |
| Workspace Menu                | `@lapismd/design-core/workspace/menu`            | DC-WS-016   |
| Mobile Shell                  | `@lapismd/design-core/workspace/mobile`          | DC-WS-017   |
| Popout Surface                | `@lapismd/design-core/workspace/popout`          | DC-WS-018   |
| Ribbon                        | `@lapismd/design-core/workspace/ribbon`          | DC-WS-019   |
| Settings                      | `@lapismd/design-core/workspace/settings`        | DC-WS-020   |
| Settings multi-enum           | `@lapismd/design-core/workspace/settings`        | DC-WS-044   |
| Settings text-field focus     | `@lapismd/design-core/workspace/settings`        | DC-WS-049   |
| Sidebar                       | `@lapismd/design-core/workspace/sidebar`         | DC-WS-021   |
| Empty Sidebar                 | `@lapismd/design-core/workspace/sidebar-empty`   | DC-WS-022   |
| Sidebar Group                 | `@lapismd/design-core/workspace/sidebar-group`   | DC-WS-023   |
| Sidebar Toggle                | `@lapismd/design-core/workspace/sidebar-toggle`  | DC-WS-024   |
| Workspace Split               | `@lapismd/design-core/workspace/split`           | DC-WS-025   |
| Stacked Tabs                  | `@lapismd/design-core/workspace/stacked-tabs`    | DC-WS-026   |
| Startup                       | `@lapismd/design-core/workspace/startup`         | DC-WS-027   |
| Status Bar                    | `@lapismd/design-core/workspace/status-bar`      | DC-WS-028   |
| Status Item                   | `@lapismd/design-core/workspace/status-item`     | DC-WS-029   |
| Workspace Tabs                | `@lapismd/design-core/workspace/tabs`            | DC-WS-030   |
| Workspace Tree                | `@lapismd/design-core/workspace/tree`            | DC-WS-031   |
| View Header                   | `@lapismd/design-core/workspace/view-header`     | DC-WS-032   |
| Managed plugins               | `@lapismd/design-core/workspace`                 | DC-WS-039   |
| Desktop drag                  | Workspace chrome                                 | DC-WS-042   |

## DC-WS-008 — About Dialog

**Requirement.** The About Dialog family MUST present application identity and metadata through a controlled accessible dialog.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/about-dialog`.
- Dialog scenarios must expose application identity through an accessible title and description relationship.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-009 — Bottom Panel

**Requirement.** The Bottom Panel family MUST compose controlled docked panel tabs, content, resizing, and visibility.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/bottom-panel`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The family MUST NOT host the dock visibility toggle in the right sidebar header; see DC-WS-048.

## DC-WS-045 — Bottom Panel status clearance

**Requirement.** The Bottom Panel view container MUST pad its block-end by `--ui-workspace-status-height` so the last hosted row remains visible above the status bar.

### Acceptance details

- The public boundary remains `@lapismd/design-core/workspace/bottom-panel`.
- A `workspace-view-host` inside `.ui-workspace-bottom-panel__content` MUST set `padding-block-end` to `var(--ui-workspace-status-height)`.
- The catalog MUST assert that computed padding on the hosted view container.

## DC-WS-010 — Command Palette

**Requirement.** The Command Palette family MUST present searchable registered commands with keyboard navigation and consumer execution.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/command-palette`.
- The palette MUST compose `@lapismd/design-core/shadcn/command-view`, retain overlay, controller, and dismiss ownership, and label the search combobox through Command View's root label.
- Overflowing result lists MUST scroll through the Command View list viewport, which uses the public `@lapismd/design-core/shadcn/scroll-area`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-053 — Command Palette tabs

**Requirement.** The Command Palette MUST show filter tabs under the search field for All, Actions, Settings, and each registered provider tab. A missing provider MUST hide its tab.

### Acceptance details

- The public boundary remains `@lapismd/design-core/workspace/command-palette`.
- Tabs MUST compose Command View Filters, and Command View Root MUST NOT own tab state.
- Arrow Right or Shift+Arrow Right MUST cycle tabs while the search input is focused.
- The catalog MUST demonstrate tab filtering and hide a tab whose provider is absent.

## DC-WS-054 — Command Palette groups

**Requirement.** The Command Palette MUST render results as Command View groups. Each tab MUST apply its own grouping. Empty-query Actions MUST group by `sourcePlugin`, then `category`.

### Acceptance details

- The All tab with an empty query MUST show a limited slice per kind and MUST NOT dump every command when other kinds exist.
- The Actions tab MUST list every available command in those plugin or category groups.
- Settings empty-query results MUST list section and group pages; a query MUST list matching fields.
- The catalog MUST assert at least two group headings on the Actions tab.

## DC-WS-055 — Command Palette open tab

**Requirement.** `openPalette` MUST accept an optional tab id and open that filter. An unknown id MUST fall back to All. Close MUST reset the tab to All.

### Acceptance details

- The public command-manager API MUST accept `openPalette({ tab })`.
- Opening Files or another registered provider tab MUST select that filter immediately.
- Close MUST clear the search query and restore the All tab.
- The catalog MUST open the palette on Actions and assert that tab is selected.

## DC-WS-056 — Settings dialog reveal

**Requirement.** The settings controller MUST open the settings dialog and reveal a section or field. Palette Settings items MUST call that API.

### Acceptance details

- `open({ sectionId, fieldId })` MUST set dialog open state, select the section, and highlight the field when `fieldId` is present.
- Ribbon and sidebar Open Settings MUST use the same controller open path.
- A Settings palette row MUST close the palette, open the dialog, and land on that section or field.
- The catalog MUST cover a Settings row that reveals a named field.

## DC-WS-011 — Drop Overlay

**Requirement.** The Drop Overlay family MUST present workspace drop targets and feedback without owning imported data.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/drop-overlay`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-012 — Empty View

**Requirement.** The Empty View family MUST present a reusable empty workspace view with optional consumer actions. A missing-view empty state MUST use the Lucide `ghost` icon.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/empty`.
- Missing-view empty states MUST render `ghost`; ordinary empty leaves MUST keep `file-plus`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-013 — Floating Layer

**Requirement.** The Floating Layer family MUST host floating workspace surfaces with stable stacking and focus relationships.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/floating-layer`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-014 — Floating Window

**Requirement.** The Floating Window family MUST compose movable or resizable controlled windows with accessible title and actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/floating-window`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-015 — Workspace Icon

**Requirement.** The Workspace Icon family MUST resolve registered icon data through a consistent accessible presentation boundary.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/icon`.
- Registered and fallback SVG icons MUST inherit the colour and sizing resolved by the shared icon host.
- The family MUST expose a searchable icon picker that writes a serializable workspace icon name, and Settings `presentation: "icon"` MUST use that picker instead of a text field.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-016 — Workspace Menu

**Requirement.** The Workspace Menu family MUST compose registered workspace actions into accessible menu structures.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/menu`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-017 — Mobile Shell

**Requirement.** The Mobile Shell family MUST adapt workspace navigation and panels to compact viewports without losing actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/mobile`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-018 — Popout Surface

**Requirement.** The Popout Surface family MUST host a controlled detached view surface while leaving browser-window policy to the consumer.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/popout`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-019 — Ribbon

**Requirement.** The Ribbon family MUST present registered workspace destinations and actions in a compact navigation rail.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/ribbon`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-020 — Settings

**Requirement.** The Settings family MUST compose registered settings sections and controlled values without owning persistence.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/settings`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- `Workspace/Components/Settings` All supported controls MUST render every default field kind in one selected section, with `object-array`, `object-grid`, and `object-map` as editable property tables: boolean, string presentations including the workspace icon picker and password input, enum, multi-enum, combobox, shadcn Slider ranges and unbounded numbers, labeled list item types, key-value, section and toggle-table groups, action, custom, and unsupported.
- Restore, list-remove, association-remove, object-row-remove, and settings-search open actions MUST use contrasting panel-action hover tokens, and list plus structured-collection add actions MUST use trailing muted-foreground text that stays WCAG AA on panel paint and brightens on hover.

## DC-WS-049 — Settings text-field focus chrome

**Requirement.** Settings string and textarea fields MUST keep the Input or Textarea focus-visible ring and MUST NOT keep a second border while focused.

### Acceptance details

- Settings CSS MUST set those controls' focus-visible border-color to transparent.
- All supported controls MUST assert a focused string field has a transparent border and a non-none box-shadow.
- Password presentation MUST share that Input focus chrome.

## DC-WS-044 — Settings searchable multi-enum

**Requirement.** Settings `multi-enum` fields MUST open a searchable Command View list so long option catalogs stay filterable. Choosing an option MUST toggle membership without dismissing the picker.

### Acceptance details

- The picker MUST compose `@lapismd/design-core/shadcn/command-view` inside a Popover host and MUST NOT add a settings-local command list.
- Search MUST filter options by value, label, and description, and selected matches MUST appear before unselected matches.
- The trigger MUST remain a labelled combobox that shows option ids: one id, two as `id, id`, and more as `id, id + N more`, with ellipsis overflow.
- `Workspace/Components/Settings` All supported controls MUST search Enabled surfaces, toggle a filtered option, and show the selected-id summary.

## DC-WS-021 — Sidebar

**Requirement.** The Sidebar family MUST compose controlled workspace sidebar views, tabs, resizing, and visibility.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/sidebar`.
- A direct sidebar `WorkspaceViewHost` MUST stretch through the available sidebar body height so content-sized or empty imperative views receive a definite full-height containing block, and its secondary view background MUST resolve to the workspace surface against the panel-painted primary view.
- App Shell footer actions MUST use the Sidebar family’s native workspace-menu tokens for interactive, disabled, descriptive, and focus states.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-022 — Empty Sidebar

**Requirement.** The Empty Sidebar family MUST present a reusable empty sidebar state with context-appropriate actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/sidebar-empty`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-023 — Sidebar Group

**Requirement.** The Sidebar Group family MUST group sidebar content under accessible collapsible headings and actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/sidebar-group`.
- Sidebar groups MUST restore nested views to workspace primary and secondary backgrounds while preserving panel-painted group chrome.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-024 — Sidebar Toggle

**Requirement.** The Sidebar Toggle family MUST provide an accessible controlled sidebar visibility action.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/sidebar-toggle`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-025 — Workspace Split

**Requirement.** The Workspace Split family MUST compose responsive resizable workspace panes with keyboard-accessible handles.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/split`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-026 — Stacked Tabs

**Requirement.** The Stacked Tabs family MUST compose more than one registered tab strip with controlled active values.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/stacked-tabs`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-027 — Startup

**Requirement.** The Startup family MUST present deterministic workspace loading, recovery, and empty startup states. An active task MAY supply `detail`; the live status MUST show that detail when present and MUST otherwise show the task label.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/startup`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The task list MUST keep the stable `label` when `detail` is set.
- The catalog MUST demonstrate an active task whose status message shows `detail`.

## DC-WS-028 — Status Bar

**Requirement.** The Status Bar family MUST compose registered status content and actions into a stable landmark.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/status-bar`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-029 — Status Item

**Requirement.** The Status Item family MUST present compact labelled status, command, or progress content.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/status-item`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-030 — Workspace Tabs

**Requirement.** The Workspace Tabs family MUST compose controlled workspace tabs with selection, close, overflow, and reorder actions.

The family presents the shared controller pane menu, including Move to
sidebar destinations marked with the `move` icon.

### Acceptance details

- The catalog MUST demonstrate supported states through the public `@lapismd/design-core/workspace/tabs` boundary without introducing a second runtime contract.
- Registered leaf labels MUST resolve live titles and optional badges from view chrome across tab, dock, grouped-panel, and mobile surfaces.
- `WorkspaceTab.title` MUST remain the serialized fallback; live badges MUST remain ephemeral and MUST NOT change workspace layout persistence.
- User-created tabs MUST honor the controller's activation policy across top, stacked, bottom-panel, empty-state, and mobile creation actions.

## DC-WS-031 — Workspace Tree

**Requirement.** The Workspace Tree family MUST render hierarchical controlled items with disclosure, selection, keyboard navigation, and actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/tree`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-032 — View Header

**Requirement.** The View Header family MUST compose a workspace view title, context, and actions with consistent alignment.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/view-header`.
- `WorkspaceViewChrome` MAY contribute a structured badge value and accessible label without templating presentation into its title string.
- Workspace leaf labels MUST render contributed badges through the shared Badge component while retaining the plain title as their stable identity.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-039 — Managed plugin settings

**Requirement.** The managed plugin settings family MUST merge presentation state from independently owned lifecycle sources without owning application plugin policy.

### Acceptance details

- Sources must supply stable identities, distribution, lifecycle status, errors, and enable or disable callbacks.
- Included and first-party plugins must render in separate groups with required and busy states.
- Source lifecycle notifications must refresh the settings presentation without polling.
- Plugin rows that have a registered settings section MUST expose an options action that opens that section.

## DC-WS-042 — Desktop window-drag regions

**Requirement.** Non-interactive top-tab, stacked-tab, view-header, and startup chrome MUST set `data-desktop-drag-region`, and shared CSS MUST map that attribute to native `app-region` drag surfaces.

### Acceptance details

- Shared CSS MUST set `app-region` and `-webkit-app-region: drag` on `[data-desktop-drag-region]` except when the value is `false`.
- Interactive descendants MUST set `data-desktop-drag-region="false"` so they compute `no-drag`.
- Sidebar tab rows MUST remain unmarked so native window drag does not capture pane-to-pane tab moves.
