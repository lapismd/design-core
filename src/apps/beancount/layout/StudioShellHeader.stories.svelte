<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import StudioShellHeader from "./StudioShellHeader.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Layout/Studio Shell Header",
    component: StudioShellHeader,
    parameters: {
      docs: {
        description: {
          component:
            "The shared project identity header for a Studio-style sidebar. Keep routing and workspace state in the application: pass the selected project, controlled settings state, and callbacks into this visual component. See [Layout guidance](?path=/docs/apps-beancount-layout-guidance--docs) for shell composition.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let settingsOpen = $state(false);
</script>

<Story
  name="Reflects the controlled settings state"
  play={async ({ canvas }) => {
    const settings = canvas.getByRole("button", { name: "Ledger settings" });
    await expect(settings).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(settings);
    await expect(settings).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Ledger settings open",
    );
  }}
>
  {#snippet template()}
    <div class="bc-studio-shell-header-story">
      <StudioShellHeader
        projectName="northstar-ledger"
        {settingsOpen}
        showCloseSidebar={false}
        onOpenLedgerSettings={() => {
          settingsOpen = !settingsOpen;
        }}
      />
      <output class="bc-studio-shell-header-story__status">
        Ledger settings {settingsOpen ? "open" : "closed"}
      </output>
    </div>
  {/snippet}
</Story>

<style>
  .bc-studio-shell-header-story {
    max-width: 24rem;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-sidebar);
    color: var(--ui-beancount-sidebar-foreground);
    padding: var(--ui-beancount-space-3);
  }

  .bc-studio-shell-header-story__status {
    display: block;
    margin-block-start: var(--ui-beancount-space-3);
    font-size: var(--text-sm);
  }
</style>
