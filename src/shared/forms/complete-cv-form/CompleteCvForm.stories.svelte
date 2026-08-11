<script module lang="ts">
  import { EditorView } from "@codemirror/view";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";

  import CompleteCvForm from "./CompleteCvForm.svelte";
  import { CompleteCvFormExample } from "./CompleteCvForm.example-sources";

  const { Story } = defineMeta({
    title: "UI Forms/Examples/Complete CV Form",
    component: CompleteCvForm,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A complete, body-only App Shell form over a story-local snapshot of CV Studio's John Doe sample. Every structured fragment round-trips through live YAML.",
        },
        source: { code: CompleteCvFormExample, language: "svelte" },
      },
    },
  });

  function replaceYaml(editor: HTMLElement, value: string): void {
    const view = EditorView.findFromDOM(editor);
    if (!view) throw new Error("CodeMirror editor view was not mounted");
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      userEvent: "input",
    });
  }
</script>

<Story
  name="Interactive sample CV"
  tags={["visual-ready"]}
  play={async ({ canvas, canvasElement, step }) => {
    await step(
      "Shows the complete sample and all nine entry types",
      async () => {
        await expect(canvas.getByTestId("structured-cv")).toBeVisible();
        await expect(canvas.getByTestId("yaml-cv")).toBeVisible();
        await expect(
          canvas.getByRole("textbox", { name: "CV YAML" }),
        ).toBeVisible();
        await expect(
          canvasElement.querySelectorAll(
            '[data-ui-part="body"] > [data-ui-component="scroll-area"]',
          ),
        ).toHaveLength(0);
        await expect(canvas.getAllByDisplayValue("John Doe")[0]).toBeVisible();
        for (const entryType of [
          "TextEntry",
          "EducationEntry",
          "ExperienceEntry",
          "NormalEntry",
          "PublicationEntry",
          "BulletEntry",
          "OneLineEntry",
          "NumberedEntry",
          "ReversedNumberedEntry",
        ]) {
          const section = canvas.getByTestId(`cv-section-${entryType}`);
          section.scrollIntoView({ block: "center" });
          await expect(section).toBeVisible();
        }

        const formRoot = canvas.getByTestId("structured-cv");
        await expect(formRoot).toHaveAttribute(
          "data-ui-component",
          "scroll-area",
        );
        const formScroller = formRoot.querySelector<HTMLElement>(
          '[data-ui-part="scroll-area-viewport"]',
        )!;
        if (getComputedStyle(formScroller).overflowY === "visible") {
          await expect(
            canvas.getByRole("tabpanel", { name: "CV" }).scrollTop,
          ).toBeGreaterThan(0);
        } else {
          await expect(formScroller.scrollTop).toBeGreaterThan(0);
        }

        for (const [entryType, markers] of [
          ["BulletEntry", ["•", "•", "•", "•", "•"]],
          ["NumberedEntry", ["1.", "2.", "3."]],
          ["ReversedNumberedEntry", ["4.", "3.", "2.", "1."]],
        ] as const) {
          const section = canvas.getByTestId(`cv-section-${entryType}`);
          await expect(
            within(section)
              .getAllByTestId("simple-entry-marker")
              .map((marker) => marker.textContent),
          ).toEqual(markers);
        }

        for (const entryType of [
          "TextEntry",
          "BulletEntry",
          "NumberedEntry",
          "ReversedNumberedEntry",
        ]) {
          const section = canvas.getByTestId(`cv-section-${entryType}`);
          const visibleFieldLabels = Array.from(
            section.querySelectorAll<HTMLElement>(
              ".complete-cv-unlabeled-entry .cv-form-field > span",
            ),
          ).filter((label) => getComputedStyle(label).position !== "absolute");
          await expect(visibleFieldLabels).toHaveLength(0);
        }

        const firstHighlights = canvas
          .getAllByText("Highlights")[0]
          .closest<HTMLElement>('[data-ui-part="list-editor"]')!;
        const finalHighlight = firstHighlights.querySelector<HTMLElement>(
          ':scope > [data-ui-part="list-editor-items"] > [data-ui-component="sortable-array-item"]:last-child',
        )!;
        await expect(getComputedStyle(finalHighlight).borderBottomWidth).toBe(
          "0px",
        );
        const firstHighlightBody = firstHighlights.querySelector<HTMLElement>(
          '[data-ui-part="sortable-array-item-body"]',
        )!;
        await expect(
          getComputedStyle(firstHighlightBody).borderBottomWidth,
        ).toBe("0px");

        const socialRows = canvas
          .getByTestId("social-networks")
          .querySelectorAll<HTMLElement>(
            ':scope > [data-ui-part="entry-actions"]',
          );
        await expect(
          getComputedStyle(socialRows[socialRows.length - 1]).borderBottomWidth,
        ).toBe("0px");
      },
    );

    await step(
      "Resizes the form and YAML panes with the keyboard",
      async () => {
        const handle = canvas.getByTestId("complete-cv-cv-resize-handle");
        const formPane = canvas.getByTestId(
          "complete-cv-cv-form-resizable-pane",
        );
        const initialWidth = formPane.getBoundingClientRect().width;

        await expect(handle).toHaveAttribute("role", "separator");
        await expect(
          canvasElement.querySelector(".complete-cv-yaml-header"),
        ).not.toBeInTheDocument();

        if (getComputedStyle(handle).display === "none") {
          await expect(
            getComputedStyle(
              canvasElement.querySelector<HTMLElement>(
                ".complete-cv-editor-split",
              )!,
            ).display,
          ).toBe("block");
        } else {
          handle.focus();
          await userEvent.keyboard("{ArrowRight}");
          await waitFor(() =>
            expect(formPane.getBoundingClientRect().width).toBeGreaterThan(
              initialWidth,
            ),
          );

          await userEvent.keyboard("{ArrowLeft}");
          await waitFor(() =>
            expect(
              Math.abs(formPane.getBoundingClientRect().width - initialWidth),
            ).toBeLessThan(2),
          );
        }
      },
    );

    await step(
      "Edits a scalar and collapses and expands the active form",
      async () => {
        const name = canvas.getAllByLabelText("Name")[0];
        await userEvent.clear(name);
        await userEvent.type(name, "John Example");
        await expect(name).toHaveValue("John Example");
        await expect(
          canvas.getByRole("textbox", { name: "CV YAML" }),
        ).toHaveTextContent("John Example");

        await userEvent.click(
          canvas.getByRole("button", { name: "Collapse all CV groups" }),
        );
        await expect(canvas.queryByLabelText("Email")).not.toBeInTheDocument();
        await userEvent.click(
          canvas.getByRole("button", { name: "Expand all CV groups" }),
        );
        await expect(canvas.getByLabelText("Email")).toBeVisible();
      },
    );

    await step(
      "Adds, reorders, and removes nested and section values",
      async () => {
        const networks = canvas.getByTestId("social-networks");
        await userEvent.click(
          within(networks).getByRole("button", { name: "Add" }),
        );
        await expect(
          within(networks).getAllByLabelText("Network"),
        ).toHaveLength(3);
        await userEvent.click(
          within(networks).getAllByRole("button", { name: "Move up" }).at(-1)!,
        );
        await userEvent.click(
          within(networks).getByRole("button", {
            name: "Remove social network 3",
          }),
        );
        await expect(
          within(networks).getAllByLabelText("Network"),
        ).toHaveLength(2);

        const targetRoles = canvas
          .getByLabelText("Target Roles 1")
          .closest<HTMLElement>('[data-ui-part="list-editor"]')!;
        await userEvent.click(
          within(targetRoles).getByRole("button", { name: "Add" }),
        );
        const newRole = canvas.getByLabelText("Target Roles 4");
        await userEvent.type(newRole, "Platform Director");
        await expect(newRole).toHaveValue("Platform Director");
        await userEvent.click(
          newRole
            .closest("[data-sortable-item]")!
            .querySelector<HTMLButtonElement>(
              'button[aria-label="Remove item"]',
            )!,
        );

        await userEvent.click(
          canvas.getByRole("button", { name: "Add New Section" }),
        );
        const title = canvas.getByLabelText("New section title");
        await userEvent.clear(title);
        await userEvent.type(title, "Story test section");
        await userEvent.click(canvas.getByRole("button", { name: /^Text$/ }));
        const textSections = canvas.getAllByTestId("cv-section-TextEntry");
        const addedSection = textSections.at(-1)!;
        addedSection.scrollIntoView({ block: "center" });
        await userEvent.click(
          within(addedSection).getByRole("button", { name: "Move section up" }),
        );
        await userEvent.click(
          within(addedSection).getByRole("button", { name: "Delete section" }),
        );
        await expect(
          canvas.queryByDisplayValue("Story test section"),
        ).not.toBeInTheDocument();
      },
    );

    await step(
      "Edits representative Design, Locale, and Settings controls",
      async () => {
        await userEvent.click(canvas.getByRole("tab", { name: "Design" }));
        const margin = canvas.getByLabelText("Top margin");
        await userEvent.type(margin, "1.5cm");
        await expect(margin).toHaveValue("1.5cm");

        await userEvent.click(canvas.getByRole("tab", { name: "Locale" }));
        const phrase = canvas.getByLabelText("Last updated in");
        await userEvent.clear(phrase);
        await userEvent.type(phrase, "Updated");
        await expect(phrase).toHaveValue("Updated");

        await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
        const pdfTitle = canvas.getByLabelText("PDF title");
        await userEvent.clear(pdfTitle);
        await userEvent.type(pdfTitle, "John Doe — CV");
        await expect(pdfTitle).toHaveValue("John Doe — CV");
      },
    );

    await step(
      "Round-trips valid YAML and preserves invalid YAML",
      async () => {
        const editor = canvas.getByRole("textbox", { name: "Settings YAML" });
        await userEvent.click(editor);
        replaceYaml(
          editor,
          "settings:\n  pdf_title: YAML title\n  extra_key: preserved\n",
        );

        await waitFor(() =>
          expect(canvas.getByLabelText("PDF title")).toHaveValue("YAML title"),
        );

        await userEvent.click(editor);
        replaceYaml(editor, "settings:\n  pdf_title: [broken\n");
        await waitFor(() =>
          expect(canvas.getByTestId("yaml-error")).toBeVisible(),
        );

        await expect(canvas.getByLabelText("PDF title")).toHaveValue(
          "YAML title",
        );
        await expect(
          canvas.getByRole("textbox", { name: "Settings YAML" }),
        ).toHaveTextContent("broken");
      },
    );

    await step("Resets to a deterministic sample state", async () => {
      const resetButton = canvas.getByRole("button", { name: "Reset sample" });
      await userEvent.click(resetButton);
      await waitFor(() =>
        expect(canvas.getByRole("tab", { name: "CV" })).toHaveAttribute(
          "data-state",
          "active",
        ),
      );
      await expect(canvas.getAllByDisplayValue("John Doe")[0]).toBeVisible();
      const shell = canvas.getByTestId("complete-cv-shell");
      await expect(shell.scrollWidth).toBeLessThanOrEqual(
        shell.clientWidth + 1,
      );
      await expect(
        canvasElement.querySelectorAll(
          '[data-ui-part="body"] > [data-ui-component="scroll-area"]',
        ),
      ).toHaveLength(0);
      await waitFor(() =>
        expect(
          canvas
            .getByTestId("structured-cv")
            .querySelector<HTMLElement>(
              '[data-ui-part="scroll-area-viewport"]',
            )!.scrollTop,
        ).toBe(0),
      );
      await expect(canvas.getByRole("tabpanel", { name: "CV" }).scrollTop).toBe(
        0,
      );
    });
  }}
>
  {#snippet template()}
    <CompleteCvForm />
  {/snippet}
</Story>
