<script lang="ts">
  import type { WorkspaceSettingsPageProps } from "./types.js";

  let { section }: WorkspaceSettingsPageProps = $props();
</script>

<section aria-labelledby="custom-settings-page-title">
  <h1 id="custom-settings-page-title">{section.title}</h1>
  <article data-setting-id="community.spellcheck">
    <h2>Spellcheck</h2>
    <p>Check prose while editing.</p>
  </article>
</section>
