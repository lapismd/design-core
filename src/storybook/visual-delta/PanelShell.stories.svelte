<script module lang="ts">
  /**
   * End-to-end Visual Delta panel shell with mocked /__visual-delta backends.
   * Dedicated self-test stories: excluded from product screenshots but retained
   * in the Storybook test project.
   */
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import React from "react";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ReactThemeHost from "storybook-addon-visual-delta/src/stories/ReactThemeHost.svelte";
  import { PanelShell } from "storybook-addon-visual-delta/src/stories/PanelShell";
  import { createMockVisualBackend } from "storybook-addon-visual-delta/src/stories/mock-visual-backend";
  import ResponsiveViewportCanary from "./ResponsiveViewportCanary.svelte";

  const { Story } = defineMeta({
    title: "Visual Delta/Panel Shell",
    tags: ["test", "skip-visual", "visual-delta-self-test"],
    parameters: {
      docs: {
        description: {
          component:
            "Live-panel-shaped harness with in-memory create/update/run/review/skip-visual mocks. Click through or rely on play functions — no Playwright writes.",
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
  name="Setup required"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("status", { name: /Setup required/i }),
    ).toHaveAttribute("data-result-state", "setup");
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        seedEmpty: true,
        initialState: "setup",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Skipped result"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("status", { name: /Visual tests skipped/i }),
    ).toHaveAttribute("data-result-state", "skipped");
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialSkipVisual: true,
      })}
    />
  {/snippet}
</Story>

<Story
  name="Failed result"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("status", { name: /Visual test failed/i }),
    ).toHaveAttribute("data-result-state", "failed");
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialState: "failed",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Passed result"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("status", { name: /Visual test passed/i }),
    ).toHaveAttribute("data-result-state", "passed");
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialState: "passed",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Running result"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await canvas.findByTestId("panel-shell");
    const scope = within(shell);
    await expect(
      scope.getByRole("status", { name: /Visual test running/i }),
    ).toHaveAttribute("data-result-state", "running");
    await expect(
      scope.getByRole("progressbar", {
        name: "Visual Delta check progress",
      }),
    ).toHaveAttribute("aria-valuenow", "7");
    await expect(
      scope.getByRole("progressbar", {
        name: "Visual Delta check progress",
      }),
    ).toHaveAttribute("aria-valuemax", "12");
    const progressLog = scope.getByRole("button", {
      name: /Progress: ✓ filter-search--with-query \(7\/12\)/i,
    });
    await expect(progressLog).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialState: "running",
        initialProgress: { completed: 7, total: 12 },
        initialStatusLog:
          "Starting visual checks\n✓ shadcn-button--default (6/12)\n✓ filter-search--with-query (7/12)\n",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Missing baseline"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("status", { name: /Baseline missing/i }),
    ).toHaveAttribute("data-result-state", "missing");
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        seedEmpty: true,
        initialState: "missing",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Capture error"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("status", { name: /Capture error/i }),
    ).toHaveAttribute("data-result-state", "error");
    await expect(
      canvas.getByText("Chromium could not capture the subject."),
    ).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        captureError: "Chromium could not capture the subject.",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Baseline geometry mismatch"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const warning = await canvas.findByRole("alert", {
      name: /Baseline geometry mismatch/i,
    });
    await expect(warning).toHaveTextContent(
      "Baseline 1232×187 CSS px; live component 264×187 CSS px",
    );
    await expect(warning).toHaveTextContent("1280×900 capture viewport");
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        baselineGeometryMismatch: {
          baselineCss: { width: 1232, height: 187 },
          liveCss: { width: 264, height: 187 },
          captureViewport: { width: 1280, height: 900 },
        },
      })}
    />
  {/snippet}
</Story>

<Story
  name="Configuration warnings"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("heading", { name: "Configuration" }),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: "Resolved" }));
    await expect(
      canvas.getByRole("heading", { name: "Baselines" }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText("Snapshot directory is mounted at /visual-baselines."),
    ).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        configurationOpen: true,
      })}
    />
  {/snippet}
</Story>

<Story
  name="Configuration defaults"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const threshold = await canvas.findByLabelText("Pass threshold percentage");
    await expect(
      canvas.getByRole("tab", { name: "Defaults", selected: true }),
    ).toBeInTheDocument();
    await userEvent.clear(threshold);
    await userEvent.type(threshold, "1.5");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(
      await canvas.findByText(/Project defaults saved/),
    ).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        configurationOpen: true,
      })}
    />
  {/snippet}
</Story>

