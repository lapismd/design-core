<script lang="ts">
  import { Dialog as DialogPrimitive } from "bits-ui";

  let { to, disabled, children }: DialogPrimitive.PortalProps = $props();
  const target = $derived(to);
  const portalDisabled = $derived(disabled);
</script>

<!-- Keep portal inputs independent of reactive content so updates do not remount it. -->
<DialogPrimitive.Portal
  {...target === undefined ? {} : { to: target }}
  {...portalDisabled === undefined ? {} : { disabled: portalDisabled }}
>
  {@render children?.()}
</DialogPrimitive.Portal>
