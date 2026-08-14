import type { Preview } from "@storybook/svelte-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import "../src/storybook.css";
import { syncCatalogStoryLayout } from "../src/storybook/catalog-layout.js";
import { installFocusPrototypeGuard } from "./focus-prototype-guard";

// Guard Storybook 10.5 focus instrumentation before Docs/react-aria wraps it.
installFocusPrototypeGuard();

const preview: Preview = {
  tags: ["autodocs", "test"],
  globalTypes: {
    // Brand selection is independent from the light/dark colour mode.
    theme: {
      description: "Brand theme",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default" },
          { value: "lapis", title: "Lapis" },
        ],
        dynamicTitle: true,
      },
    },
    // colorMode is toggled by the manager TOOL in
    // manager-color-mode-toggle.tsx (single sun/moon button).
  },
  initialGlobals: {
    theme: "default",
    colorMode: "light",
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        default: "default",
        lapis: "lapis",
      },
      defaultTheme: "default",
      attributeName: "data-ui-theme",
    }),
    (story, context) => {
      // Re-apply if Storybook installed its accessor after the first attempt.
      installFocusPrototypeGuard();
      if (typeof document !== "undefined") {
        syncCatalogStoryLayout(document, context);
        document.documentElement.classList.toggle(
          "dark",
          context.globals.colorMode === "dark",
        );
      }
      return story();
    },
  ],
  parameters: {
    options: {
      storySort: {
        order: [
          "Specification",
          [
            "Introduction",
            "Architecture",
            "Package exports",
            "Styling and themes",
            "Tooling",
            "Shadcn",
            [
              "Actions and content",
              "Data and feedback",
              "Disclosure and navigation",
              "Forms",
              "Layout",
              "Overlays",
            ],
            "Forms",
            [
              "Core and orchestrators",
              "Inputs",
              "Layout",
              "Editors",
              "Review",
              "Examples",
            ],
            "Filter",
            "AI",
            "Diff",
            "Shell",
            "Workspace",
            ["Framework", "Components", "Panels", "Plugins"],
            "Storybook catalog",
            "Specification governance",
            "Verification",
          ],
          "Documentation",
          ["Welcome"],
          "*",
        ],
      },
    },
    a11y: {
      test: "error",
      context: {
        exclude: [".cm-gutters"],
      },
    },
    backgrounds: {
      disable: true,
    },
    // Brand switcher is owned by globalTypes.theme above; keep the addon
    // decorator for data-ui-theme without a second toolbar control.
    themes: {
      disable: true,
    },
    // Docs TOC (right rail): Installation / Structure / API headings from MDX + Markdown.
    docs: {
      toc: {
        headingSelector: "h2, h3",
        title: "On this page",
      },
    },
    layout: "fullscreen",
  },
};

export default preview;
