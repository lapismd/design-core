<script module lang="ts">
  /**
   * Catalog stories for Visual Delta React panel chrome, mounted via
   * React-in-Svelte (`ReactThemeHost` + createRoot). Tagged skip-visual —
   * manager chrome is not product UI.
   */
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import React from "react";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ReactThemeHost from "storybook-addon-visual-delta/src/stories/ReactThemeHost.svelte";
  import {
    BaselineAccordionFixture,
    BaselineHistoryViewFixture,
    ImageGalleryFixture,
    LiveVisibilityFixture,
    PanelChromeFixture,
    PlacementPadFixture,
    ReviewStatusFixture,
    StatusBadgeFixture,
  } from "storybook-addon-visual-delta/src/stories/panel-fixtures";

  const { Story } = defineMeta({
    title: "Visual Delta/Panel Chrome",
    tags: ["skip-visual"],
    parameters: {
      docs: {
        description: {
          component:
            "Browseable mounts of the real Visual Delta manager/panel React controls (Storybook light theme). Tagged skip-visual — tooling chrome, not product UI.",
        },
      },
    },
  });
</script>

<Story
  name="Overview"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => canvas.getByTestId("panel-chrome-fixture"));
    await expect(
      canvas.getByTestId("panel-chrome-fixture"),
    ).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(PanelChromeFixture)} />
  {/snippet}
</Story>

<Story
  name="Baseline history"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", { name: "Default history" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("radio", {
        name: "Use Tune entry action spacing as Before",
      }),
    ).toBeChecked();
    await expect(
      canvas.getByRole("radio", {
        name: "Use Uncommitted baseline as After",
      }),
    ).toBeChecked();
    await userEvent.click(
      canvas.getByRole("button", { name: "Load more baseline history" }),
    );
    await expect(
      await canvas.findByText("Create entry actions baseline"),
    ).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(BaselineHistoryViewFixture)} />
  {/snippet}
</Story>

<Story
  name="Placement pad soft-hide"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fixture = await waitFor(() =>
      canvas.getByTestId("placement-pad-fixture"),
    );
    const scope = within(fixture);

    await expect(scope.getByTestId("fixture-overlay-on")).toHaveTextContent(
      "true",
    );
    await expect(scope.getByTestId("fixture-placement")).toHaveTextContent(
      "right",
    );

    await userEvent.click(
      scope.getByRole("switch", {
        name: "Hide overlay (Baseline right of live)",
      }),
    );
    await expect(scope.getByTestId("fixture-overlay-on")).toHaveTextContent(
      "false",
    );
    await expect(scope.getByTestId("fixture-index")).toHaveTextContent("0");

    await userEvent.click(
      scope.getByRole("switch", { name: "Baseline left of live" }),
    );
    await expect(scope.getByTestId("fixture-overlay-on")).toHaveTextContent(
      "true",
    );
    await expect(scope.getByTestId("fixture-placement")).toHaveTextContent(
      "left",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(PlacementPadFixture)} />
  {/snippet}
</Story>

<Story
  name="Image only toggle"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fixture = await waitFor(() =>
      canvas.getByTestId("live-visibility-fixture"),
    );
    const scope = within(fixture);

    await expect(scope.getByTestId("fixture-live-visible")).toHaveTextContent(
      "true",
    );
    await userEvent.click(
      scope.getByRole("switch", { name: "Image only (hide live story)" }),
    );
    await expect(scope.getByTestId("fixture-live-visible")).toHaveTextContent(
      "false",
    );
    await expect(scope.queryByText("Image only")).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(LiveVisibilityFixture)} />
  {/snippet}
</Story>

<Story
  name="Review status pad"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fixture = await waitFor(() =>
      canvas.getByTestId("review-status-fixture"),
    );
    const scope = within(fixture);

    await expect(scope.getByTestId("fixture-review-status")).toHaveTextContent(
      "none",
    );
    await userEvent.click(
      scope.getByRole("switch", {
        name: "Mark visual baseline ready for review",
      }),
    );
    await expect(scope.getByTestId("fixture-review-status")).toHaveTextContent(
      "ready",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(ReviewStatusFixture)} />
  {/snippet}
</Story>

<Story
  name="Status badges"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => canvas.getByTestId("status-badge-fixture"));
    await expect(
      canvas.getByLabelText(/^Visual status: Pass\./),
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText(/^Visual status: Fail\./),
    ).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(StatusBadgeFixture)} />
  {/snippet}
</Story>

<Story
  name="Image gallery"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fixture = await waitFor(() =>
      canvas.getByTestId("image-gallery-fixture"),
    );
    const scope = within(fixture);

    await expect(scope.getByTestId("fixture-gallery-index")).toHaveTextContent(
      "0",
    );
    await userEvent.click(scope.getByTitle("Select image 2"));
    await expect(scope.getByTestId("fixture-gallery-index")).toHaveTextContent(
      "1",
    );
    await userEvent.click(scope.getByTitle("Select image 2"));
    await expect(scope.getByTestId("fixture-gallery-index")).toHaveTextContent(
      "-1",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(ImageGalleryFixture)} />
  {/snippet}
</Story>

<Story
  name="Baseline accordion"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fixture = await waitFor(() =>
      canvas.getByTestId("baseline-accordion-fixture"),
    );
    const scope = within(fixture);

    await expect(scope.getByTestId("fixture-expanded-id")).toHaveTextContent(
      "default",
    );
    await expect(
      scope.getByTestId("fixture-section-body-default"),
    ).toHaveTextContent("Body for Default");

    await userEvent.click(
      scope.getByRole("button", { name: /Opens chooser/i }),
    );
    await expect(scope.getByTestId("fixture-expanded-id")).toHaveTextContent(
      "opens-chooser",
    );
    await expect(
      scope.getByTestId("fixture-section-body-opens-chooser"),
    ).toHaveTextContent("Body for Opens chooser");
  }}
>
  {#snippet template()}
    <ReactThemeHost element={React.createElement(BaselineAccordionFixture)} />
  {/snippet}
</Story>
