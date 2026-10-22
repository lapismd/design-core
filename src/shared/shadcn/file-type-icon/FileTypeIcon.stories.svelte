<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FileTypeIcon from "./FileTypeIcon.svelte";
  import Fixture from "./FileTypeIcon.stories.fixture.svelte";
  import { commonFilePaths } from "./FileTypeIcon.stories.data.js";
  import {
    Basic,
    Named,
    Styling,
    Sizes,
    Reactive,
  } from "./FileTypeIcon.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data/File Type Icon",
    component: FileTypeIcon,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  let path = $state("src/main.ts");
</script>

<Story
  name="File type gallery"
  play={async ({ canvasElement, canvas }) => {
    await expect(
      canvasElement.querySelectorAll("[data-ui-component='file-type-icon']"),
    ).toHaveLength(commonFilePaths.length);
    await expect(canvas.queryByRole("img")).toBeNull();
    await expect(
      canvasElement.querySelector("[data-file-type-icon='nodejs']"),
    ).toBeVisible();
    await expect(
      canvasElement.querySelector("[data-file-type-icon='docker']"),
    ).toBeVisible();
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>

<Story
  name="Sizes"
  parameters={{
    docs: {
      source: { code: Sizes + "\n\n" + Styling, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvasElement }) => {
    for (const size of [12, 14, 16, 20, 24]) {
      const icons = canvasElement.querySelectorAll<HTMLElement>(
        `[data-size='${size}'] [data-ui-component='file-type-icon']`,
      );
      await expect(icons).toHaveLength(3);
      for (const icon of icons) {
        expect(icon.getBoundingClientRect().width).toBe(size);
        expect(icon.getBoundingClientRect().height).toBe(size);
      }
    }
  }}>{#snippet template()}<Fixture sizes />{/snippet}</Story
>

<Story
  name="Named icon"
  args={{ path: "containers/Dockerfile", title: "Docker configuration" }}
  parameters={{
    docs: { source: { code: Named, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Docker configuration" }),
    ).toHaveAttribute("data-file-type-icon", "docker");
  }}
/>

<Story
  name="Reactive filename"
  parameters={{
    docs: { source: { code: Reactive, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Filename" });
    const icon = canvas.getByRole("img", { name: "Selected file type" });
    await expect(icon).toHaveAttribute("data-file-type-icon", "typescript");
    await userEvent.clear(input);
    await userEvent.type(input, "config/package.json");
    await expect(icon).toHaveAttribute("data-file-type-icon", "nodejs");
    await userEvent.clear(input);
    await expect(icon).toHaveAttribute("data-file-type-icon", "file");
  }}
  >{#snippet template()}<div
      style="display:flex;align-items:center;gap:1rem;padding:1rem"
    >
      <label>Filename <input bind:value={path} /></label><FileTypeIcon
        {path}
        title="Selected file type"
      />
    </div>{/snippet}</Story
>
