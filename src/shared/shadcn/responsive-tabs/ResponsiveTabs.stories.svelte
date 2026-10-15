<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within, waitFor } from "storybook/test";
  import { ResponsiveTabs } from "./index.js";
  import Fixture from "./ResponsiveTabs.stories.fixture.svelte";
  import { Basic } from "./ResponsiveTabs.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Navigation/Responsive Tabs",
    component: ResponsiveTabs,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Resize and overflow"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("tab", { name: "Documents" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Overflow" }));
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "More project sections" }),
      ).toBeVisible(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Menu only" }));
    await waitFor(() => expect(canvas.queryByRole("tab")).toBeNull());
    await userEvent.click(
      canvas.getByRole("button", { name: "More project sections" }),
    );
    await expect(
      within(document.body).getByRole("menuitem", { name: "Settings" }),
    ).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(
      within(document.body).getByRole("menuitem", {
        name: "People",
      }),
    );
    await expect(canvas.getByTestId("selected-tab")).toHaveTextContent(
      "people",
    );
    await expect(
      canvas.getByRole("tabpanel", { name: "People" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Wide" }));
    await waitFor(() =>
      expect(canvas.getByRole("tab", { name: "People" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story name="Line presentation"
  >{#snippet template()}<Fixture presentation="line" />{/snippet}</Story
>
<Story name="Disabled"
  >{#snippet template()}<Fixture disabled />{/snippet}</Story
>
