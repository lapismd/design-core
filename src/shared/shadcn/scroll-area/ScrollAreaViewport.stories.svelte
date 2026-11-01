<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { ScrollArea } from "./index.js";
  import Demo from "./ScrollAreaViewport.fixture.svelte";
  const { Story } = defineMeta({
    title: "Shadcn/Layout/Scroll Area",
    component: ScrollArea,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        source: {
          code: 'import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";\n\n<ScrollArea orientation="both" style="height: 120px; width: 240px" viewportProps={{ role: "region", "aria-label": "Named viewport", onpointerdown: (event) => console.log(event.currentTarget.scrollTop) }}>\n  <div style="width: 600px; height: 400px">Scrollable content</div>\n</ScrollArea>',
          language: "tsx",
          type: "code",
        },
      },
    },
  });
  async function verify({ canvasElement }: { canvasElement: HTMLElement }) {
    const canvas = within(canvasElement);
    const viewport = canvas.getByRole("region", { name: "Named viewport" });
    await expect(viewport).toHaveAttribute(
      "data-ui-part",
      "scroll-area-viewport",
    );
    await userEvent.click(viewport);
    await expect(canvas.getByLabelText("Viewport presses")).toHaveTextContent(
      "1",
    );
  }
</script>

<Story name="Styled viewport semantics" play={verify}>
  {#snippet template()}<Demo strategy="styled" />{/snippet}
</Story>
<Story name="Native viewport semantics" play={verify}>
  {#snippet template()}<Demo strategy="native" />{/snippet}
</Story>
