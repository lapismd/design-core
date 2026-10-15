<script lang="ts">
  import { AvatarPicker } from "./index.js";
  let background = $state("#fef3c7");
  const badge = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#6366f1" d="M128 36 220 98 184 204H72L36 98Z"/><path fill="white" d="m128 78 17 35 39 6-28 27 7 39-35-18-35 18 7-39-28-27 39-6Z"/></svg>')}`;
</script>

<div style="max-width:26rem;padding:1rem">
  <AvatarPicker
    value={badge}
    bind:background
    name="Transparent badge"
    presentation="inline"
    open
    shape="rounded"
    size="2xl"
  />
  <output
    style="display:block;margin-top:1rem;color:var(--muted-foreground);font-size:0.875rem"
    >Background: {background}</output
  >
</div>
