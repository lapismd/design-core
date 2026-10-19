<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import Fixture from "./Transcript.tools.stories.fixture.svelte";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["visual-pending", "!autodocs"],
  });
</script>

<Story
  name="Opens initially collapsed groups"
  play={async ({ canvas }) => {
    for (const mode of ["Document", "Classic"]) {
      await userEvent.click(
        canvas.getByRole("button", { name: new RegExp(`^${mode}$`) }),
      );
      await userEvent.click(
        canvas.getByRole("button", { name: "Expand Tool activity" }),
      );
      const read = await canvas.findByRole("button", {
        name: "Show details for Read source",
      });
      await expect(
        canvas.getByRole("button", { name: "Show details for Update note" }),
      ).toBeVisible();
      await userEvent.click(read);
      await expect(
        canvas.findByText("A captured file read"),
      ).resolves.toBeVisible();
      await userEvent.click(
        canvas.getByRole("button", { name: "Hide details for Read source" }),
      );
      await userEvent.click(
        canvas.getByRole("button", { name: "Collapse Tool activity" }),
      );
      await expect(
        canvas.queryByRole("button", { name: "Show details for Read source" }),
      ).toBeNull();
    }
  }}
>
  {#snippet template()}<Fixture />{/snippet}
</Story>

<Story
  name="Opens a group after a second tool arrives"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Show details for Read source" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Append captured tool" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Append captured tool" }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "Expand Tool activity" }),
    );
    await expect(
      canvas.findByRole("button", { name: "Show details for Read source" }),
    ).resolves.toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Show details for Update note" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}<Fixture dynamic />{/snippet}
</Story>
