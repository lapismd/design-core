<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import RadioGroup from "./radio-group.svelte";
  import Fixture from "./RadioGroup.stories.fixture.svelte";
  import { Basic } from "./RadioGroup.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Forms/Radio Group",
    component: RadioGroup,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Keyboard selection"
  play={async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("radio", { name: "production" }));
    await expect(c.getByRole("status")).toHaveTextContent("production");
    await userEvent.keyboard("{ArrowUp}");
    await expect(c.getByRole("radio", { name: "staging" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(c.getByRole("radio", { name: "production" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  }}><Fixture /></Story
>
<Story
  name="Disabled"
  play={async ({ canvasElement }) => {
    for (const radio of within(canvasElement).getAllByRole("radio"))
      await expect(radio).toBeDisabled();
  }}><Fixture disabled /></Story
>
<Story name="Invalid"><Fixture invalid /></Story>
