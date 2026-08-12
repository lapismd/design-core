<script lang="ts">
  import * as Table from "@lapismd/design-core/shadcn/table";
  import { ContextMenu } from "bits-ui";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import {
    diagnosticCodeValue,
    type WorkspaceProblemsController,
  } from "./problems-controller.svelte.js";
  import type {
    WorkspaceDiagnosticEntry,
    WorkspaceDiagnosticRelatedInformation,
    WorkspaceDiagnosticSeverity,
  } from "./types.js";

  let {
    controller,
    filters,
  }: {
    controller: WorkspaceProblemsController;
    filters: Array<{
      severity: WorkspaceDiagnosticSeverity;
      icon: string;
    }>;
  } = $props();

  function severityIcon(severity: WorkspaceDiagnosticSeverity): string {
    return (
      filters.find((filter) => filter.severity === severity)?.icon ?? "circle"
    );
  }

  function positionLabel(line: number, character: number): string {
    return `[Ln ${line + 1}, Col ${character + 1}]`;
  }

  function resourceLabel(entry: WorkspaceDiagnosticEntry): string {
    return entry.resource?.label || entry.resource?.uri || "Workspace";
  }

  function sourceLabel(entry: WorkspaceDiagnosticEntry): string {
    return entry.diagnostic.source || entry.collectionLabel;
  }

  function activateEntry(
    event: KeyboardEvent,
    entry: WorkspaceDiagnosticEntry,
  ): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    void controller.open(entry);
  }

  function activateRelated(
    event: KeyboardEvent,
    entry: WorkspaceDiagnosticEntry,
    related: WorkspaceDiagnosticRelatedInformation,
  ): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    void controller.openRelated(entry, related);
  }
</script>

<Table.Root class="ui-workspace-problems__table" aria-label="Problems table">
  <Table.Header>
    <Table.Row class="ui-workspace-problems__table-header-row">
      <Table.Head scope="col" class="ui-workspace-problems__table-code"
        >Code</Table.Head
      >
      <Table.Head scope="col" class="ui-workspace-problems__table-message"
        >Message</Table.Head
      >
      <Table.Head scope="col" class="ui-workspace-problems__table-file"
        >File</Table.Head
      >
      <Table.Head scope="col" class="ui-workspace-problems__table-source"
        >Source</Table.Head
      >
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each controller.visibleEntries as entry (entry.key)}
      {@const menu = controller.createItemMenu(entry)}
      {@const code = diagnosticCodeValue(entry.diagnostic)}
      {@const start = entry.diagnostic.range?.start}
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          {#snippet child({ props })}
            <Table.Row
              {...props}
              class="ui-workspace-problems__table-row"
              data-severity={entry.diagnostic.severity}
              data-tags={entry.diagnostic.tags?.join(" ") || undefined}
              data-navigable={controller.canNavigate(entry)}
              tabindex={0}
              aria-disabled={!controller.canNavigate(entry)}
              onclick={() => void controller.open(entry)}
              onkeydown={(event) => activateEntry(event, entry)}
            >
              <Table.Cell class="ui-workspace-problems__table-code">
                <span class="ui-workspace-problems__table-code-content">
                  <WorkspaceIcon
                    class="ui-workspace-problems__severity"
                    name={severityIcon(entry.diagnostic.severity)}
                  />
                  <span>{code ?? ""}</span>
                </span>
              </Table.Cell>
              <Table.Cell class="ui-workspace-problems__table-message">
                <span class="ui-workspace-problems__message"
                  >{entry.diagnostic.message}</span
                >
              </Table.Cell>
              <Table.Cell class="ui-workspace-problems__table-file">
                <span class="ui-workspace-problems__table-file-content">
                  <span class="ui-workspace-problems__table-resource"
                    >{resourceLabel(entry)}</span
                  >
                  {#if start}
                    <span class="ui-workspace-problems__position">
                      {positionLabel(start.line, start.character)}
                    </span>
                  {/if}
                </span>
              </Table.Cell>
              <Table.Cell class="ui-workspace-problems__table-source">
                <span class="ui-workspace-problems__source"
                  >{sourceLabel(entry)}</span
                >
              </Table.Cell>
            </Table.Row>
          {/snippet}
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content
            class="ui-workspace-menu__content"
            data-ui-component="workspace-menu"
            data-ui-part="content"
          >
            <WorkspaceContextMenuItems {menu} />
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      {#each entry.diagnostic.relatedInformation ?? [] as related, index (`${entry.key}:${related.resource.uri}:${index}`)}
        <Table.Row
          class="ui-workspace-problems__table-related-row"
          tabindex={0}
          onclick={() => void controller.openRelated(entry, related)}
          onkeydown={(event) => activateRelated(event, entry, related)}
        >
          <Table.Cell class="ui-workspace-problems__table-code">
            <WorkspaceIcon name="corner-down-right" />
          </Table.Cell>
          <Table.Cell class="ui-workspace-problems__table-message">
            <span class="ui-workspace-problems__related-message"
              >{related.message}</span
            >
          </Table.Cell>
          <Table.Cell class="ui-workspace-problems__table-file">
            <span class="ui-workspace-problems__table-file-content">
              <span class="ui-workspace-problems__table-resource">
                {related.resource.label || related.resource.uri}
              </span>
              {#if related.range}
                <span class="ui-workspace-problems__position">
                  {positionLabel(
                    related.range.start.line,
                    related.range.start.character,
                  )}
                </span>
              {/if}
            </span>
          </Table.Cell>
          <Table.Cell class="ui-workspace-problems__table-source"></Table.Cell>
        </Table.Row>
      {/each}
    {/each}
  </Table.Body>
</Table.Root>
