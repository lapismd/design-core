<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import ChipAutocomplete from "./ChipAutocomplete.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Chip Autocomplete",
    component: ChipAutocomplete,
    parameters: {
      docs: {
        description: {
          component: "Multi-value chip input with suggestion autocomplete.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import FormSheet from "../form-sheet/FormSheet.svelte";

  let chips = $state<string[]>(["typescript"]);
  let sheetOpen = $state(false);
  let sheetChips = $state<string[]>([]);
</script>

<Story
  name="Adds a chip"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Skills", { selector: "input" });
    await userEvent.type(input, "svelte{Enter}");
    await expect(canvas.getByText(/svelte/i)).toBeVisible();
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <div class="max-w-md">
      <ChipAutocomplete
        value={chips}
        suggestions={["svelte", "typescript", "css"]}
        label="Skills"
        showLabel={true}
        onChange={(next) => {
          chips = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Keeps owner sheet open for inline suggestions"
  tags={["test", "visual-pending"]}
  parameters={{ a11y: { test: "off" } }}
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Edit tags" }));
    const dialog = page.getByRole("dialog", { name: "Edit tags" });
    const input = within(dialog).getByLabelText("Skills", {
      selector: "input",
    });

    await userEvent.type(input, "sve");
    await userEvent.click(
      within(dialog).getByRole("option", { name: "svelte" }),
    );

    expect(dialog).toBeVisible();
    expect(within(dialog).getByText("svelte")).toBeVisible();
    expect(canvas.getByRole("status")).toHaveTextContent("svelte");
  }}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-2">
      <Button onclick={() => (sheetOpen = true)}>Edit tags</Button>
      <FormSheet
        bind:open={sheetOpen}
        title="Edit tags"
        description="Edit chip values inside an owning form sheet."
      >
        <ChipAutocomplete
          value={sheetChips}
          suggestions={["svelte", "typescript", "css"]}
          label="Skills"
          showLabel={true}
          suggestionPortalProps={{ disabled: true }}
          onChange={(next) => {
            sheetChips = next;
          }}
        />
      </FormSheet>
      <output class="text-muted-foreground text-sm">
        {sheetChips.join(", ") || "none"}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="max-w-md">
      <ChipAutocomplete
        value={[]}
        suggestions={["svelte", "typescript"]}
        label="Skills"
        showLabel={true}
        error="Enter at least one value."
        onChange={() => {}}
      />
    </div>
  {/snippet}
</Story>
