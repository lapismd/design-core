<script lang="ts">
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import type { AppShellSide } from "../app-shell-controller.svelte.js";
  import { AppShell } from "../index.js";

  let {
    file,
    sidebarSide,
    onToggleSidebar,
  }: {
    file: string;
    sidebarSide?: AppShellSide;
    onToggleSidebar: (side: AppShellSide) => void;
  } = $props();

  const sections = [
    "Overview",
    "Installation",
    "Project structure",
    "Shell composition",
    "Body regions",
    "Table of contents",
    "Scrolling",
    "Accessibility",
    "Styling tokens",
    "Consumer state",
    "Testing",
    "Deployment",
  ];
</script>

{#snippet tableOfContents()}
  <nav class="ui-shell-story-document-toc" aria-label="Document sections">
    <span>On this page</span>
    {#each sections as section, index}
      <a
        href={`#shell-document-section-${index}`}
        aria-current={index === 0 ? "location" : undefined}
      >
        {section}
      </a>
    {/each}
  </nav>
{/snippet}

<AppShell.Body layout="regions" label="Markdown document">
  <AppShell.Body.Toggle
    side="left"
    target="document-table-of-contents"
    pressed={sidebarSide === "left"}
    label={sidebarSide === "left"
      ? "Hide table of contents on left"
      : "Show table of contents on left"}
    onclick={() => onToggleSidebar("left")}
  />
  <AppShell.Body.Toggle
    side="right"
    target="document-table-of-contents"
    pressed={sidebarSide === "right"}
    label={sidebarSide === "right"
      ? "Hide table of contents on right"
      : "Show table of contents on right"}
    onclick={() => onToggleSidebar("right")}
  />

  <AppShell.Body.Sidebar
    panelId="document-table-of-contents"
    side={sidebarSide ?? "right"}
    open={sidebarSide !== undefined}
    label="Table of contents"
    mobileLabel="Document contents"
  >
    {@render tableOfContents()}
  </AppShell.Body.Sidebar>

  <AppShell.Body.Content label={file ? `${file} content` : "Document content"}>
    {#if file}
      <article class="ui-shell-story-document">
        <header>
          <span>Markdown document</span>
          <h2>{file}</h2>
          <p>
            Body sidebars are local to the document surface, so outer project
            and file navigation keep their own independent geometry.
          </p>
        </header>

        {#each sections as section, index}
          <section id={`shell-document-section-${index}`}>
            <h3>{section}</h3>
            <p>
              This section demonstrates independently scrolling document
              content. The shell owns the bounded regions while the application
              decides when the table of contents is present and which side it
              occupies.
            </p>
            <p>
              Markdown rendering, selection, routing, and document state remain
              consumer-owned.
            </p>
          </section>
        {/each}
      </article>
    {:else}
      <div class="ui-shell-story-document-empty">
        <FileTextIcon aria-hidden="true" />
        <strong>Select a Markdown file</strong>
        <span>Its table of contents can open on either side of the body.</span>
      </div>
    {/if}
  </AppShell.Body.Content>
</AppShell.Body>
