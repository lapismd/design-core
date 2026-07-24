<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import AutocompleteInput from "./AutocompleteInput.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Autocomplete Input",
    component: AutocompleteInput,
    parameters: {
      docs: {
        description: {
          component: "Text input with suggestion list for free-form values.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("");
  let committed = $state("");
</script>

<Story
  name="Commits a suggestion"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Skill");
    await userEvent.type(input, "typescript{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("typescript");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/forms/autocomplete-input/commits-a-suggestion-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <AutocompleteInput
        bind:value
        suggestions={["typescript", "typography"]}
        ariaLabel="Skill"
        onCommit={(next) => {
          committed = next;
          value = "";
        }}
      />
      <output class="text-muted-foreground text-sm"
        >{committed || "none"}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Open list active and hover"
  tags={["visual-state", "visual-failed"]}
  play={async ({ canvas, canvasElement }) => {
    // Suggestions portal into document.body via shadcn Popover.
    const options = within(canvasElement.ownerDocument.body).getAllByRole(
      "option",
    );
    await expect(options.length).toBeGreaterThanOrEqual(2);
    await expect(options[0]).toHaveAttribute("aria-selected", "true");
    await expect(options[1]!).toBeVisible();
    // Pointer hover still exercised; row style also forced via forceHoverIndex
    // so the baseline stays stable after the visual suite blurs focus.
    await userEvent.hover(options[1]!);
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/forms/autocomplete-input/open-list-active-and-hover-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="flex min-h-52 max-w-sm flex-col gap-2 p-4">
      <AutocompleteInput
        value="t"
        forceOpen
        forceHoverIndex={1}
        suggestions={["typescript", "testing", "typography", "svelte"]}
        placeholder="Search..."
        ariaLabel="Skill search"
      />
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2 p-4">
      <AutocompleteInput
        value=""
        suggestions={["typescript", "svelte"]}
        ariaLabel="Skill"
        error="This field is required."
      />
    </div>
  {/snippet}
</Story>
