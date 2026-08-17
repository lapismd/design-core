import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { sliderTokenNames } from "./slider.tokens.js";

const here = path.dirname(fileURLToPath(import.meta.url));

describe("slider tokens", () => {
  it("paints the thumb through a documented token with a white fallback", () => {
    const css = readFileSync(path.join(here, "slider.tokens.css"), "utf8");
    const source = readFileSync(path.join(here, "slider.svelte"), "utf8");
    const theme = readFileSync(
      path.resolve(here, "../../../theme.css"),
      "utf8",
    );
    const rootBlock = theme.slice(
      theme.indexOf(":root {"),
      theme.indexOf("@theme inline"),
    );

    expect(css).toContain(`${sliderTokenNames.thumbBackground}:`);
    expect(source).toContain(`var(\n        ${sliderTokenNames.thumbBackground},`);
    expect(source).toContain("var(--color-white, #ffffff)");
    expect(rootBlock).toContain("--color-white: #ffffff;");
    expect(rootBlock).toContain("--color-black: #000000;");
  });
});
