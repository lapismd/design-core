import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
async function open(
  page: Page,
  id = "chat-comment-composer--code-selection-reply",
) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}
test("quotes and comment inputs preserve jj-store typography", async ({
  page,
}) => {
  await open(page);
  const family = await page
    .locator(".ui-comment-composer")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  const quote = page.locator(".ui-comment-composer__quote > code");
  await expect(quote).toHaveCSS("font-family", family);
  await expect(quote).toHaveCSS("font-size", "14px");
  await expect(quote).toHaveCSS("line-height", "21px");
  const input = page.getByRole("textbox", {
    name: "Comment on .gitignore",
    exact: true,
  });
  await expect(input).toHaveCSS("font-family", family);
  await expect(input).toHaveCSS("font-size", "16px");
  await expect(input).toHaveCSS("line-height", "24px");
  await open(page, "chat-comment-composer--markdown-selection");
  await expect(page.locator(".ui-comment-composer__quote strong")).toHaveCSS(
    "font-size",
    "14px",
  );
  await expect(
    page.getByRole("textbox", {
      name: "Comment on Project update",
      exact: true,
    }),
  ).toHaveCSS("font-size", "16px");
});
test("compact comment geometry aligns the draft with its avatar", async ({
  page,
}) => {
  await open(page);
  const card = (await page
    .locator(".ui-comment-composer__card")
    .boundingBox())!;
  const avatar = (await page
    .locator('[data-ui-component="avatar"]')
    .boundingBox())!;
  const line = (await page
    .getByRole("textbox", { name: "Comment on .gitignore", exact: true })
    .locator(".cm-line")
    .first()
    .boundingBox())!;
  expect.soft(card.height).toBeLessThanOrEqual(60);
  expect
    .soft(Math.abs(avatar.y + avatar.height / 2 - line.y - line.height / 2))
    .toBeLessThanOrEqual(1);
  expect.soft(line.x - avatar.x - avatar.width).toBeLessThanOrEqual(16);
});
test("comment keyboard intent retains exact whitespace, multiline drafts and IME input", async ({
  page,
}) => {
  await open(page);
  const editor = page.getByRole("textbox", {
    name: "Comment on .gitignore",
    exact: true,
  });
  await editor.press("ControlOrMeta+a");
  await editor.pressSequentially("  Retained comment  ");
  await editor.press("Enter");
  const snapshot = (await page.getByTestId("comment-draft").textContent())!;
  expect(snapshot).toMatch(/^ {2}Retained comment {2}\n/);
  await expect(page.getByTestId("comment-submitted")).toHaveText("(none)");
  await editor.press("ControlOrMeta+Enter");
  await expect
    .poll(() => page.getByTestId("comment-submitted").textContent())
    .toBe(snapshot);
  expect(await page.getByTestId("comment-draft").textContent()).toBe(snapshot);
  await editor.pressSequentially("Newer note");
  await editor.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    ctrlKey: true,
    keyCode: 229,
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  expect(await page.getByTestId("comment-submitted").textContent()).toBe(
    snapshot,
  );
  await editor.press("Escape");
  await expect(page.getByTestId("comment-result")).toHaveText(
    "Dismiss requested; draft retained",
  );
  await expect(page.getByTestId("comment-draft")).toContainText("Newer note");
});
test("source changes preserve editor and selection, quotes remain exact, and narrow cards fit", async ({
  page,
}) => {
  await open(page);
  const editor = page.getByRole("textbox", {
    name: "Comment on .gitignore",
    exact: true,
  });
  const node = await editor.elementHandle();
  await editor.press("ControlOrMeta+a");
  await page.getByRole("button", { name: "Switch source context" }).click();
  expect(
    await page.locator(".ui-comment-composer__quote > code").textContent(),
  ).toBe("const café = '🦀';\n  return café;");
  expect(await node!.evaluate((element) => element.isConnected)).toBe(true);
  const current = page.getByRole("textbox", {
    name: "Comment on Selected code",
    exact: true,
  });
  await current.pressSequentially("Replacement");
  await expect(page.getByTestId("comment-draft")).toHaveText("Replacement");
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  const remove = page.getByRole("button", {
    name: "Remove comment",
    exact: true,
  });
  await remove.focus();
  await expect(page.locator(".ui-comment-composer__actions")).toHaveCSS(
    "opacity",
    "1",
  );
  await remove.press("Enter");
  await expect(page.getByTestId("comment-result")).toHaveText(
    "Removal requested",
  );
  await expect(page.getByTestId("comment-draft")).toHaveText("Replacement");
});
