import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  for (const colorMode of ["light", "dark"]) {
    test(`dialog contract at ${width}px in ${colorMode}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 640 });
      await page.goto(
        `/iframe.html?id=ui-forms-layout-dialog-frame--pointer-surface&viewMode=story&globals=colorMode:${colorMode}`,
      );
      const trigger = page.getByRole("button", { name: "Edit record" });
      await trigger.click();
      const dialog = page.getByRole("dialog", { name: "Edit record" });
      await expect(dialog.getByRole("banner")).toHaveCount(0);
      const field = dialog.getByRole("textbox", {
        name: "Field 1",
        exact: true,
      });
      const originalField = await field.elementHandle();
      await field.pressSequentially("Updated record");
      await expect(field).toHaveValue("Updated record");
      await expect(field).toBeFocused();
      expect(await originalField!.evaluate((el) => el.isConnected)).toBe(true);
      await expect(dialog.getByText("Editing Updated record")).toBeVisible();
      const close = dialog.getByRole("button", { name: "Close", exact: true });
      await dialog.getByRole("textbox").first().focus();
      await page.mouse.move(0, 0);
      const before = await close.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      await close.hover();
      await expect
        .poll(() =>
          close.evaluate((el) => getComputedStyle(el).backgroundColor),
        )
        .not.toBe(before);
      await expect(close).toHaveCSS("width", "32px");
      await expect(close.locator("svg")).toHaveCSS("width", "16px");
      await page.mouse.move(0, 0);
      await page.keyboard.press("Tab");
      await close.focus();
      await expect
        .poll(() => close.evaluate((el) => el.matches(":focus-visible")))
        .toBe(true);
      await expect
        .poll(() =>
          close.evaluate((el) => getComputedStyle(el).backgroundColor),
        )
        .not.toBe(before);
      const viewport = dialog.locator('[data-ui-part="scroll-area-viewport"]');
      const footer = dialog.locator('[data-ui-part="dialog-frame-footer"]');
      const footerBefore = await footer.boundingBox();
      await viewport.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await expect
        .poll(() => viewport.evaluate((el) => el.scrollTop))
        .toBeGreaterThan(0);
      expect((await footer.boundingBox())!.y).toBeCloseTo(footerBefore!.y, 0);
      const bounds = (await dialog.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(15);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 15);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(625);
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    });
  }
}

for (const colorMode of ["light", "dark"]) {
  test(`primitive default close contract in ${colorMode}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=shadcn-overlays-dialog--open-dialog&viewMode=story&globals=colorMode:${colorMode}`,
    );
    const dialog = page.getByRole("dialog", { name: "Edit profile" });
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    await dialog.getByRole("textbox").first().focus();
    await page.mouse.move(0, 0);
    const before = await close.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    await close.hover();
    await expect
      .poll(() => close.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(before);
    await expect(close).toHaveCSS("width", "32px");
    await expect(close.locator("svg")).toHaveCSS("width", "16px");
    await expect(dialog).toHaveCSS("max-width", "448px");
    await close.click();
    await expect(
      page.getByRole("button", { name: "Open Dialog" }),
    ).toBeFocused();
  });
}
