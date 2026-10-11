<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import XIcon from "@lucide/svelte/icons/x";
  import * as InputGroup from "./index.js";
  import { ButtonSizes } from "./InputGroupSizing.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Forms/Input Group",
    component: InputGroup.Root,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: ButtonSizes, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  let search = $state("Search text");
</script>

<Story
  name="Button sizes preserve the public contract"
  play={async ({ canvas }) => {
    const fallback = canvas.getByRole("button", { name: "Default action" });
    await expect(fallback).toHaveAttribute("data-size", "xs");
    for (const size of ["xs", "sm", "icon-xs", "icon-sm"]) {
      const button = canvas.getByRole("button", { name: `Clear ${size}` });
      await expect(button).toHaveAttribute("data-size", size);
      if (size.startsWith("icon")) {
        const bounds = button.getBoundingClientRect();
        await expect(bounds.width).toBeGreaterThan(0);
        await expect(bounds.width).toBeCloseTo(bounds.height, 1);
      }
    }
    await userEvent.click(
      canvas.getByRole("button", { name: "Clear icon-sm" }),
    );
    await expect(canvas.getByRole("textbox", { name: "Search" })).toHaveValue(
      "",
    );
  }}
>
  {#snippet template()}
    <InputGroup.Root>
      <InputGroup.Input aria-label="Search" bind:value={search} />
      <InputGroup.Addon align="inline-end">
        <InputGroup.Button aria-label="Default action"
          >Default</InputGroup.Button
        >
        {#each ["xs", "sm", "icon-xs", "icon-sm"] as size}
          <InputGroup.Button
            size={size as "xs" | "sm" | "icon-xs" | "icon-sm"}
            variant="secondary"
            aria-label={`Clear ${size}`}
            onclick={() => (search = "")}
            >{#if size.startsWith("icon")}<XIcon
                aria-hidden="true"
              />{:else}Clear{/if}</InputGroup.Button
          >
        {/each}
      </InputGroup.Addon>
    </InputGroup.Root>
  {/snippet}
</Story>
