<script lang="ts">
  import { DialogFrame } from "@lapismd/design-core/forms/dialog";
  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  let open = $state(false);
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger
    >{#snippet child({ props })}<Button {...props}>Edit record</Button
      >{/snippet}</Dialog.Trigger
  >
  <DialogFrame
    title="Edit record"
    description="The form scrolls while its actions remain visible."
    size="wide"
  >
    {#snippet sidebar()}<nav aria-label="Sections">
        <Button variant="secondary">Details</Button>
      </nav>{/snippet}
    {#each Array.from({ length: 24 }) as _, index}<label
        style="display: grid; gap: 0.5rem; margin-block: 1rem;"
        >Field {index + 1}<Input /></label
      >{/each}
    {#snippet footer()}<Button variant="outline" onclick={() => (open = false)}
        >Cancel</Button
      ><Button onclick={() => (open = false)}>Save</Button>{/snippet}
  </DialogFrame>
</Dialog.Root>
