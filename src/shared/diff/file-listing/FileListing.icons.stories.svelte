<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import FileListing from "./FileListing.svelte";
  import { Basic, CommonFileTypes } from "./FileListing.example-sources.js";
  import { commonFilePaths } from "../../shadcn/file-type-icon/FileTypeIcon.stories.data.js";
  const { Story } = defineMeta({
    title: "Diff/File Listing",
    component: FileListing,
    tags: ["!autodocs", "visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
  const files = [
    { path: "src/main.ts", additions: 2 },
    { path: "config/package.json" },
    { path: "containers/Dockerfile" },
    { path: "assets/unknown.zzz" },
  ];
</script>

<Story
  name="Common file types"
  parameters={{
    docs: { source: { code: CommonFileTypes, language: "tsx", type: "code" } },
  }}
  play={async ({ canvasElement, canvas }) => {
    const listing = canvas.getByRole("region", {
      name: "Common developer and notes files",
    });
    await expect(
      listing.querySelectorAll("[data-ui-component='file-type-icon']"),
    ).toHaveLength(commonFilePaths.length);
    for (const name of [
      "pdf",
      "word",
      "table",
      "powerpoint",
      "audio",
      "video",
      "drawio",
      "jupyter",
      "document",
      "file",
    ])
      await expect(
        canvasElement.querySelector(`[data-file-type-icon='${name}']`),
      ).toBeInTheDocument();
    expect(
      parseFloat(getComputedStyle(listing).paddingTop),
    ).toBeGreaterThanOrEqual(12);
  }}
>
  {#snippet template()}
    <div style="padding:1rem">
      <section
        aria-label="Common developer and notes files"
        style="max-height:36rem;overflow:auto;border:1px solid var(--border);border-radius:var(--radius);padding:1rem"
      >
        <FileListing
          files={commonFilePaths.map((path) => ({ path }))}
          mode="list"
        />
      </section>
    </div>
  {/snippet}
</Story>

<Story
  name="Material file type icons"
  play={async ({ canvas }) => {
    for (const mode of ["list", "tree", "package"]) {
      for (const virtual of [false, true]) {
        const region = canvas.getByRole("region", {
          name: `${mode} ${virtual}`,
        });
        const scope = within(region);
        expect(
          parseFloat(getComputedStyle(region).paddingTop),
        ).toBeGreaterThanOrEqual(12);
        expect(
          parseFloat(getComputedStyle(region).paddingInlineStart),
        ).toBeGreaterThanOrEqual(12);
        for (const [path, name] of [
          ["src/main.ts", "typescript"],
          ["config/package.json", "nodejs"],
          ["containers/Dockerfile", "docker"],
          ["assets/unknown.zzz", "file"],
        ]) {
          await waitFor(() => {
            const row = scope.getByRole("button", {
              name: new RegExp(
                `^${path.replaceAll(".", "\\.")}(?: \\+[0-9]+)?$`,
              ),
            });
            const icon = row.querySelector<HTMLElement>(
              "[data-ui-component='file-type-icon']",
            );
            expect(icon).toHaveAttribute("data-file-type-icon", name);
            expect(icon).toHaveAttribute("aria-hidden", "true");
            expect(icon!.getBoundingClientRect().width).toBe(14);
            expect(icon!.getBoundingClientRect().height).toBe(14);
          });
        }
        const selected = scope.getByRole("button", { name: "src/main.ts +2" });
        await userEvent.click(selected);
        await expect(selected).toHaveAttribute("aria-current", "true");
        await expect(
          selected.querySelector("[data-file-type-icon='typescript']"),
        ).toBeVisible();
      }
    }
  }}
>
  {#snippet template()}
    <div style="display:grid;gap:1rem;padding:1rem">
      {#each ["list", "tree", "package"] as mode}
        {#each [false, true] as virtualize}
          <section
            aria-label={`${mode} ${virtualize}`}
            style="height:260px;overflow:auto;border:1px solid var(--border);border-radius:var(--radius);padding:1rem"
          >
            <FileListing
              {files}
              mode={mode as "list" | "tree" | "package"}
              {virtualize}
            />
          </section>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>
