# Panel Toggle integration

Workspace: design-core-chat-transcript. Implements the separate integration
checkpoint from panel-toggle-shared-icon.md under DC-SHA-053, DC-SHA-040,
DC-SHELL-003 and the existing Workspace contracts.

Workspace side and bottom controls, AppShell outer and body controls, Sidebar
triggers, and mobile/settings navigation now compose PanelToggleIcon. Column
Canvas keeps compact geometry. Wrappers retain controllers, labels, keyboard
activation, focus, preview behavior, drag exclusions, sizing and hint metadata.
Sidebar.Trigger adds an optional left/right side, defaulting to left.
The controlled example and its consumer source use the same icon.

## Baselines

Before integration, the focused source Storybook command covering side toggles,
bottom panel, settings, AppShell, Sidebar, Panel Toggle and Column Canvas passed
74/74 stories (/tmp/dc-panel-integration-before.log). Mobile, Workspace AppShell
and the reusable demo added 27/27 passing stories
(/tmp/dc-panel-mobile-before.log). The original eight icon pointer tests had one
transient Column Canvas hover-colour failure; an unchanged exact rerun passed
(/tmp/dc-panel-hover-recheck.log). Full final qualification is recorded below.

Stories remain visual-pending. No screenshot baseline is updated. Consumer
adoption and publication remain outside this workspace.

## Qualification to date

The integration's five new native browser cases pass in the Shadcn browser lane
(106 passed, one platform skip; `/tmp/dc-promotion-shadcn-shared-server.log`).
Shell's 11 native cases and AI's 3 native cases pass. The package's specification,
four type configurations, no-Tailwind source audit, static build and metadata
checks pass. The final unit count after the separate Transcript refinements is
776/776. The clean packed consumer also type-checks the optional Sidebar.Trigger
side contract and passes cold development/production runtime acceptance without
Tailwind tooling (`/tmp/dc-transcript-pack-latest.log`).

The wider Workspace browser lane remains at 8 passed / 7 failed. Two failures
reproduce on unchanged main `31b5d2e2`; see transcript-extraction.md for the exact
boundary and evidence. The later full Storybook run also had one intermittent
existing EmojiPicker focus failure (782 passed); its unchanged focused rerun
passed. These failures are not waived and this integration is not release
qualified. Finalization awaits explicit acceptance or separate repair. All
component stories remain available for review without changing baselines.
