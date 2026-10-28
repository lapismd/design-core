import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
async function open(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}

test("composer text starts near the leading edge in both presentations and viewport sizes", async ({
  page,
}) => {
  for (const id of [
    "chat-markdown-composer--custom-emoji",
    "chat-markdown-composer--document-reply",
  ]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, id);
    for (const width of [1440, 360]) {
      await page.setViewportSize({ width, height: 900 });
      const editor = page.getByRole("textbox", {
        name: "Message",
        exact: true,
      });
      await expect(editor).toBeVisible();
      await expect
        .poll(() =>
          editor.evaluate((content) => {
            const column = content.closest(".ui-markdown-composer__scroll")!;
            return (
              content.getBoundingClientRect().left -
              column.getBoundingClientRect().left
            );
          }),
        )
        .toBeLessThanOrEqual(24);
      await expect
        .poll(() =>
          editor.evaluate(
            (content) =>
              content.getBoundingClientRect().top -
              content.closest(".cm-scroller")!.getBoundingClientRect().top,
          ),
        )
        .toBeLessThanOrEqual(12);
    }
  }
});

test("document composition retains the public host height, transparent shell and stock Mira editor", async ({
  page,
}) => {
  await open(page, "chat-markdown-composer--document-reply");
  const composer = page.getByRole("group", {
    name: "Message composer",
    exact: true,
  });
  const editor = page.getByRole("textbox", { name: "Message", exact: true });
  // The public host defaults to 6rem; Mira owns the content inset and typography.
  const host = composer.locator(".ui-markdown-composer__editor.mira");
  await expect(host).toHaveCSS("min-height", "96px");
  expect((await host.boundingBox())!.height).toBeGreaterThanOrEqual(96);
  await expect(
    composer.locator(
      '[data-ui-component="ai-chat-composer"] > [data-ui-part="body"]',
    ),
  ).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(editor).toHaveCSS("font-size", "14px");
  await expect(editor).toHaveCSS("line-height", "22.4px");
  await expect
    .soft(composer.locator('[data-ui-component="avatar"]'))
    .toHaveCount(1);
  const controls = page.getByRole("group", {
    name: "Message formatting and actions",
    exact: true,
  });
  const input = await editor.boundingBox();
  const actions = await controls.boundingBox();
  expect.soft(actions!.y).toBeGreaterThanOrEqual(input!.y + input!.height);
  expect.soft(Math.abs(actions!.x - input!.x)).toBeLessThanOrEqual(4);
});

test("document draft first line is vertically centred with its avatar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1032, height: 988 });
  await open(page, "chat-markdown-composer--document-reply");
  const avatar = page.locator(
    '.ui-markdown-composer__avatar [data-ui-component="avatar"]',
  );
  const editor = page.getByRole("textbox", { name: "Message", exact: true });
  async function assertCentred() {
    const image = (await avatar.boundingBox())!;
    const line = (await editor.locator(".cm-line").first().boundingBox())!;
    expect(
      Math.abs(image.y + image.height / 2 - line.y - line.height / 2),
    ).toBeLessThanOrEqual(1);
  }
  await assertCentred();
  await editor.press("End");
  await editor.press("Enter");
  await editor.pressSequentially("A second line of this draft.");
  await assertCentred();
  await page.setViewportSize({ width: 360, height: 800 });
  await assertCentred();
});

test("reply preview appears above the editor and cancellation retains the draft and selection", async ({
  page,
}) => {
  await open(page, "chat-markdown-composer--document-reply");
  const reply = page.getByRole("group", {
    name: "Replying to Sam",
    exact: true,
  });
  await expect(reply).toContainText(
    "Please share the project update before Friday.",
  );
  const editor = page.getByRole("textbox", { name: "Message", exact: true });
  const node = await editor.elementHandle();
  // ComposerDrawer intentionally extends its decorative background behind the
  // composer body; the visible quote itself must stay above the editor.
  const quote = await reply
    .getByText("Please share the project update before Friday.", {
      exact: true,
    })
    .boundingBox();
  expect(quote!.y + quote!.height).toBeLessThanOrEqual(
    (await editor.boundingBox())!.y,
  );
  const snapshot = await page.getByTestId("draft-value").textContent();
  await page.getByRole("button", { name: "Select first word" }).click();
  await page.getByRole("button", { name: "Cancel reply", exact: true }).click();
  await expect(reply).toHaveCount(0);
  await expect(page.locator('[data-ui-part="drawer"]')).toHaveCount(0);
  await expect(editor).toBeFocused();
  expect(await node!.evaluate((element) => element.isConnected)).toBe(true);
  expect(await page.getByTestId("draft-value").textContent()).toBe(snapshot);
  await page.getByRole("button", { name: "Formatting options" }).click();
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(page.getByTestId("draft-value")).toHaveText(
    "**Draft** a **shared** message.",
  );
  await page.getByRole("button", { name: "Reply to Sam", exact: true }).click();
  await expect(reply).toBeVisible();
});

