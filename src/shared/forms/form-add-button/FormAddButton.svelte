<script lang="ts">
  import "./FormAddButton.css";
  import PlusIcon from "@lucide/svelte/icons/plus";

  let {
    label,
    presentation = "inline",
    onclick = () => {},
  }: {
    /** Domain-specific add label, e.g. "Add source". */
    label: string;
    /** Inline link-style action or a full-width panel action. */
    presentation?: "inline" | "panel";
    onclick?: () => void;
  } = $props();
</script>

<button
  type="button"
  class="ui-form-add-button"
  data-ui-component="form-add-button"
  data-ui-part="form-add-button"
  data-presentation={presentation}
  {onclick}
>
  <PlusIcon aria-hidden="true" />
  {label}
</button>
