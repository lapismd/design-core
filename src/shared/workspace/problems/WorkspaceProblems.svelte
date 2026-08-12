<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import { ContextMenu } from "bits-ui";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import type { WorkspaceDiagnosticSeverity } from "./types.js";
  import type { WorkspaceProblemsController } from "./problems-controller.svelte.js";
  import { diagnosticCodeValue } from "./problems-controller.svelte.js";
  import "./WorkspaceProblems.css";

  let { controller }: { controller: WorkspaceProblemsController } = $props();

  const filters: Array<{
    severity: WorkspaceDiagnosticSeverity;
    label: string;
    icon: string;
  }> = [
    { severity: "error", label: "Errors", icon: "circle-x" },
    { severity: "warning", label: "Warnings", icon: "triangle-alert" },
    { severity: "information", label: "Information", icon: "info" },
    { severity: "hint", label: "Hints", icon: "lightbulb" },
  ];

  function positionLabel(line: number, character: number) {
    return `[Ln ${line + 1}, Col ${character + 1}]`;
  }
</script>

<section
  class="ui-workspace-problems"
  data-ui-component="workspace-problems"
  aria-label="Problems"
>
  <div class="ui-workspace-problems__toolbar" data-ui-part="toolbar">
    <div class="ui-workspace-problems__search">
      <WorkspaceIcon name="search" />
      <Input
        class="ui-workspace-problems__search-input"
        value={controller.query}
        aria-label="Filter problems"
        placeholder="Filter problems"
        oninput={(event) =>
          controller.setQuery((event.currentTarget as HTMLInputElement).value)}
      />
    </div>
    <div class="ui-workspace-problems__filters" aria-label="Severity filters">
      {#each filters as filter (filter.severity)}
        <Button
          variant="ghost"
          size="xs"
          class="ui-workspace-problems__filter"
          data-severity={filter.severity}
          aria-label={`${filter.label}: ${controller.counts[filter.severity]}`}
          aria-pressed={controller.isSeverityEnabled(filter.severity)}
          onclick={() => controller.toggleSeverity(filter.severity)}
        >
          <WorkspaceIcon name={filter.icon} />
          <span>{controller.counts[filter.severity]}</span>
        </Button>
      {/each}
      <Button
        variant="ghost"
        size="icon-xs"
        class="ui-workspace-problems__collapse-all"
        aria-label="Collapse all problem groups"
        onclick={() => controller.collapseAll()}
      >
        <WorkspaceIcon name="chevrons-down-up" />
      </Button>
    </div>
  </div>

  <ScrollArea class="ui-workspace-problems__scroll">
    <div class="ui-workspace-problems__body" data-ui-part="body">
      {#if controller.groups.length === 0}
        <div class="ui-workspace-problems__empty" data-ui-part="empty">
          <WorkspaceIcon name="circle-check" />
          <span
            >{controller.diagnostics.size === 0
              ? "No problems detected"
              : "No matching problems"}</span
          >
        </div>
      {:else}
        <ul class="ui-workspace-problems__groups">
          {#each controller.groups as group (group.key)}
            <li class="ui-workspace-problems__group" data-resource={group.key}>
              <button
                type="button"
                class="ui-workspace-problems__group-trigger"
                aria-expanded={!controller.isGroupCollapsed(group.key)}
                onclick={() => controller.toggleGroup(group.key)}
              >
                <WorkspaceIcon
                  name={controller.isGroupCollapsed(group.key)
                    ? "chevron-right"
                    : "chevron-down"}
                />
                <WorkspaceIcon
                  name={group.icon ||
                    (group.resource ? "file" : "layout-dashboard")}
                />
                <span class="ui-workspace-problems__group-label"
                  >{group.label}</span
                >
                {#if group.detail}
                  <span class="ui-workspace-problems__group-detail"
                    >{group.detail}</span
                  >
                {/if}
                <span class="ui-workspace-problems__group-count"
                  >{group.entries.length}</span
                >
              </button>

              {#if !controller.isGroupCollapsed(group.key)}
                <ul class="ui-workspace-problems__entries">
                  {#each group.entries as entry (entry.key)}
                    {@const menu = controller.createItemMenu(entry)}
                    {@const code = diagnosticCodeValue(entry.diagnostic)}
                    {@const start = entry.diagnostic.range?.start}
                    <li
                      class="ui-workspace-problems__entry"
                      data-severity={entry.diagnostic.severity}
                      data-tags={entry.diagnostic.tags?.join(" ") || undefined}
                    >
                      <ContextMenu.Root>
                        <ContextMenu.Trigger>
                          {#snippet child({ props })}
                            <button
                              {...props}
                              type="button"
                              class="ui-workspace-problems__row"
                              disabled={!controller.canNavigate(entry)}
                              onclick={() => void controller.open(entry)}
                            >
                              <WorkspaceIcon
                                class="ui-workspace-problems__severity"
                                name={filters.find(
                                  (filter) =>
                                    filter.severity ===
                                    entry.diagnostic.severity,
                                )?.icon}
                              />
                              <span class="ui-workspace-problems__message">
                                {entry.diagnostic.message}
                              </span>
                              {#if entry.diagnostic.source || code}
                                <span class="ui-workspace-problems__source">
                                  {entry.diagnostic.source ||
                                    entry.collectionLabel}{code
                                    ? `(${code})`
                                    : ""}
                                </span>
                              {/if}
                              {#if start}
                                <span class="ui-workspace-problems__position">
                                  {positionLabel(start.line, start.character)}
                                </span>
                              {/if}
                            </button>
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

                      {#if entry.diagnostic.relatedInformation?.length}
                        <ul
                          class="ui-workspace-problems__related"
                          aria-label="Related information"
                        >
                          {#each entry.diagnostic.relatedInformation as related, index (`${entry.key}:${related.resource.uri}:${index}`)}
                            <li>
                              <button
                                type="button"
                                class="ui-workspace-problems__related-row"
                                onclick={() =>
                                  void controller.openRelated(entry, related)}
                              >
                                <WorkspaceIcon name="corner-down-right" />
                                <span
                                  class="ui-workspace-problems__related-message"
                                  >{related.message}</span
                                >
                                <span
                                  class="ui-workspace-problems__related-resource"
                                >
                                  {related.resource.label ||
                                    related.resource.uri}
                                  {#if related.range}
                                    {positionLabel(
                                      related.range.start.line,
                                      related.range.start.character,
                                    )}
                                  {/if}
                                </span>
                              </button>
                            </li>
                          {/each}
                        </ul>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </ScrollArea>
</section>
