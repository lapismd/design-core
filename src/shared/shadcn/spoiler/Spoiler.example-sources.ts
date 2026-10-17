export const Basic = `<script lang="ts">
 import { Spoiler } from "@lapismd/design-core/shadcn/spoiler";
 let revealed = $state(false);
</script>
The answer is <Spoiler bind:revealed label="the answer">forty-two</Spoiler>.`;
