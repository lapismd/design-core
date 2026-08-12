# Workspace / Components

Workspace components compose reusable visual surfaces on top of framework and shell contracts.

## Public surface coverage

| Surface         | Public boundary                                  | Requirement |
| --------------- | ------------------------------------------------ | ----------- |
| About Dialog    | `@lapismd/design-core/workspace/about-dialog`    | DC-WS-008   |
| Bottom Panel    | `@lapismd/design-core/workspace/bottom-panel`    | DC-WS-009   |
| Command Palette | `@lapismd/design-core/workspace/command-palette` | DC-WS-010   |
| Drop Overlay    | `@lapismd/design-core/workspace/drop-overlay`    | DC-WS-011   |
| Empty View      | `@lapismd/design-core/workspace/empty`           | DC-WS-012   |
| Floating Layer  | `@lapismd/design-core/workspace/floating-layer`  | DC-WS-013   |
| Floating Window | `@lapismd/design-core/workspace/floating-window` | DC-WS-014   |
| Workspace Icon  | `@lapismd/design-core/workspace/icon`            | DC-WS-015   |
| Workspace Menu  | `@lapismd/design-core/workspace/menu`            | DC-WS-016   |
| Mobile Shell    | `@lapismd/design-core/workspace/mobile`          | DC-WS-017   |
| Popout Surface  | `@lapismd/design-core/workspace/popout`          | DC-WS-018   |
| Ribbon          | `@lapismd/design-core/workspace/ribbon`          | DC-WS-019   |
| Settings        | `@lapismd/design-core/workspace/settings`        | DC-WS-020   |
| Sidebar         | `@lapismd/design-core/workspace/sidebar`         | DC-WS-021   |
| Empty Sidebar   | `@lapismd/design-core/workspace/sidebar-empty`   | DC-WS-022   |
| Sidebar Group   | `@lapismd/design-core/workspace/sidebar-group`   | DC-WS-023   |
| Sidebar Toggle  | `@lapismd/design-core/workspace/sidebar-toggle`  | DC-WS-024   |
| Workspace Split | `@lapismd/design-core/workspace/split`           | DC-WS-025   |
| Stacked Tabs    | `@lapismd/design-core/workspace/stacked-tabs`    | DC-WS-026   |
| Startup         | `@lapismd/design-core/workspace/startup`         | DC-WS-027   |
| Status Bar      | `@lapismd/design-core/workspace/status-bar`      | DC-WS-028   |
| Status Item     | `@lapismd/design-core/workspace/status-item`     | DC-WS-029   |
| Workspace Tabs  | `@lapismd/design-core/workspace/tabs`            | DC-WS-030   |
| Workspace Tree  | `@lapismd/design-core/workspace/tree`            | DC-WS-031   |
| View Header     | `@lapismd/design-core/workspace/view-header`     | DC-WS-032   |

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

## DC-WS-010 — Command Palette

**Requirement.** The Command Palette family MUST present searchable registered commands with keyboard navigation and consumer execution.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/command-palette`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-011 — Drop Overlay

**Requirement.** The Drop Overlay family MUST present workspace drop targets and feedback without owning imported data.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/drop-overlay`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-012 — Empty View

**Requirement.** The Empty View family MUST present a reusable empty workspace view with optional consumer actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/empty`.
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

## DC-WS-021 — Sidebar

**Requirement.** The Sidebar family MUST compose controlled workspace sidebar views, tabs, resizing, and visibility.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/sidebar`.
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

**Requirement.** The Startup family MUST present deterministic workspace loading, recovery, and empty startup states.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/startup`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

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

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/tabs`.
- Registered leaf labels MUST resolve live titles and optional badges from view chrome across tab, dock, grouped-panel, and mobile surfaces.
- `WorkspaceTab.title` MUST remain the serialized fallback; live badges MUST remain ephemeral and MUST NOT change workspace layout persistence.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

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
