export const Basic = `<script lang="ts">
 import { AvatarGroup } from "@lapismd/design-core/shadcn/avatar";
 const people = [{id:"alex",name:"Alex Morgan"},{id:"lee",name:"Lee Taylor",shape:"rounded" as const},{id:"sam",name:"Sam Kim"}];
</script>
<AvatarGroup items={people} max={2} label="Review participants" />`;

export const Sizes = `<script lang="ts">
 import { AvatarGroup, type AvatarSize } from "@lapismd/design-core/shadcn/avatar";
 const sizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
 const people = [{id:"alex",name:"Alex Morgan",src:"/avatars/alex.png"},{id:"agent",name:"Build agent",emoji:"🐝",shape:"rounded" as const},{id:"sam",name:"Sam Kim"}];
</script>
<div style="display:grid;gap:1rem">
 {#each sizes as size}
  <div style="display:flex;align-items:center;gap:1rem">
   <span style="width:3rem;flex:none">{size}</span>
   <AvatarGroup items={people} {size} max={2} label={size + " participants"} style="min-width:0" />
  </div>
 {/each}
</div>`;

export const ReplyIndicator = `<script lang="ts">
 import { AvatarGroup } from "@lapismd/design-core/shadcn/avatar";
 import { Button } from "@lapismd/design-core/shadcn/button";
 const people = [{id:"alex",name:"Alex Morgan"},{id:"agent",name:"Build agent",emoji:"🐝",shape:"rounded" as const},{id:"sam",name:"Sam Kim"}];
 let opened = $state(false);
</script>
<div style="display:flex;align-items:center;gap:0.4rem">
 <AvatarGroup items={people} size="xs" max={2} label="Reply participants" />
 <Button variant="ghost" size="sm" onclick={() => opened = true}>
 <span>3 replies</span>
 </Button>
</div>
<p role="status">{opened ? "Reply thread opened" : ""}</p>`;

export const AuthorCards = `<script lang="ts">
 import { AvatarGroup, type AvatarIdentity, type AvatarSize } from "@lapismd/design-core/shadcn/avatar";
 import { AuthorCard } from "@lapismd/design-core/shadcn/author-card";
 import { Button } from "@lapismd/design-core/shadcn/button";
 const people = [{ id: "alex", name: "Alex Morgan", src: "/avatars/alex.png" }, { id: "agent", name: "Build agent", emoji: "🐝" }];
 let enabled = $state(true);
</script>
{#snippet participant(person: AvatarIdentity, size: AvatarSize)}
 <AuthorCard author={person} {size} description="Host-supplied participant details" actions={[{ id: "profile", label: "View profile", onSelect: (author) => { /* Navigate using author.id. */ } }]} />
{/snippet}
<AvatarGroup items={people} size="sm" label="Authors" avatar={enabled ? participant : undefined} />
<Button aria-pressed={enabled} onclick={() => enabled = !enabled}>Author cards</Button>`;
