import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { TvExtraction } from "../analysis/variant-extractor.js";
import {
  FAMILY_TOKEN_SPECS,
  buildTokensCss,
  buildTokensTs,
  rewritePaintToTokens,
} from "./token-wiring.js";

export type EmitButtonInput = {
  targetDir: string;
  component: string;
  extraction: TvExtraction;
  remappedCss: string;
  provenance: Record<string, unknown>;
  storyTitle: string;
};

function constName(component: string, axis: string): string {
  return `${component.toUpperCase()}_${axis.toUpperCase()}S`;
}

function typeName(component: string, axis: string): string {
  const c = component[0]!.toUpperCase() + component.slice(1);
  const a = axis[0]!.toUpperCase() + axis.slice(1);
  return `${c}${a}`;
}

export function emitButtonFamily(input: EmitButtonInput): string[] {
  const {
    targetDir,
    component,
    extraction,
    remappedCss,
    provenance,
    storyTitle,
  } = input;
  mkdirSync(targetDir, { recursive: true });
  const written: string[] = [];

  const variantAxis = extraction.axes.find((a) => a.prop === "variant");
  const sizeAxis = extraction.axes.find((a) => a.prop === "size");
  if (!variantAxis || !sizeAxis) {
    throw new Error("button conversion requires variant and size axes");
  }

  const spec = FAMILY_TOKEN_SPECS[component];
  const tokensTs = buildTokensTs(component, spec);
  let paintCss = remappedCss
    .split("\n")
    .map((line) => line.replaceAll(".dark ", ":global(.dark) "))
    .join("\n");
  if (spec) {
    paintCss = rewritePaintToTokens(component, paintCss, spec);
  }

  const buttonSvelte = `<script lang="ts" module>
  export const ${constName(component, "variant")} = [
${variantAxis.values.map((v) => `    "${v}",`).join("\n")}
  ] as const;
  export type ${typeName(component, "variant")} =
    (typeof ${constName(component, "variant")})[number];

  export const ${constName(component, "size")} = [
${sizeAxis.values.map((v) => `    "${v}",`).join("\n")}
  ] as const;
  export type ${typeName(component, "size")} =
    (typeof ${constName(component, "size")})[number];

  export type ButtonProps = import("svelte/elements").HTMLButtonAttributes & {
    variant?: ${typeName(component, "variant")};
    size?: ${typeName(component, "size")};
    ref?: HTMLButtonElement | null;
    /** Intentional family restyle. Overrides default host identity. */
    dataUiComponent?: string;
  };

  /** @deprecated Prefer Button props; retained for API compatibility. */
  export function buttonVariants(_opts?: {
    variant?: ${typeName(component, "variant")};
    size?: ${typeName(component, "size")};
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import {
    omitDataUiComponent,
    resolveDataUiComponent,
  } from "../../../lib/data-ui-host.js";

  let {
    class: className,
    variant = "${variantAxis.defaultValue ?? "default"}",
    size = "${sizeAxis.defaultValue ?? "default"}",
    ref = $bindable(null),
    type = "button",
    disabled,
    children,
    dataUiComponent,
    ...restProps
  }: ButtonProps = $props();
</script>

<button
  bind:this={ref}
  {...omitDataUiComponent(restProps)}
  data-ui-component={resolveDataUiComponent("${component}", dataUiComponent)}
  data-slot="button"
  data-variant={variant}
  data-size={size}
  class={className}
  {type}
  {disabled}
>
  {@render children?.()}
</button>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
${paintCss
  .split("\n")
  .map((line) => (line ? `    ${line}` : ""))
  .join("\n")}
  }
</style>
`;

  const indexTs = `import Root, {
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  buttonVariants,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
} from "./button.svelte";

export {
  Root,
  type ButtonProps as Props,
  Root as Button,
  buttonVariants,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
};

export { buttonTokenNames, type ButtonToken } from "./button.tokens.js";
`;

  const stories = `<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Button } from "./index.js";

  const { Story } = defineMeta({
    title: "${storyTitle}",
    component: Button,
    parameters: {
      docs: {
        description: {
          component:
            "Native-CSS shadcn button. Restyle via --ui-button-* tokens (not Tailwind cn() merges).",
        },
      },
    },
  });
</script>

<script lang="ts">
  let saved = $state(false);
</script>

<Story
  name="Variants and action feedback"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Changes saved");
  }}
>
  {#snippet template()}
    <div class="flex flex-wrap items-center gap-3">
      <Button onclick={() => (saved = true)}>Save changes</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Remove</Button>
      <output class="text-muted-foreground basis-full text-sm">
        {saved ? "Changes saved" : "Changes not saved"}
      </output>
    </div>
  {/snippet}
</Story>
`;

  const files: Array<[string, string]> = [
    ["button.svelte", buttonSvelte],
    ["index.ts", indexTs],
    ["button.tokens.ts", tokensTs],
    ["button.provenance.json", `${JSON.stringify(provenance, null, 2)}\n`],
    ["Button.stories.svelte", stories],
  ];

  if (spec) {
    files.push(["button.tokens.css", buildTokensCss(component, spec)]);
  }

  for (const [name, content] of files) {
    const full = path.join(targetDir, name);
    writeFileSync(full, content);
    written.push(full);
  }

  return written;
}
