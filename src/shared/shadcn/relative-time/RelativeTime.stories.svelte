<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import RelativeTime from "./RelativeTime.svelte";
  import { Basic } from "./RelativeTime.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data/Relative Time",
    component: RelativeTime,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Relative date with exact tooltip"
  args={{
    timestamp: "2026-10-17T12:00:00Z",
    now: Date.parse("2026-10-17T12:05:00Z"),
    locale: "en-GB",
  }}
  play={async ({ canvas }) => {
    const time = canvas.getByRole("button");
    await expect(time).toHaveAccessibleName(/5 minutes ago/);
    time.focus();
    await expect(
      await within(document.body).findByRole("tooltip"),
    ).toHaveTextContent("2026");
  }}
/>
<Story
  name="Linked relative date retains visible and custom labels"
  args={{
    timestamp: "2026-10-17T12:00:00Z",
    now: Date.parse("2026-10-17T12:05:00Z"),
    locale: "en-GB",
    href: "https://example.test/commit",
    label: "Committed by Ada",
  }}
  play={async ({ canvas }) => {
    const link = canvas.getByRole("link");
    await expect(link).toHaveAccessibleName(/5 minutes ago/);
    await expect(link).toHaveAccessibleName(/Committed by Ada/);
    await expect(link).toHaveAttribute("href", "https://example.test/commit");
  }}
/>
<Story name="Future and absolute dates"
  >{#snippet template()}<div style="display:flex;gap:1rem">
      <RelativeTime
        timestamp="2026-10-17T12:10:00Z"
        now={Date.parse("2026-10-17T12:05:00Z")}
        locale="en-GB"
      /><RelativeTime
        timestamp="2026-01-01T12:00:00Z"
        now={Date.parse("2026-10-17T12:05:00Z")}
        locale="en-GB"
      />
    </div>{/snippet}</Story
>
<Story
  name="Invalid date"
  args={{ timestamp: "invalid" }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Unknown date")).toBeVisible();
  }}
/>
