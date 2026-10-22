<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Transcript from "./Transcript.svelte";
  import Fixture from "./Transcript.icons.stories.fixture.svelte";
  import { Basic } from "./Transcript.example-sources.js";
  const { Story } = defineMeta({
    title: "Chat/Transcript",
    component: Transcript,
    tags: ["!autodocs", "visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Filename icons retain host and status overrides"
  play={async ({ canvas, canvasElement }) => {
    for (const mode of ["Document", "Classic"]) {
      await userEvent.click(canvas.getByRole("button", { name: mode }));
      await expect(
        canvasElement.querySelector(
          "[data-block-id='note'] [data-ui-part='capture-heading'] [data-file-type-icon='markdown']",
        ),
      ).toBeVisible();
      const read = canvas.getByRole("button", {
        name: "Hide details for Read source",
      });
      await expect(
        read.querySelector("[data-file-type-icon='typescript']"),
      ).toBeVisible();
      const config = canvas.getByRole("button", {
        name: "Show captured file config/package.json",
      });
      await expect(
        config.querySelector("[data-file-type-icon='nodejs']"),
      ).toBeVisible();
      for (const title of [
        "Explicit host icon",
        "Failed read",
        "Running read",
      ]) {
        const button = canvas.getByRole("button", {
          name: `Hide details for ${title}`,
        });
        expect(
          button.querySelector("[data-ui-component='file-type-icon']"),
        ).toBeNull();
        await expect(button.querySelector("svg")).toBeVisible();
      }
    }
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
