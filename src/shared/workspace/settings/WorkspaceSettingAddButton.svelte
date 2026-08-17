<script lang="ts">
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let {
    label,
    disabled = false,
    onclick,
  }: {
    label: string;
    disabled?: boolean;
    onclick: () => void;
  } = $props();
</script>

<button
  type="button"
  class="ui-workspace-setting-add"
  data-ui-part="setting-add"
  {disabled}
  {onclick}
>
  <WorkspaceIcon name="plus" />
  {label}
</button>
