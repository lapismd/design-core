<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, fn } from "storybook/test";
  import Component from "./ContentViewToggle.svelte";
  import { Basic } from "./ContentViewToggle.example-sources.js";
  const { Story } = defineMeta({
    title: "AI/Chat/Content View Toggle",
    component: Component,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
    args: { onViewChange: fn() },
  });
</script>

<Story
  name="Formatted and source"
  play={async ({ canvas, args }) => {
    const button = canvas.getByRole("button", { name: "Show source" });
    expect(button).toHaveTextContent("");
    await userEvent.click(button);
    expect(args.onViewChange).toHaveBeenCalledWith("source");
    expect(
      canvas.getByRole("button", { name: "Show formatted output" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
    expect(args.onViewChange).toHaveBeenLastCalledWith("formatted");
    expect(canvas.getByRole("button", { name: "Show source" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  }}
/>
<Story
  name="Raw capture labels"
  args={{ sourceLabel: "Show raw capture", formattedLabel: "Show preview" }}
/>
<Story
  name="Disabled"
  args={{ disabled: true }}
  play={async ({ canvas }) => {
    expect(canvas.getByRole("button", { name: "Show source" })).toBeDisabled();
  }}
/>
