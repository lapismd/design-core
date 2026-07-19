import { describe, expect, it } from "vitest";
import {
  extractCnClasses,
  extractFamilyFromFiles,
  extractStyleFromSource,
  looksLikeTailwindSource,
} from "../analysis/style-extractor.js";
import { extractStyleSites } from "../analysis/style-sites.js";
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

describe("extractStyleSites", () => {
  it("splits nested cn/static sites by data-slot", () => {
    const source = `
<SwitchPrimitive.Root
  data-slot="switch"
  class={cn("peer group/switch relative inline-flex", className)}
>
  <SwitchPrimitive.Thumb
    data-slot="switch-thumb"
    class="bg-background pointer-events-none block size-4"
  />
</SwitchPrimitive.Root>
`;
    const sites = extractStyleSites(source, "switch", "switch");
    expect(sites.map((s) => s.part).sort()).toEqual([
      "switch",
      "switch-thumb",
    ]);
    expect(sites.find((s) => s.part === "switch")?.markers).toEqual(
      expect.arrayContaining(["group/switch", "peer"]),
    );
    expect(
      sites.find((s) => s.part === "switch-thumb")?.baseClasses,
    ).toContain("size-4");
  });

  it("finds data-slot after class= on the same tag", () => {
    const source = `
<span
  class="pointer-events-none absolute end-2"
  data-slot="dropdown-menu-checkbox-item-indicator"
></span>
`;
    const sites = extractStyleSites(source, "dropdown-menu", "dropdown-menu-checkbox-item");
    expect(sites).toHaveLength(1);
    expect(sites[0]!.part).toBe("dropdown-menu-checkbox-item-indicator");
    expect(sites[0]!.dataSlot).toBe(
      "dropdown-menu-checkbox-item-indicator",
    );
  });

  it("synthesizes a part for Viewport without data-slot", () => {
    const source = `
<SelectPrimitive.Content
  data-slot="select-content"
  class={cn("bg-popover z-50", className)}
>
  <SelectPrimitive.Viewport
    class={cn("h-(--bits-select-anchor-height) w-full")}
  />
</SelectPrimitive.Content>
`;
    const sites = extractStyleSites(source, "select", "select-content");
    expect(sites.map((s) => s.part)).toEqual(
      expect.arrayContaining(["select-content", "select-viewport"]),
    );
    const viewport = sites.find((s) => s.part === "select-viewport");
    expect(viewport?.baseClasses).toContain("w-full");
    expect(viewport?.baseClasses).toContain("h-(--bits-select-anchor-height)");
  });

  it("marks composed family hosts and keeps file part over shared control slots", () => {
    const source = `
<script lang="ts">
  import { Input } from "../input/index.js";
</script>
<Input
  data-slot="input-group-control"
  class={cn("rounded-none border-0 focus-visible:ring-0", className)}
/>
`;
    const sites = extractStyleSites(
      source,
      "input-group",
      "input-group-input",
    );
    expect(sites).toHaveLength(1);
    expect(sites[0]!.composedFrom).toBe("input");
    expect(sites[0]!.part).toBe("input-group-input");
    expect(sites[0]!.dataSlot).toBe("input-group-control");
  });
});

describe("extractFamilyFromFiles", () => {
  it("owns nested sites separately", () => {
    const family = extractFamilyFromFiles("switch", [
      {
        fileName: "switch.svelte",
        source: `
<SwitchPrimitive.Root data-slot="switch" class={cn("relative inline-flex group/switch", className)}>
  <SwitchPrimitive.Thumb data-slot="switch-thumb" class="bg-background size-4" />
</SwitchPrimitive.Root>
`,
      },
    ]);
    const parts = family.parts[0]!.sites.map((s) => s.part).sort();
    expect(parts).toEqual(["switch", "switch-thumb"]);
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
    const sites = extractStyleSites(source, "skeleton", "skeleton");
    const out = rewritePartSource({
      part: {
        part: "skeleton",
        fileName: "skeleton.svelte",
        source,
        extraction,
        sites,
      },
      component: "skeleton",
    });
    expect(out).toContain('data-ui-component="skeleton"');
    expect(out).toContain('data-ui-part="skeleton"');
    expect(out).not.toContain("animate-pulse");
    expect(out).toMatch(/class=\{className\}/);
  });

  it("assigns thumb its own part and strips static utilities", () => {
    const source = `<script lang="ts">
  import { cn } from "../../../lib/utils.js";
  let { class: className }: { class?: string } = $props();
</script>

<button
  data-slot="switch"
  class={cn("peer group/switch relative inline-flex", className)}
>
  <span
    data-slot="switch-thumb"
    class="bg-background pointer-events-none block size-4"
  ></span>
</button>
`;
    const family = extractFamilyFromFiles("switch", [
      { fileName: "switch.svelte", source },
    ]);
    const out = rewritePartSource({
      part: family.parts[0]!,
      component: "switch",
    });
    expect(out).toContain('data-ui-part="switch-thumb"');
    expect(out).not.toContain("size-4");
    expect(out).not.toContain("group/switch");
    expect(out.match(/data-ui-part="switch"/g)?.length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("does not override data-ui-component on composed Input hosts", () => {
    const source = `<script lang="ts">
  import { cn } from "../../../lib/utils.js";
  import { Input } from "../input/index.js";
  let { class: className }: { class?: string } = $props();
</script>

<Input
  data-slot="input-group-control"
  class={cn("rounded-none border-0 focus-visible:ring-0", className)}
/>
`;
    const family = extractFamilyFromFiles("input-group", [
      { fileName: "input-group-input.svelte", source },
    ]);
    const out = rewritePartSource({
      part: family.parts[0]!,
      component: "input-group",
    });
    expect(out).toContain('data-ui-part="input-group-input"');
    expect(out).toContain('data-slot="input-group-control"');
    expect(out).not.toContain('data-ui-component="input-group"');
    expect(out).not.toContain("focus-visible:ring-0");
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
