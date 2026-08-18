export const Basic = `<script lang="ts">
  import { PasswordInput } from "@lapismd/design-core/forms";

  let token = $state("");
</script>

<PasswordInput
  id="auth-token"
  bind:value={token}
  placeholder="Shared token"
  aria-label="Auth token"
/>`;
