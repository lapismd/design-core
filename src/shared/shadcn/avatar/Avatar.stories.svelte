<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import { Avatar, AvatarGroup } from "./index.js";
  import { Basic as GroupSource } from "./AvatarGroup.example-sources.js";
  import { Basic } from "./Avatar.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data/Avatar",
    component: Avatar,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Images emoji and initials"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Alex Morgan, online" }),
    ).toHaveTextContent("AM");
    await expect(
      canvas.getByRole("img", { name: "Build agent" }),
    ).toHaveTextContent("🐝");
  }}
>
  {#snippet template()}<div style="display:flex;gap:1rem;align-items:center">
      <Avatar name="Alex Morgan" presence="online" /><Avatar
        name="Build agent"
        emoji="🐝"
        shape="rounded"
      /><Avatar
        name="Design"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%235568e8' width='32' height='32'/%3E%3C/svg%3E"
        size="lg"
      /><Avatar name="Away" presence="away" size="sm" /><Avatar
        name="Busy"
        presence="busy"
        size="xl"
      />
    </div>{/snippet}
</Story>
<Story
  name="Image fallback"
  args={{
    src: "data:image/png;base64,broken",
    name: "Taylor Lee",
    shape: "rounded",
  }}
  play={async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.getByRole("img", { name: "Taylor Lee" })).toHaveTextContent(
        "TL",
      ),
    );
  }}
/>
<Story name="Decorative" args={{ emoji: "🎉", decorative: true }} />

<Story
  name="Participant groups"
  parameters={{
    docs: { source: { code: GroupSource, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Review participants" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /1 more participants/ }),
    ).toBeVisible();
  }}
  >{#snippet template()}<AvatarGroup
      items={[
        { id: "alex", name: "Alex Morgan" },
        { id: "lee", name: "Lee Taylor", shape: "rounded" },
        { id: "sam", name: "Sam Kim" },
      ]}
      max={2}
      label="Review participants"
    />{/snippet}</Story
>
