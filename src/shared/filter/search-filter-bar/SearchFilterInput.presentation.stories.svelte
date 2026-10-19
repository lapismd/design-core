<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Input } from "../../shadcn/input/index.js";
  import SearchFilterInput from "./SearchFilterInput.svelte";
  import type { SearchFilterSyntax } from "./search-filter-syntax.js";

  const { Story } = defineMeta({
    title: "Filter/Search Filter Bar",
    component: SearchFilterInput,
    tags: ["!autodocs"],
  });

  const themes = ["light", "dark", "custom"];
  const path =
    "Notes/projects/design-system/very-long-file-name-for-search-preview.md";
  const syntax: SearchFilterSyntax = {
    fields: [
      {
        name: "path",
        description: "Find a file in the current vault.",
        operators: [":"],
        values: [
          {
            value: path,
            apply: JSON.stringify(path),
            description:
              "A long description that wraps underneath the filename without sharing its line or overflowing the compact suggestions popup.",
          },
        ],
      },
    ],
  };
</script>

<script lang="ts">
  let query = $state("path:");
</script>

<Story
  name="Shadcn input focus parity"
  tags={["visual-pending", "test"]}
  play={async ({ canvasElement }) => {
    const view = canvasElement.ownerDocument.defaultView!;
    for (const theme of themes) {
      const scope = canvasElement.querySelector(
        `[data-theme-case="${theme}"]`,
      )!;
      const canvas = within(scope as HTMLElement);
      const reference = canvas.getByRole("textbox", {
        name: `${theme} reference`,
      });
      const restBorder = view.getComputedStyle(reference).borderTopColor;
      await userEvent.click(reference);
      await waitFor(() =>
        expect(reference.matches(":focus-visible")).toBe(true),
      );
      const referenceStyles = view.getComputedStyle(reference);
      const focusBorder = referenceStyles.borderTopColor;
      const probe = scope.ownerDocument.createElement("span");
      probe.style.backgroundColor =
        referenceStyles.getPropertyValue("--tw-ring-color");
      scope.appendChild(probe);
      const ringColor = view.getComputedStyle(probe).backgroundColor;
      probe.remove();
      for (const mode of ["plain", "custom"]) {
        const input = canvas.getByRole("searchbox", {
          name: `${theme} ${mode}`,
        });
        const pill = input.closest(".cv-search-filter-bar__search-pill")!;
        await expect(view.getComputedStyle(pill).borderTopColor).toBe(
          restBorder,
        );
        await userEvent.click(input);
        await waitFor(() => {
          const styles = view.getComputedStyle(pill);
          expect(styles.borderTopColor).toBe(focusBorder);
          expect(styles.boxShadow).toContain(ringColor);
          expect(styles.boxShadow).toContain("0px 0px 0px 3px");
        });
      }
    }
  }}
>
  {#snippet template()}
    <div style="display: grid; gap: 2rem; max-width: 30rem; padding: 1rem;">
      {#each themes as theme}
        <section
          data-theme-case={theme}
          class:dark={theme === "dark"}
          style={`display: grid; gap: 1rem; padding: 1rem; background: var(--background); color: var(--foreground); ${theme === "custom" ? "--ui-input-border-color: #777; --ui-input-focus-ring-color: #888;" : ""}`}
        >
          <h2>{theme}</h2>
          <Input aria-label={`${theme} reference`} placeholder="Shadcn input" />
          <SearchFilterInput
            ariaLabel={`${theme} plain`}
            placeholder="Plain search"
          />
          <SearchFilterInput
            ariaLabel={`${theme} custom`}
            inputMode="custom"
            placeholder="CodeMirror search"
          />
        </section>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Stacked wrapping suggestions"
  tags={["visual-pending", "test"]}
  play={async ({ canvas, canvasElement }) => {
    const input = canvas.getByRole("searchbox", { name: "Find vault files" });
    await userEvent.click(input);
    await userEvent.keyboard("{End}");
    const page = within(canvasElement.ownerDocument.body);
    const option = await page.findByRole("option", { name: new RegExp(path) });
    const view = canvasElement.ownerDocument.defaultView!;
    await waitFor(() => {
      const label = option.querySelector(".cm-completionLabel")!;
      const detail = option.querySelector(".cm-completionDetail")!;
      expect(view.getComputedStyle(option).fontFamily).not.toMatch(
        /monospace/i,
      );
      expect(detail.getBoundingClientRect().top).toBeGreaterThanOrEqual(
        label.getBoundingClientRect().bottom,
      );
      expect(detail.getBoundingClientRect().left).toBe(
        label.getBoundingClientRect().left,
      );
      expect(option.getBoundingClientRect().width).toBeLessThanOrEqual(288);
      expect(option.scrollWidth).toBeLessThanOrEqual(option.clientWidth);
    });
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      `path:${JSON.stringify(path)}`,
    );
  }}
>
  {#snippet template()}
    <div style="width: 18rem; padding: 1rem;">
      <SearchFilterInput
        value={query}
        inputMode="filter-query"
        density="compact"
        filterSyntax={syntax}
        ariaLabel="Find vault files"
        onValueChange={(value) => {
          query = value;
        }}
      />
      <output style="overflow-wrap: anywhere;">{query}</output>
    </div>
  {/snippet}
</Story>
