import { expect, test } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

for (const colorMode of ["light", "dark"] as const) {
  test(`file path focus surrounds input and Browse in ${colorMode} and forced colors`, async ({
    page,
  }) => {
    const id = "ui-forms-file-path-input--select-and-cancel";
    await page.goto(
      `/iframe.html?id=${id}&viewMode=story&globals=colorMode:${colorMode}`,
    );
    await waitForVisualStoryFinished(page, id);
    const group = page.getByRole("group", { name: "Model file" });
    const input = group.getByRole("textbox");
    const browse = group.getByRole("button", { name: "Browse Model file" });
    const initialBounds = await group.boundingBox();
    await input.focus();
    await expect(group).toHaveCSS("box-shadow", /3px/);
    await expect(input).toHaveCSS("box-shadow", "none");
    const ring = await group.evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    await page.keyboard.press("Tab");
    await expect(browse).toBeFocused();
    await expect(group).toHaveCSS("box-shadow", ring);
    await expect(browse).toHaveCSS("box-shadow", "none");
    expect(await group.boundingBox()).toEqual(initialBounds);
    await page.keyboard.press("Shift+Tab");
    await expect(input).toBeFocused();
    await expect(group).toHaveCSS("box-shadow", ring);
    await page.emulateMedia({ forcedColors: "active" });
    await expect(group).toHaveCSS("outline-style", "solid");
    await expect(group).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Tab");
    await expect(browse).toBeFocused();
    await expect(group).toHaveCSS("outline-width", "2px");
    await page.keyboard.press("Tab");
    await expect(group).toHaveCSS("outline-style", "none");
    await expect(group).toHaveCSS("box-shadow", "none");
  });
}
