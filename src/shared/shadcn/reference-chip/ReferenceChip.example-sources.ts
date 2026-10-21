export const Basic = `<script lang="ts">
 import { ReferenceChip } from "@lapismd/design-core/shadcn/reference-chip";
 import FileIcon from "@lucide/svelte/icons/file-text";
</script>
<ReferenceChip label="Design brief" icon={FileIcon} description="Open the latest brief" onClick={() => console.log("open")} />
<ReferenceChip label="Selected context" onRemove={() => console.log("remove")} />`;
