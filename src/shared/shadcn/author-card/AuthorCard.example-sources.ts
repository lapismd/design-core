export const Basic = `<script lang="ts">
 import { AuthorCard } from "@lapismd/design-core/shadcn/author-card";
 const author = { id: "alex", name: "Alex Morgan", initials: "AM" };
</script>
<AuthorCard {author} interaction="popover" description="Designer" actions={[{ id: "message", label: "Message", onSelect: (person) => console.log(person.id) }]} />`;
