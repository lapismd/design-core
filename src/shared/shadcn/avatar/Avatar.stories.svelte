<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import {
    Avatar,
    AvatarGroup,
    type AvatarIdentity,
    type AvatarSize,
  } from "./index.js";
  import { AuthorCard } from "../author-card/index.js";
  import { Button } from "../button/index.js";
  import {
    Basic as GroupSource,
    Sizes as GroupSizesSource,
    ReplyIndicator,
    AuthorCards,
  } from "./AvatarGroup.example-sources.js";
  import { Basic, Contrast } from "./Avatar.example-sources.js";
  const groupSizes = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
  const groupPeople = [
    {
      id: "alex",
      name: "Alex Morgan",
      src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect fill='%235568e8' width='32' height='32'/%3E%3Ctext x='16' y='23' text-anchor='middle' fill='white' font-size='22'%3EA%3C/text%3E%3C/svg%3E",
    },
    {
      id: "agent",
      name: "Build agent",
      emoji: "🐝",
      shape: "rounded" as const,
    },
    { id: "sam", name: "Sam Kim" },
  ];
  const { Story } = defineMeta({
    title: "Shadcn/Data/Avatar",
    component: Avatar,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<script lang="ts">
  let repliesOpened = $state(false);
  let showAuthorCards = $state(true);
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
  name="Custom background contrast"
  parameters={{
    docs: { source: { code: Contrast, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    for (const [name, expected] of [
      ["Purple profile", "rgb(255, 255, 255)"],
      ["Light profile", "rgb(0, 0, 0)"],
      ["Dark profile", "rgb(255, 255, 255)"],
      ["Host foreground", "rgb(255, 255, 0)"],
    ]) {
      const content = canvas
        .getByRole("img", { name })
        .querySelector('[data-ui-part="content"]')!;
      expect(getComputedStyle(content).color).toBe(expected);
    }
  }}
>
  {#snippet template()}
    <div style="display:flex;gap:1rem;align-items:center">
      <Avatar name="Purple profile" background="#6e56cf" size="sm" />
      <Avatar name="Light profile" background="#ffffff" size="sm" />
      <Avatar name="Dark profile" background="#000000" size="2xl" />
      <Avatar
        name="Host foreground"
        background="#000"
        style="--ui-avatar-foreground:#ffff00"
      />
    </div>
  {/snippet}
</Story>

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

<Story
  name="Participant group sizes"
  parameters={{
    docs: { source: { code: GroupSizesSource, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    for (const size of groupSizes) {
      const group = canvas.getByRole("group", { name: `${size} participants` });
      await expect(group).toHaveAttribute("data-size", size);
      await expect(
        group.querySelectorAll('[data-ui-component="avatar"]'),
      ).toHaveLength(2);
      await expect(
        group.querySelector(".ui-avatar-group__overflow"),
      ).toHaveTextContent("+1");
    }
  }}
>
  {#snippet template()}<div style="display:grid;gap:1rem">
      {#each groupSizes as size}
        <div style="display:flex;gap:1rem;align-items:center">
          <span style="width:3rem;flex:none">{size}</span>
          <AvatarGroup
            items={groupPeople}
            {size}
            max={2}
            label={`${size} participants`}
            style="min-width:0"
          />
        </div>
      {/each}
    </div>{/snippet}
</Story>

<Story
  name="Compact reply indicator"
  parameters={{
    docs: { source: { code: ReplyIndicator, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const replies = canvas.getByRole("button", { name: "3 replies" });
    await expect(replies.querySelector("button")).toBeNull();
    await expect(
      canvas.getByRole("group", { name: "Reply participants" }),
    ).toHaveAttribute("data-size", "xs");
    await expect(
      replies.querySelector('[data-ui-component="avatar-group"]'),
    ).toBeNull();
    await userEvent.click(replies);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Reply thread opened",
    );
  }}
>
  {#snippet template()}<div style="display:flex;align-items:center;gap:0.4rem">
      <AvatarGroup
        items={groupPeople}
        size="xs"
        max={2}
        label="Reply participants"
      />
      <Button variant="ghost" size="sm" onclick={() => (repliesOpened = true)}>
        <span>3 replies</span>
      </Button>
    </div>
    <p role="status">{repliesOpened ? "Reply thread opened" : ""}</p>{/snippet}
</Story>

<Story
  name="Author card participants"
  parameters={{
    docs: { source: { code: AuthorCards, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "About Alex Morgan, AM" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Author cards" }));
    await expect(
      canvas.getByRole("button", { name: "Alex Morgan: AM" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Author cards" }));
    await expect(
      canvas.getByRole("button", { name: "About Alex Morgan, AM" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    {#snippet member(person: AvatarIdentity, size: AvatarSize)}<AuthorCard
        author={person}
        {size}
        description="Host-supplied participant details"
      />{/snippet}
    <div style="display:flex;align-items:center;gap:1rem">
      <AvatarGroup
        items={groupPeople}
        size="sm"
        max={2}
        label="Authors"
        avatar={showAuthorCards ? member : undefined}
      />
      <Button
        variant="outline"
        aria-pressed={showAuthorCards}
        onclick={() => (showAuthorCards = !showAuthorCards)}
        >Author cards</Button
      >
    </div>
  {/snippet}
</Story>
