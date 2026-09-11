<script lang="ts">
  import { ConfirmDialog } from "@lapismd/design-core/forms/dialog";
  let open = $state(true);
  let removed = $state(false);
</script>

<ConfirmDialog
  bind:open
  title="Remove record?"
  description="Remove the selected record."
  confirmLabel="Remove"
  destructive
  onConfirm={async () => {
    removed = true;
  }}
/>
<p>{removed ? "Removed" : "Available"}</p>
