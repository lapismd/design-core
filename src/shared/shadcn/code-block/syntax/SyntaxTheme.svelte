<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    syntaxThemeStyle,
    type SyntaxThemeDefinition,
  } from "./defineSyntaxTheme.js";
  import { setSyntaxThemeContext } from "./syntax-theme-context.svelte.js";

  let {
    theme,
    children,
  }: {
    theme: SyntaxThemeDefinition;
    children?: Snippet;
  } = $props();

  setSyntaxThemeContext({
    get theme() {
      return theme;
    },
  });

  const styleText = $derived(
    Object.entries(syntaxThemeStyle(theme))
      .map(([key, value]) => `${key}: ${value}`)
      .join("; "),
  );
</script>

<div data-ui-syntax-theme={theme.name} style={styleText}>
  {@render children?.()}
</div>
