import type { Preview } from "@storybook/svelte-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { addons } from "storybook/preview-api";
import { EVENTS } from "../packages/storybook-addon-visual-delta/src/constants";
import {
  VISUAL_CAPTURE_READY_ATTR,
  VISUAL_CAPTURE_STEP_ATTR,
  setVisualCaptureUntilSession,
  slugifyStepLabel,
} from "../packages/storybook-addon-visual-delta/src/shared/interaction-capture";
import { afterPlayStep } from "../packages/storybook-addon-visual-delta/src/shared/visual-capture-step";
import { ensureOverlayChannel } from "../packages/storybook-addon-visual-delta/src/preview/overlay";
import "../src/storybook.css";
import { installFocusPrototypeGuard } from "./focus-prototype-guard";

// Guard Storybook 10.5 focus instrumentation before Docs/react-aria wraps it.
installFocusPrototypeGuard();
// Overlay SELECT must survive FORCE_REMOUNT — install before any play park.
ensureOverlayChannel();

/** Per-story named steps discovered during the current play run. */
const playStepsByStory = new Map<
  string,
  Array<{ label: string; stepId: string }>
>();

let runUntilListenerInstalled = false;

function ensureRunUntilListener() {
  if (runUntilListenerInstalled) return;
  runUntilListenerInstalled = true;
  ensureOverlayChannel();
  addons.getChannel().on(
    EVENTS.RUN_UNTIL_STEP,
    (payload: { storyId?: string; stepId?: string | null }) => {
      setVisualCaptureUntilSession(payload.stepId ?? null);
    },
  );
}

function emitPlaySteps(storyId: string) {
  const channel = addons.getChannel();
  channel.emit(EVENTS.PLAY_STEPS, {
    storyId,
    steps: [...(playStepsByStory.get(storyId) ?? [])],
  });
}

const preview: Preview = {
  tags: ["autodocs", "test"],
  globalTypes: {
    // addon-themes hides its switcher when only one brand exists; keep a
    // paintbrush toolbar so "default" is selectable (and extensible) today.
    theme: {
      description: "Brand theme",
      toolbar: {
        icon: "paintbrush",
        items: [{ value: "default", title: "default" }],
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
  /**
   * After each named `step()`, publish the label to Visual Delta and park when
   * `?visualCaptureUntil=` / session flag asks for that step id.
   */
  runStep: async (label, play, context) => {
    ensureRunUntilListener();
    if (typeof document !== "undefined") {
      document.documentElement.removeAttribute(VISUAL_CAPTURE_READY_ATTR);
    }
    const storyId = context.id;
    const stepId = slugifyStepLabel(label);
    if (storyId && stepId) {
      const list = playStepsByStory.get(storyId) ?? [];
      if (!list.some((step) => step.stepId === stepId)) {
        list.push({ label: label.trim() || stepId, stepId });
        playStepsByStory.set(storyId, list);
      }
      emitPlaySteps(storyId);
    }
    await play(context);
    await afterPlayStep(label, storyId);
    if (storyId) emitPlaySteps(storyId);
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        default: "default",
      },
      defaultTheme: "default",
      attributeName: "data-ui-theme",
    }),
    (story, context) => {
      ensureRunUntilListener();
      // Re-apply if Storybook installed its accessor after the first attempt.
      installFocusPrototypeGuard();
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle(
          "dark",
          context.globals.colorMode === "dark",
        );
        // Clear stale mid-play markers when the story remounts.
        document.documentElement.removeAttribute(VISUAL_CAPTURE_STEP_ATTR);
        document.documentElement.removeAttribute(VISUAL_CAPTURE_READY_ATTR);
      }
      // Reset discovered steps when navigating to a different story.
      if (context.id && !playStepsByStory.has(context.id)) {
        // Keep other stories' caches small — drop all but current.
        for (const key of playStepsByStory.keys()) {
          if (key !== context.id) playStepsByStory.delete(key);
        }
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
