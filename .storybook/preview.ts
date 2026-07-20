import type { Preview } from "@storybook/svelte-vite";
import "../src/storybook.css";
import { installFocusPrototypeGuard } from "./focus-prototype-guard";

// Guard Storybook 10.5 focus instrumentation before Docs/react-aria wraps it.
installFocusPrototypeGuard();

const preview: Preview = {
  tags: ["autodocs", "test"],
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        icon: "paintbrush",
        items: ["light", "dark"],
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (story, context) => {
      // Re-apply if Storybook installed its accessor after the first attempt.
      installFocusPrototypeGuard();
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle(
          "dark",
          context.globals.theme === "dark",
        );
      }
      return story();
    },
  ],
  parameters: {
    a11y: {
      test: "error",
      context: {
        exclude: [".cm-gutters"],
      },
    },
    backgrounds: {
      disable: true,
    },
    layout: "fullscreen",
  },
};

export default preview;
