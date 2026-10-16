<script lang="ts">
  import { Avatar } from "../../shadcn/avatar/index.js";
  import type { TranscriptAuthor } from "./model.js";
  let {
    member,
    size = "xsmall",
    decorative = true,
  }: {
    member: TranscriptAuthor;
    size?: string;
    decorative?: boolean;
  } = $props();
</script>

<Avatar
  name={member.name}
  {...member.initials === undefined ? {} : { initials: member.initials }}
  {...member.image === undefined ? {} : { src: member.image }}
  {...member.emoji === undefined ? {} : { emoji: member.emoji }}
  shape={member.shape ?? "circle"}
  {...member.background === undefined ? {} : { background: member.background }}
  {decorative}
  style={`--ui-avatar-size: ${size === "inline" ? "1rem" : "1.5rem"}`}
/>