test("keyboard submission retains exact whitespace, failed drafts and newer edits", async ({
  page,
}) => {
  await open(page, "chat-markdown-composer--formatting-and-retained-drafts");
  const editor = page.getByRole("textbox", { name: "Message", exact: true });
  await editor.press("ControlOrMeta+a");
  await editor.pressSequentially("  Kept draft  ");
  await editor.press("Shift+Enter");
  await expect(page.getByTestId("draft-value")).toContainText("Kept draft");
  await expect
    .poll(() => page.getByTestId("draft-value").textContent())
    .toContain("\n");
  const snapshot = (await page.getByTestId("draft-value").textContent())!;
  expect(snapshot).toMatch(/^ {2}Kept draft {2}\n/);
  await editor.press("Enter");
  await expect
    .poll(() => page.getByTestId("submitted-value").textContent())
    .toBe(snapshot);
  await page.getByRole("button", { name: "Simulate failed delivery" }).click();
  await expect(page.getByRole("alert")).toContainText("Your draft is retained");
  await expect
    .poll(() => page.getByTestId("draft-value").textContent())
    .toBe(snapshot);
  await editor.press("End");
  await editor.pressSequentially("Newer edit");
  await editor.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
    keyCode: 229,
    bubbles: true,
    cancelable: true,
  });
  await expect
    .poll(() => page.getByTestId("submitted-value").textContent())
    .toBe(snapshot);
  await page
    .getByRole("button", { name: "Acknowledge submitted draft" })
    .click();
  await expect(page.getByTestId("draft-value")).toContainText("Newer edit");
});

test("presentation changes preserve reader identity and selection for formatting and emoji", async ({
  page,
}) => {
  await open(page, "chat-markdown-composer--formatting-and-retained-drafts");
  const editor = page.getByRole("textbox", { name: "Message", exact: true });
  const node = await editor.elementHandle();
  await editor.press("ControlOrMeta+a");
  await editor.pressSequentially("Draft a **shared** message.");
  await page.getByRole("button", { name: "Select first word" }).click();
  await page.getByRole("button", { name: "Switch presentation" }).click();
  expect(await node!.evaluate((element) => element.isConnected)).toBe(true);
  await page.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(page.getByTestId("draft-value")).toHaveText(
    "**Draft** a **shared** message.",
  );
  await editor.press("ControlOrMeta+a");
  await editor.pressSequentially("Draft a **shared** message.");
  await page.getByRole("button", { name: "Select first word" }).click();
  await page
    .getByRole("button", { name: "Hide formatting", exact: true })
    .click();
  await page.getByRole("button", { name: "Add emoji" }).click();
  await page
    .getByRole("button", { name: "React with fire", exact: true })
    .click();
  await expect(page.getByTestId("draft-value")).toHaveText(
    "🔥 a **shared** message.",
  );
});

test("document Enter inserts a line and modifier Enter submits while IME does not", async ({
  page,
}) => {
  await open(page, "chat-markdown-composer--document-reply");
  const editor = page.getByRole("textbox", { name: "Message", exact: true });
  await editor.press("ControlOrMeta+a");
  await editor.pressSequentially("Document reply");
  await editor.press("Enter");
  await expect(page.getByTestId("submitted-value")).toHaveText("(none)");
  await editor.dispatchEvent("keydown", {
    key: "Enter",
    code: "Enter",
    isComposing: true,
    keyCode: 229,
    bubbles: true,
    cancelable: true,
  });
  await expect(page.getByTestId("submitted-value")).toHaveText("(none)");
  const composedDraft = (await page.getByTestId("draft-value").textContent())!;
  expect(composedDraft).toMatch(/^Document reply\n/);
  await editor.press("ControlOrMeta+Enter");
  await expect
    .poll(() => page.getByTestId("submitted-value").textContent())
    .toBe(composedDraft);
});

test("message actions reveal through keyboard, keep the menu visible and restore focus", async ({
  page,
}) => {
  await open(page, "chat-message-actions--hover-and-keyboard-focus");
  const reply = page.getByRole("button", { name: "Reply", exact: true });
  const controls = page.getByRole("group", {
    name: "Actions for Sam's message",
  });
  await reply.focus();
  await expect(controls).toHaveCSS("opacity", "1");
  await reply.press("Enter");
  await expect(page.getByTestId("message-action-result")).toHaveText(
    "Reply requested",
  );
  const more = page.getByRole("button", { name: "More message actions" });
  await more.press("Enter");
  await expect(controls).toHaveCSS("opacity", "1");
  await expect(
    page.getByRole("menuitem", { name: /Edit message/ }),
  ).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();
});

test("touch actions remain visible and narrow composers fit without page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "chat-markdown-composer--narrow-composer");
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeVisible();
  await page.emulateMedia({ forcedColors: "active" });
  await expect(
    page.getByRole("button", { name: "Formatting options" }),
  ).toBeVisible();
  const touch = await page
    .context()
    .browser()!
    .newContext({
      viewport: { width: 360, height: 800 },
      isMobile: true,
      hasTouch: true,
    });
  const mobile = await touch.newPage();
  try {
    await mobile.goto(
      new URL(
        "/iframe.html?id=chat-message-actions--hover-and-keyboard-focus&viewMode=story",
        page.url(),
      ).href,
    );
    await waitForVisualStoryFinished(
      mobile,
      "chat-message-actions--hover-and-keyboard-focus",
    );
    await expect(
      mobile.getByRole("group", { name: "Actions for Sam's message" }),
    ).toHaveCSS("opacity", "1");
    await mobile.getByRole("button", { name: "Reply", exact: true }).tap();
    await expect(mobile.getByTestId("message-action-result")).toHaveText(
      "Reply requested",
    );
  } finally {
    await touch.close();
  }
});
