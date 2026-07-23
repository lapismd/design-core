<script module lang="ts">
  /**
   * End-to-end Visual Delta panel shell with mocked /__visual-delta backends.
   * Tagged skip-visual — tooling chrome, not product UI.
   */
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import React from "react";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ReactThemeHost from "storybook-addon-visual-delta/src/stories/ReactThemeHost.svelte";
  import { PanelShell } from "storybook-addon-visual-delta/src/stories/PanelShell";
  import { createMockVisualBackend } from "storybook-addon-visual-delta/src/stories/mock-visual-backend";

  const { Story } = defineMeta({
    title: "Visual Delta/Panel Shell",
    tags: ["skip-visual"],
    parameters: {
      a11y: { test: "todo" },
      docs: {
        description: {
          component:
            "Live-panel-shaped harness with in-memory create/update/run/review mocks. Click through or rely on play functions — no Playwright writes.",
        },
      },
    },
  });
</script>

<Story
  name="Overview"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => canvas.getByTestId("panel-shell"));
    await expect(canvas.getByTestId("panel-shell")).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
      })}
    />
  {/snippet}
</Story>

<Story
  name="Placement and gallery"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("panel-shell"));
    const scope = within(shell);

    await userEvent.click(
      scope.getByRole("switch", {
        name: "Hide overlay (Baseline right of live)",
      }),
    );
    await expect(scope.getByTestId("fixture-overlay-on")).toHaveTextContent(
      "false",
    );

    await userEvent.click(
      scope.getByRole("switch", { name: "Baseline left of live" }),
    );
    await expect(scope.getByTestId("fixture-overlay-on")).toHaveTextContent(
      "true",
    );
    await expect(scope.getByTestId("fixture-placement")).toHaveTextContent(
      "left",
    );

    await userEvent.click(
      scope.getByRole("switch", { name: "Image only (hide live story)" }),
    );
    await expect(scope.getByTestId("fixture-live-visible")).toHaveTextContent(
      "false",
    );

    await userEvent.click(scope.getByTitle("Select image 2"));
    await expect(scope.getByTestId("fixture-gallery-index")).toHaveTextContent(
      "1",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
      })}
    />
  {/snippet}
</Story>

<Story
  name="Create baseline"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("panel-shell"));
    const scope = within(shell);

    await userEvent.click(
      scope.getByRole("button", { name: /Create visual baseline/i }),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-actions")).toHaveTextContent(
        "create-baseline",
      ),
    );
    await expect(scope.getByLabelText(/Visual status: Pass/i)).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        seedEmpty: true,
      })}
    />
  {/snippet}
</Story>

<Story
  name="Update and review"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("panel-shell"));
    const scope = within(shell);
    // Popover menus portal outside the story canvas.
    const page = within(document.body);

    await userEvent.click(scope.getByRole("button", { name: /More actions/i }));
    await userEvent.click(
      await waitFor(() =>
        page.getByRole("button", { name: /Update baselines/i }),
      ),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-actions")).toHaveTextContent(
        "update-baseline",
      ),
    );

    await userEvent.click(
      scope.getByRole("switch", { name: /Approve visual baseline/i }),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-review")).toHaveTextContent("approved"),
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
      })}
    />
  {/snippet}
</Story>

<Story
  name="Diff and run visual"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("panel-shell"));
    const scope = within(shell);
    const page = within(document.body);

    // Split chevron: accessible name is the mode list, title is "Choose action".
    await userEvent.click(
      scope.getByRole("button", {
        name: /Choose Diff, Story, Component, or All/i,
      }),
    );
    await userEvent.click(
      await waitFor(() => page.getByRole("button", { name: /^Use Story$/i })),
    );
    await userEvent.click(
      scope.getByRole("button", {
        name: /Run visual test for this story/i,
      }),
    );
    // Cancel while the mock run is in progress (Stop replaces the play control).
    await userEvent.click(
      await waitFor(() =>
        scope.getByRole("button", { name: /Stop/i }),
      ),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-actions")).toHaveTextContent(
        "cancel-tests",
      ),
    );

    // Re-run to completion, then Diff from the status badge.
    await userEvent.click(
      scope.getByRole("button", {
        name: /Run visual test for this story/i,
      }),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-actions")).toHaveTextContent(
        "run-tests",
      ),
    );
    await waitFor(() =>
      expect(
        scope.getByRole("button", { name: /Re-run Diff/i }),
      ).toBeInTheDocument(),
    );

    await userEvent.click(scope.getByRole("button", { name: /Re-run Diff/i }));
    await waitFor(() =>
      expect(scope.getByTestId("fixture-diff")).toHaveTextContent("Live Diff"),
    );
    await expect(scope.getByTestId("fixture-actions")).toHaveTextContent(
      "diff",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
      })}
    />
  {/snippet}
</Story>

<Story
  name="Accordion create interaction"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("panel-shell"));
    const scope = within(shell);

    await userEvent.click(scope.getByRole("button", { name: /Opens chooser/i }));
    await expect(scope.getByTestId("fixture-expanded-id")).toHaveTextContent(
      "opens-chooser",
    );

    await userEvent.click(
      scope.getByRole("button", { name: /Create baseline/i }),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-actions")).toHaveTextContent(
        "create-interaction",
      ),
    );
    await expect(scope.getByTestId("fixture-interaction")).toHaveTextContent(
      "opens-chooser",
    );

    await userEvent.click(
      scope.getByRole("button", {
        name: /Default End of play/i,
      }),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-expanded-id")).toHaveTextContent(
        "default",
      ),
    );
    // Toggle is role=switch; summary name also contains "Difference distribution".
    await userEvent.click(
      scope.getByRole("switch", { name: /Difference distribution/i }),
    );
    await expect(
      scope.getByTestId("fixture-section-body-default"),
    ).toHaveTextContent("distribution on");
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
      })}
    />
  {/snippet}
</Story>
