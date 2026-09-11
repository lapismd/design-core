<script lang="ts">
  import { ConfirmButton } from "@lapismd/design-core/forms/dialog";
  let count = $state(0);
</script>

<ConfirmButton
  title="Clear history?"
  description="Remove saved history from this device."
  destructive
  onConfirm={() => {
    count += 1;
  }}>Clear history</ConfirmButton
>
<p>Cleared {count} time</p>
