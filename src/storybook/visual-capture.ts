/**
 * Opt-in mid-play visual capture helper for catalog stories.
 * Re-exports the Visual Delta addon helper so stories do not depend on
 * package export subpaths that Vite may not resolve in Storybook.
 */
export {
  afterPlayStep,
  visualCapture,
} from "@lapismd/storybook-addon-visual-delta/visual-capture";
