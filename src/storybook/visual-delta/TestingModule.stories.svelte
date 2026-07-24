<script module lang="ts">
  /**
   * Visual Delta Testing Module checklist (global + sidebar context variants).
   * Tagged skip-visual — tooling chrome, not product UI.
   */
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import React from "react";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ReactThemeHost from "storybook-addon-visual-delta/src/stories/ReactThemeHost.svelte";
  import { TestingModuleShell } from "storybook-addon-visual-delta/src/stories/TestingModuleShell";

  const { Story } = defineMeta({
    title: "Visual Delta/Testing Module",
    tags: ["skip-visual"],
    parameters: {
      a11y: { test: "todo" },
      docs: {
        description: {
          component:
            "Shared Testing Module chrome for the global runner and sidebar context menu: Run visual tests heading, play split (Create missing / Rewrite existing), and action checkboxes.",
        },
      },
    },
  });
</script>

<Story
  name="Global defaults"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("testing-module-shell"));
    const scope = within(shell);

    await expect(scope.getByText("Not run")).toBeInTheDocument();
    await expect(
      scope.getByRole("checkbox", { name: /run visual tests/i }),
    ).toBeChecked();
    await expect(
      scope.getByRole("checkbox", { name: /create missing baselines/i }),
    ).not.toBeChecked();
    await expect(
      scope.getByRole("checkbox", { name: /update status/i }),
    ).not.toBeChecked();
    await expect(scope.getByTestId("fixture-baseline-mode")).toHaveTextContent(
      "create",
    );

    await userEvent.click(
      scope.getByRole("button", { name: /run selected visual actions/i }),
    );
    await expect(scope.getByTestId("fixture-last-action")).toHaveTextContent(
      "compare",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(TestingModuleShell, { variant: "global" })}
    />
  {/snippet}
</Story>

<Story
  name="Sidebar context menu"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("testing-module-shell"));
    const scope = within(shell);

    await expect(
      scope.getByTestId("visual-test-module-context"),
    ).toBeInTheDocument();

    await userEvent.click(
      scope.getByRole("checkbox", { name: /create missing baselines/i }),
    );
    await userEvent.click(
      scope.getByRole("checkbox", { name: /update status/i }),
    );
    await expect(scope.getByTestId("fixture-selected")).toHaveTextContent(
      "compare+create-missing+update-status",
    );

    await userEvent.click(
      scope.getByRole("button", { name: /run selected visual actions/i }),
    );
    await expect(scope.getByTestId("fixture-last-action")).toHaveTextContent(
      "compare+create-missing+update-status",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(TestingModuleShell, { variant: "context" })}
    />
  {/snippet}
</Story>

<Story
  name="Update baselines mode"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("testing-module-shell"));
    const scope = within(shell);

    await expect(
      scope.getByRole("checkbox", { name: /update baselines/i }),
    ).not.toBeChecked();
    await expect(scope.getByTestId("fixture-baseline-mode")).toHaveTextContent(
      "rewrite",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(TestingModuleShell, {
        variant: "global",
        seedRewriteMode: true,
      })}
    />
  {/snippet}
</Story>
