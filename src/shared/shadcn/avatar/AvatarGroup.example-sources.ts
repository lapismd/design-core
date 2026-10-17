export const Basic = `<script lang="ts">
 import { AvatarGroup } from "@lapismd/design-core/shadcn/avatar";
 const people = [{id:"alex",name:"Alex Morgan"},{id:"lee",name:"Lee Taylor",shape:"rounded" as const},{id:"sam",name:"Sam Kim"}];
</script>
<AvatarGroup items={people} max={2} label="Review participants" />`;
