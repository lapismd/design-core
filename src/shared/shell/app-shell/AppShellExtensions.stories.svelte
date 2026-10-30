<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { AppShellRoot } from "./index.js";
  import Demo from "./AppShellExtensions.demo.svelte";
  import Lifetime from "./AppShellSurfaceLifetime.stories.fixture.svelte";
  import * as sources from "./AppShellExtensions.example-sources.js";

  const { Story } = defineMeta({
    title: "Shell/App Shell",
    component: AppShellRoot,
    // The compound family already has its canonical AppShell.mdx documentation.
    tags: ["!autodocs", "visual-pending"],
    parameters: {
      layout: "fullscreen",
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
    beforeEach: () => {
      const errors: string[] = [];
      const record = (event: ErrorEvent) => {
        if (event.message.includes("ResizeObserver loop"))
          errors.push(event.message);
      };
      window.addEventListener("error", record);
      return () => {
        window.removeEventListener("error", record);
        expect(errors).toEqual([]);
      };
    },
  });

  function part(canvasElement: HTMLElement, name: string): HTMLElement {
    const element = canvasElement.querySelector<HTMLElement>(
      `[data-ui-part="${name}"]`,
    );
    if (!element) throw new Error(`Missing shell part ${name}`);
    return element;
  }
</script>

<Story
  name="Surface owner teardown retains latest focus target"
  play={async ({ canvas }) => {
    await expect(
      canvas.findByRole("region", { name: "Owned preview" }),
    ).resolves.toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Change focus target" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove layer owner" }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "Latest focus target" }),
      ).toHaveFocus(),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  }}>{#snippet template()}<Lifetime />{/snippet}</Story
>

<Story
  name="Attached sidebars and independent outer rail"
  play={async ({ canvas, canvasElement }) => {
    const main = part(canvasElement, "main");
    const inspector = canvas.getByRole("complementary", {
      name: "Inspector",
    });
    const activity = canvas.getByRole("complementary", {
      name: "Activity",
    });
    const rail = canvas.getByRole("complementary", { name: "Tools rail" });
    await waitFor(() => expect(main).toHaveAttribute("data-joined-end"));
    await waitFor(() => expect(inspector).toHaveAttribute("data-joined-start"));
    await waitFor(() => expect(inspector).toHaveAttribute("data-joined-end"));
    await waitFor(() =>
      expect(activity).not.toHaveAttribute("data-joined-end"),
    );
    await waitFor(() => expect(rail).not.toHaveAttribute("data-joined-start"));
    expect(
      Math.abs(
        inspector.getBoundingClientRect().left -
          main.getBoundingClientRect().right,
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(
      canvas.getByRole("button", { name: "Close activity panel" }),
    );
    await waitFor(() =>
      expect(inspector).not.toHaveAttribute("data-joined-end"),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Open activity" }),
    );
    await waitFor(() => expect(inspector).toHaveAttribute("data-joined-end"));
    await userEvent.click(
      canvas.getByRole("button", { name: "Hide activity" }),
    );
    await waitFor(() =>
      expect(inspector).not.toHaveAttribute("data-joined-end"),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await waitFor(() =>
      expect(canvas.getByTestId("selected-tool")).toHaveTextContent("Search"),
    );
  }}>{#snippet template()}<Demo />{/snippet}</Story
>

<Story
  name="Responsive topbar body target"
  play={async ({ canvas, canvasElement }) => {
    const bar = part(canvasElement, "topbar");
    const input = canvas.getByRole("textbox", {
      name: "Document title",
    });
    await userEvent.clear(input);
    await userEvent.type(input, "Kept through resize");
    await userEvent.click(canvas.getByRole("button", { name: "Narrow shell" }));
    await waitFor(() => expect(bar).toHaveAttribute("data-placement", "body"));
    await waitFor(() =>
      expect(part(canvasElement, "topbar-target")).toContainElement(bar),
    );
    await waitFor(() => expect(input).toHaveValue("Kept through resize"));
    await userEvent.click(canvas.getByRole("button", { name: "Wide shell" }));
    await waitFor(() => expect(bar).toHaveAttribute("data-placement", "top"));
    await waitFor(() =>
      expect(canvas.getByTestId("outer-topbar-host")).toContainElement(bar),
    );
    await waitFor(() => expect(input).toHaveValue("Kept through resize"));
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll('[data-ui-part="topbar"]'),
      ).toHaveLength(1),
    );
  }}>{#snippet template()}<Demo />{/snippet}</Story
>

<Story
  name="Native topbar stays above the body"
  parameters={{
    docs: { source: { code: sources.Native, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Narrow shell" }));
    await waitFor(() =>
      expect(part(canvasElement, "root")).toHaveAttribute(
        "data-display-mode",
        "mobile",
      ),
    );
    await waitFor(() =>
      expect(part(canvasElement, "topbar")).toHaveAttribute(
        "data-placement",
        "top",
      ),
    );
    await waitFor(() =>
      expect(canvas.getByTestId("outer-topbar-host")).toContainElement(
        part(canvasElement, "topbar"),
      ),
    );
    await waitFor(() =>
      expect(part(canvasElement, "topbar-target")).toBeEmptyDOMElement(),
    );
  }}>{#snippet template()}<Demo nativeChrome />{/snippet}</Story
>

<Story
  name="Overlay page header body and footer"
  parameters={{
    docs: {
      source: { code: sources.ChildScroll, language: "tsx", type: "code" },
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const opener = canvas.getByRole("button", { name: "Open overlay page" });
    await userEvent.click(opener);
    const page = canvas.getByRole("region", {
      name: "Document review",
    });
    await waitFor(() => expect(page).toBeVisible());
    await waitFor(() =>
      expect(part(canvasElement, "main")).toHaveAttribute("inert"),
    );
    const footer = part(canvasElement, "surface-layer-footer");
    const body = part(canvasElement, "surface-layer-body");
    expect(body.contains(footer)).toBe(false);
    await userEvent.type(
      within(page).getByRole("textbox", { name: "Review draft" }),
      " edited",
    );
    await userEvent.click(
      within(page).getByRole("button", { name: "Review options" }),
    );
    await within(canvasElement.ownerDocument.body).findByText(
      "Escape closes these options first.",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page).toBeVisible());
    await userEvent.click(
      within(page).getByRole("button", { name: "Close Document review" }),
    );
    await waitFor(() => expect(opener).toHaveFocus());
    await waitFor(() =>
      expect(part(canvasElement, "main")).not.toHaveAttribute("inert"),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle page scroll owner" }),
    );
    await userEvent.click(opener);
    await waitFor(() =>
      expect(canvas.getByRole("textbox", { name: "Review draft" })).toHaveValue(
        "Retained overlay draft edited",
      ),
    );
    expect(
      part(canvasElement, "surface-layer-body").querySelector(
        '[data-ui-component="scroll-area"]',
      ),
    ).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Save review" }));
    await waitFor(() =>
      expect(canvas.getByTestId("saved-count")).toHaveTextContent("1"),
    );
  }}>{#snippet template()}<Demo />{/snippet}</Story
>

<Story
  name="Attached panels dark RTL"
  globals={{ colorMode: "dark" }}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() =>
      expect(part(canvasElement, "topbar-center").style.left).toMatch(/px$/),
    );
    await waitFor(() =>
      expect(
        part(canvasElement, "topbar-center").getBoundingClientRect().width,
      ).toBeGreaterThan(80),
    );
    const main = part(canvasElement, "main");
    const inspector = canvas.getByRole("complementary", {
      name: "Inspector",
    });
    await waitFor(() => expect(main).toHaveAttribute("data-joined-end"));
    expect(
      Math.abs(
        main.getBoundingClientRect().left -
          inspector.getBoundingClientRect().right,
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(canvas.getByRole("button", { name: "Narrow shell" }));
    await waitFor(() =>
      expect(part(canvasElement, "topbar")).toHaveAttribute(
        "data-placement",
        "body",
      ),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Open overlay page" }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("region", { name: "Document review" }),
      ).toBeVisible(),
    );
  }}>{#snippet template()}<Demo direction="rtl" />{/snippet}</Story
>
