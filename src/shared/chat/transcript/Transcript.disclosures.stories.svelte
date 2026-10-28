<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import Fixture from "./Transcript.disclosures.stories.fixture.svelte";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["!autodocs", "visual-pending"],
  });
  async function verify({ canvas }: { canvas: ReturnType<typeof within> }) {
    const row = canvas.getByRole("button", {
      name: "Permission denied: Read notes",
    });
    const neutral = canvas.getByRole("button", { name: "Captured context" });
    expect(getComputedStyle(row).color).not.toBe(
      getComputedStyle(neutral).color,
    );
    expect(getComputedStyle(row.querySelector("svg")!).color).toBe(
      getComputedStyle(row).color,
    );
    expect(
      parseFloat(getComputedStyle(row.closest("li")!).marginBottom),
    ).toBeLessThanOrEqual(4);
    await userEvent.click(row);
    await expect(
      canvas.getByText("Captured permission outcome."),
    ).toBeVisible();
  }
</script>

<Story name="Destructive disclosure" play={verify}
  >{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Destructive disclosure dark"
  globals={{ colorMode: "dark", theme: "lapis" }}
  play={verify}>{#snippet template()}<Fixture />{/snippet}</Story
>
