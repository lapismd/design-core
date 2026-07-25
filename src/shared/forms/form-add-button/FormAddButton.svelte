<script lang="ts">
  import "./FormAddButton.css";
  import PlusIcon from "@lucide/svelte/icons/plus";

  let {
    label,
    onclick = () => {},
  }: {
    /** Domain-specific add label, e.g. "Add source". */
    label: string;
    onclick?: () => void;
  } = $props();
</script>

<button
  type="button"
  class="ui-form-add-button"
  data-ui-component="form-add-button"
  data-ui-part="form-add-button"
  {onclick}
>
  <PlusIcon aria-hidden="true" />
  {label}
</button>
