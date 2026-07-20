<script lang="ts">
  /**
   * Back-compat shell for Storybook / `@stevejuma/ui/apps/cv`.
   * Prefer `CvWorkspaceForm` for new compositions.
   */
  import CvWorkspaceForm from "../cv-workspace-form/CvWorkspaceForm.svelte";

  let {
    tab = $bindable("cv"),
    yamlMode = $bindable(false),
  }: {
    tab?: string;
    yamlMode?: boolean;
  } = $props();
</script>

<div data-testid="cv-form-overview">
  <CvWorkspaceForm bind:tab bind:yamlMode />
</div>
