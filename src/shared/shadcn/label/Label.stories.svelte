<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Label } from "./index.js";
  import { Input } from "../input/index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Label",
    component: Label,
    parameters: {
      docs: {
        description: {
          component: "Accessible label for form controls.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("");
</script>

<Story
  name="Associates with an input"
  play={async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText("Email"), "a@b.co");
    await expect(canvas.getByRole("status")).toHaveTextContent("a@b.co");
  }}
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/label/associates-with-an-input-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <Label for="catalog-email">Email</Label>
      <Input id="catalog-email" bind:value />
      <output class="text-muted-foreground text-sm">{value || "empty"}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Disabled controls without marker classes"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByText("Disabled group")).opacity,
    ).toBe("0.5");
    await expect(
      getComputedStyle(canvas.getByText("Disabled input")).opacity,
    ).toBe("0.5");
    await expect(
      getComputedStyle(canvas.getByText("Enabled input")).opacity,
    ).toBe("1");
    await userEvent.click(canvas.getByText("Enabled input"));
    await expect(canvas.getByLabelText("Enabled input")).toHaveFocus();
  }}
>
  {#snippet template()}
    <div data-disabled="true">
      <Label for="disabled-group">Disabled group</Label><Input
        id="disabled-group"
        disabled
      />
    </div>
    <div>
      <Input id="disabled-peer" disabled /><Label for="disabled-peer"
        >Disabled input</Label
      >
    </div>
    <div>
      <Input id="enabled-peer" /><Label for="enabled-peer">Enabled input</Label>
    </div>
  {/snippet}
</Story>
