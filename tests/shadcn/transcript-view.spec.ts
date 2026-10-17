import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, dark = false) {
  const id =
    "chat-transcript--full-conversation-with-context-tools-and-replies";
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story${dark ? "&globals=colorMode:dark" : ""}`,
  );
  await waitForVisualStoryFinished(page, id);
}

test("reply prose, quoted context and comments share transcript typography in both views", async ({
  page,
}) => {
  for (const dark of [false, true]) {
    await open(page, dark);
    const reply = page.locator(
      '[data-chat-item="demo-review:permissions/reply"]',
    );
    const body = reply
      .getByRole("textbox", { name: "Simulated review reply", exact: true })
      .locator(":scope > .cm-line")
      .first();
    const quote = reply.locator(".ui-transcript-comment-quote p").first();
    const comment = reply
      .locator(
        '.ui-transcript-comment-content [data-ui-component="chat-markdown"] p',
      )
      .first();
    for (const mode of ["Document", "Classic"]) {
      await page.getByRole("button", { name: mode, exact: true }).click();
      const expected = await body.evaluate((node) => {
        const s = getComputedStyle(node);
        return { size: s.fontSize, family: s.fontFamily, color: s.color };
      });
      for (const part of [quote, comment]) {
        await expect(part).toHaveCSS("font-size", expected.size);
        await expect(part).toHaveCSS("font-family", expected.family);
        await expect(part).toHaveCSS("color", expected.color);
      }
      const foreground = await page
        .locator('[data-ui-component="transcript"]')
        .evaluate((node) => getComputedStyle(node).color);
      await expect(body).toHaveCSS("color", foreground);
    }
  }
});

test("document and classic share the same captured readers, drafts and disclosures", async ({
  page,
}) => {
  await open(page);
  const root = page.locator('[data-ui-component="transcript"]');
  const classic = page.getByRole("button", { name: "Classic", exact: true });
  const document = page.getByRole("button", { name: "Document", exact: true });
  await expect(classic).toBeVisible();
  await expect(document).toHaveAttribute("aria-pressed", "true");
  const ids = await page
    .locator("[data-chat-item]")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-chat-item")),
    );
  const reader = page
    .locator('[data-chat-item="delta-0"]')
    .getByRole("textbox", { name: "User message", exact: true });
  const captured = await reader.locator(":scope > .cm-line").allTextContents();
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await root.evaluate((node) =>
    node.setAttribute("data-view-retained", "root"),
  );
  await reader.evaluate((node) =>
    node.setAttribute("data-view-retained", "capture"),
  );
  await input.evaluate((node) =>
    node.setAttribute("data-view-retained", "draft"),
  );
  await input.fill("A draft retained across both views.");
  await reader.locator(":scope > .cm-line").first().click();
  await page.keyboard.press("Home");
  await page.keyboard.type("Retain this inline review.");
  const comment = page
    .getByRole("textbox", { name: "Comment on User message", exact: true })
    .first();
  await expect(comment).toContainText("Retain this inline review.");
  await page.keyboard.press("Escape");
  const context = page.getByRole("button", {
    name: "Context delivery unknown",
    exact: true,
  });
  await context.click();
  await page
    .getByRole("button", { name: "Show raw context", exact: true })
    .click();
  const edit = page.locator('[data-chat-item="delta-19/group"]');
  await edit
    .getByRole("button", {
      name: "Hide captured file Sources/BedtimeCore/Schedule.swift",
      exact: true,
    })
    .click();
  const fold = edit.getByRole("button", {
    name: "Show captured file Sources/BedtimeCore/Schedule.swift",
    exact: true,
  });
  const composer = page.locator('[data-ui-component="markdown-composer"]');
  for (const [button, view, presentation] of [
    [classic, "classic", "framed"],
    [document, "document", "document"],
  ] as const) {
    await button.focus();
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(root).toHaveAttribute("data-conversation-view", view);
    await expect(composer).toHaveAttribute("data-presentation", presentation);
    await expect(root).toHaveAttribute("data-view-retained", "root");
    await expect(reader).toHaveAttribute("data-view-retained", "capture");
    await expect(input).toHaveAttribute("data-view-retained", "draft");
    await expect(input).toHaveText("A draft retained across both views.");
    await expect(comment).toContainText("Retain this inline review.");
    await expect(context).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("button", { name: "Show rendered context", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(fold).toHaveAttribute("aria-expanded", "false");
    await expect(
      edit.locator('[data-thread-id="demo-review:action"] [data-comment-id]'),
    ).toHaveCount(1);
    await expect(
      edit.locator('[data-thread-id="demo-review:action"]'),
    ).toContainText("keep the existing shutdown default");
    expect(
      await page
        .locator("[data-chat-item]")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("data-chat-item")),
        ),
    ).toEqual(ids);
    expect(await reader.locator(":scope > .cm-line").allTextContents()).toEqual(
      captured,
    );
    await expect(
      page.getByRole("region", { name: "Queued messages", exact: true }),
    ).toContainText("Demo queued message:");
  }
  await document.click();
  await expect(document).toHaveAttribute("aria-pressed", "true");
});

test("view changes defer until IME composition ends without replacing the composer", async ({
  page,
}) => {
  await open(page);
  const root = page.locator('[data-ui-component="transcript"]');
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  await input.fill("Draft before composition");
  await input.evaluate((node) => {
    node.setAttribute("data-ime-retained", "true");
    node.dispatchEvent(
      new CompositionEvent("compositionstart", { bubbles: true, data: "" }),
    );
  });
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await expect(root).toHaveAttribute("data-conversation-view", "document");
  await expect(
    page.locator('[data-ui-component="markdown-composer"]'),
  ).toHaveAttribute("data-presentation", "document");
  await input.evaluate((node) =>
    node.dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true, data: "" }),
    ),
  );
  await expect(root).toHaveAttribute("data-conversation-view", "classic");
  await expect(
    page.locator('[data-ui-component="markdown-composer"]'),
  ).toHaveAttribute("data-presentation", "framed");
  await expect(input).toHaveAttribute("data-ime-retained", "true");
  await expect(input).toHaveText("Draft before composition");
});
