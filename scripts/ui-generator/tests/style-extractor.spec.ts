import { describe, expect, it } from "vitest";
import {
  extractCnClasses,
  extractStyleFromSource,
  looksLikeTailwindSource,
} from "../analysis/style-extractor.js";
import { rewritePartSource } from "../transform/family-emitter.js";

describe("extractCnClasses", () => {
  it("collects static cn() string candidates", () => {
    const source = `
      class={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px",
        "data-[orientation=vertical]:h-full",
        className,
      )}
    `;
    const result = extractCnClasses(source);
    expect(result.kind).toBe("cn");
    expect(result.baseClasses).toContain("bg-border");
    expect(result.baseClasses).toContain("shrink-0");
    expect(result.allCandidates.length).toBeGreaterThan(2);
  });

  it("rejects interpolated cn templates", () => {
    expect(() =>
      extractCnClasses(`class={cn(\`grid-cols-\${n}\`, className)}`),
    ).toThrow(/dynamic/i);
  });
});

describe("extractStyleFromSource", () => {
  it("prefers tv() when present", () => {
    const source = `
      export const badgeVariants = tv({
        base: "inline-flex rounded-md",
        variants: {
          variant: {
            default: "bg-primary",
            outline: "border-border",
          },
        },
        defaultVariants: { variant: "default" },
      });
      class={cn(badgeVariants({ variant }), className)}
    `;
    const result = extractStyleFromSource(source);
    expect(result.kind).toBe("tv");
    expect(result.axes.map((a) => a.prop)).toEqual(["variant"]);
  });
});

describe("rewritePartSource", () => {
  it("strips cn strings and injects ownership attrs", () => {
    const source = `<script lang="ts">
  import { cn } from "../../../lib/utils.js";
  let { class: className }: { class?: string } = $props();
</script>

<div
  data-slot="skeleton"
  class={cn("bg-muted animate-pulse rounded-md", className)}
></div>
`;
    const extraction = extractStyleFromSource(source);
    const out = rewritePartSource({
      part: {
        part: "skeleton",
        fileName: "skeleton.svelte",
        source,
        extraction,
      },
      component: "skeleton",
    });
    expect(out).toContain('data-ui-component="skeleton"');
    expect(out).not.toContain("animate-pulse");
    expect(out).toMatch(/class=\{className\}/);
  });
});

describe("looksLikeTailwindSource", () => {
  it("detects utility cn sources", () => {
    expect(
      looksLikeTailwindSource(`class={cn("flex items-center", className)}`),
    ).toBe(true);
  });

  it("treats native data-ui sources as converted", () => {
    expect(
      looksLikeTailwindSource(`
        <div data-ui-component="skeleton" class={className}></div>
        <style>:global { [data-ui-component="skeleton"] { display:block } }</style>
      `),
    ).toBe(false);
  });
});
