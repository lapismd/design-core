import { expect, test } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

test("working shimmer respects motion and forced-colour preferences", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const id = "ai-chat-experimental-reasoning--working-status";
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
  const label = page.locator('[data-ui-part="reasoning-label"]');
  const icon = page.locator('[data-ui-part="reasoning-icon"]');
  await expect(label).toHaveCSS("animation-duration", "2s");
  await expect(label).toHaveCSS("opacity", "1");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(label).toHaveCSS("animation-name", "none");
  await expect(icon).toHaveCSS("animation-name", "none");
  await expect(label).toHaveCSS("background-image", "none");
  await expect(label).not.toHaveCSS(
    "-webkit-text-fill-color",
    "rgba(0, 0, 0, 0)",
  );

  await page.emulateMedia({
    reducedMotion: "no-preference",
    forcedColors: "active",
  });
  await expect(label).toHaveCSS("animation-name", "none");
  await expect(icon).toHaveCSS("animation-name", "none");
  await expect(label).toHaveCSS("background-image", "none");
  await expect(label).not.toHaveCSS(
    "-webkit-text-fill-color",
    "rgba(0, 0, 0, 0)",
  );
});