<Story
  name="Configuration save failure"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opacity = await canvas.findByLabelText("Overlay opacity");
    await userEvent.clear(opacity);
    await userEvent.type(opacity, "0.7");
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "Configuration file is read-only.",
    );
    await expect(opacity).toHaveValue(0.7);
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        configurationOpen: true,
        configurationSaveError: "Configuration file is read-only.",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Narrow configuration scrolling"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaults = await canvas.findByRole("tabpanel", { name: "Defaults" });
    const scrollSurface = defaults.parentElement;
    await expect(scrollSurface).not.toBeNull();
    await waitFor(() =>
      expect(scrollSurface!.scrollHeight).toBeGreaterThan(
        scrollSurface!.clientHeight,
      ),
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(
        "div",
        { style: { width: 360, height: 280 } },
        React.createElement(PanelShell, {
          backend: createMockVisualBackend(),
          configurationOpen: true,
        }),
      )}
    />
  {/snippet}
</Story>

<Story
  name="Current run review"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await canvas.findByTestId("panel-shell");
    const scope = within(shell);
    const page = within(document.body);

    await userEvent.click(
      scope.getByRole("button", {
        name: /Choose Accept story, component, or current run scope/i,
      }),
    );
    await userEvent.click(
      await page.findByRole("button", { name: "Current run scope" }),
    );
    await userEvent.click(
      scope.getByRole("button", { name: "Accept current run" }),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-accept-scope")).toHaveTextContent(
        "run",
      ),
    );
    await expect(scope.getByTestId("fixture-review")).toHaveTextContent(
      "approved",
    );
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        runAvailable: true,
      })}
    />
  {/snippet}
</Story>

<Story
  name="Mixed mode failure"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await canvas.findByTestId("panel-shell");
    const scope = within(shell);
    const page = within(document.body);

    await expect(
      scope.getByRole("button", {
        name: "Visual mode: Default, passed",
      }),
    ).toBeInTheDocument();
    await userEvent.click(
      scope.getByRole("button", {
        name: "Visual mode: Default, passed",
      }),
    );
    await userEvent.click(
      await page.findByRole("button", {
        name: "Dark desktop mode, failed",
      }),
    );
    await expect(scope.getByTestId("fixture-mode")).toHaveTextContent(
      "Dark desktop",
    );
    await expect(scope.getByText("2 passed · 1 failed")).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialState: "failed",
        modeNames: ["Dark desktop", "High contrast"],
        modeResults: {
          Default: "passed",
          "Dark desktop": "failed",
          "High contrast": "passed",
        },
      })}
    />
  {/snippet}
</Story>

<Story
  name="Manager integration fixture"
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/button/default-chromium-darwin.png"],
      modes: {
        "Dark desktop": { globals: { colorMode: "dark" } },
        "Light mobile": {
          globals: {
            colorMode: "light",
            viewport: { value: "mobile1", isRotated: false },
          },
        },
      },
      ignoreSelectors: ['[data-testid="panel-shell"]'],
    },
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId("panel-shell")).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialState: "passed",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Manager full viewport integration fixture"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/tasks/components/tasks-shell/today-chromium-darwin.png",
      ],
      cropToViewport: true,
    },
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId("panel-shell")).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialState: "passed",
      })}
    />
  {/snippet}
</Story>

<Story
  name="Responsive 1440 viewport canary"
  parameters={{
    visualDelta: {
      images: [
        {
          src: "/visual-baselines/tasks/components/tasks-shell/today-chromium-darwin.png",
          viewport: { width: 1440, height: 960 },
          deviceScaleFactor: 3,
          align: "viewport",
          placement: "right",
        },
      ],
      cropToViewport: true,
    },
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByTestId("responsive-viewport-canary"),
    ).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ResponsiveViewportCanary />
  {/snippet}
</Story>

<Story
  name="Delayed story completion"
  play={async ({ canvasElement }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 200));
    canvasElement.dataset.visualDeltaDelayedPlay = "complete";
    const canvas = within(canvasElement);
    await expect(await canvas.findByTestId("panel-shell")).toBeInTheDocument();
  }}
>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(PanelShell, {
        backend: createMockVisualBackend(),
        initialState: "passed",
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
    await expect(
      scope.getByLabelText(/Visual status: Pass/i),
    ).toBeInTheDocument();
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
  name="Toggle skip-visual"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shell = await waitFor(() => canvas.getByTestId("panel-shell"));
    const scope = within(shell);
    // Popover menus portal outside the story canvas.
    const page = within(document.body);

    await userEvent.click(scope.getByRole("button", { name: /More actions/i }));
    await userEvent.click(
      await waitFor(() =>
        page.getByRole("button", { name: /Skip visual tests/i }),
      ),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-actions")).toHaveTextContent(
        "skip-visual",
      ),
    );
    await expect(scope.getByTestId("fixture-skip-visual")).toHaveTextContent(
      "true",
    );

    await userEvent.click(scope.getByRole("button", { name: /More actions/i }));
    await userEvent.click(
      await waitFor(() =>
        page.getByRole("button", { name: /Include in visual tests/i }),
      ),
    );
    await waitFor(() =>
      expect(scope.getByTestId("fixture-skip-visual")).toHaveTextContent(
        "false",
      ),
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
      await waitFor(() => scope.getByRole("button", { name: /Stop/i })),
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

    await userEvent.click(
      scope.getByRole("button", { name: /Opens chooser/i }),
    );
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
