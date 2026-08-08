<script lang="ts">
  import type { AppShellApplicationInfo } from "../core/types.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceAboutDialog.css";

  let {
    info,
    open = $bindable(false),
    onOpenChange,
    onCopyResult,
  }: {
    info: AppShellApplicationInfo;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onCopyResult?: (success: boolean, value: "version" | "commit") => void;
  } = $props();

  let shortCommit = $derived(info.commitHash?.trim().slice(0, 7) ?? "");
  let formattedBuildTime = $derived(formatBuildTime(info.buildTime));

  function formatBuildTime(value: string | null | undefined): string | null {
    if (!value) return null;
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return null;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));
  }

  function setOpen(next: boolean): void {
    open = next;
    onOpenChange?.(next);
  }

  async function copy(
    value: string,
    kind: "version" | "commit",
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      onCopyResult?.(true, kind);
    } catch {
      onCopyResult?.(false, kind);
    }
  }
</script>

{#if open}
  <div
    class="ui-workspace-about"
    data-ui-component="workspace-about-dialog"
    data-ui-part="overlay"
    role="presentation"
    onclick={(event) => {
      if (event.currentTarget === event.target) setOpen(false);
    }}
  >
    <div
      class="ui-workspace-about__dialog"
      data-ui-part="dialog"
      data-workspace-about
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="ui-workspace-about-title"
      onkeydown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div class="ui-workspace-about__logo">
        {#if info.logoUrl}
          <img src={info.logoUrl} alt={info.name} />
        {:else}
          <WorkspaceIcon name={info.icon ?? "info"} />
        {/if}
      </div>
      <h2 id="ui-workspace-about-title">{info.name}</h2>
      <p>Version {info.version}</p>
      {#if formattedBuildTime}<p>Built {formattedBuildTime}</p>{/if}
      {#if shortCommit}
        <button
          type="button"
          class="ui-workspace-about__commit"
          aria-label={`Copy commit ${shortCommit}`}
          onclick={() => void copy(info.commitHash ?? "", "commit")}
        >
          {shortCommit}
          <WorkspaceIcon name="copy" />
        </button>
      {/if}
      {#if info.copyright}
        <p class="ui-workspace-about__copyright">{info.copyright}</p>
      {/if}
      <div class="ui-workspace-about__actions">
        <button
          type="button"
          data-variant="secondary"
          onclick={() => setOpen(false)}
        >
          OK
        </button>
        <button
          type="button"
          data-variant="secondary"
          onclick={() => void copy(info.version, "version")}
        >
          Copy
        </button>
      </div>
    </div>
  </div>
{/if}
