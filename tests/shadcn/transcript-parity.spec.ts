import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page) {
  const id =
    "chat-transcript--full-conversation-with-context-tools-and-replies";
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}

test("reply participants use compact shared avatars without nested controls", async ({
  page,
}) => {
  await open(page);
  for (const view of ["Document", "Classic"]) {
    await page.getByRole("button", { name: view, exact: true }).click();
    const replies = page
      .locator('[data-chat-item="delta-0"]')
      .getByRole("button", { name: "2 replies", exact: true });
    const group = replies
      .locator("..")
      .locator('[data-ui-component="avatar-group"]');
    await expect(group).toHaveAttribute("data-size", "xs");
    expect(
      await replies.locator('[data-ui-component="avatar-group"]').count(),
    ).toBe(0);
    await expect(group).toHaveAttribute("aria-label", "Reply participants");
    await expect(group.locator('[data-ui-component="avatar"]')).toHaveCount(2);
    await expect(group.getByRole("button")).toHaveCount(2);
    await expect(group.locator("button button")).toHaveCount(0);
    const dimensions = await group
      .locator('[data-ui-component="avatar"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height,
        })),
      );
    expect(dimensions).toEqual([
      { width: 20, height: 20 },
      { width: 20, height: 20 },
    ]);
    await replies.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("Open replies for");
  }
});

test("sent comments edit through acknowledged versioned drafts and expose message metadata", async ({
  page,
}) => {
  const id = "chat-transcript--editable-comments-and-metadata";
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
  const prompt = page.locator('[data-chat-item="prompt"]');
  await expect(prompt.getByText("Edited", { exact: true })).toBeVisible();
  await expect(prompt.locator("time")).toHaveAttribute(
    "datetime",
    "2026-10-08T12:00:00Z",
  );
  await prompt.getByRole("button", { name: "2 replies", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Open replies for Request",
  );
  const original = page.locator('[data-comment-id="editable-comment"]').first();
  await original.hover();
  await original
    .getByRole("button", { name: "Edit comment", exact: true })
    .click();
  const editor = page
    .getByRole("textbox", {
      name: "Comment on Implementation summary",
      exact: true,
    })
    .first();
  await expect(editor).toContainText(
    "Review the schedule before changing defaults.",
  );
  await editor.fill("Updated review with an exact version.");
  await expect(original).toContainText(
    "Review the schedule before changing defaults.",
  );
  await editor.press("ControlOrMeta+Enter");
  await expect(page.getByRole("status")).toContainText("1 comments submitted");
  await expect(original).toHaveCount(0);
  const replacement = page
    .getByRole("article", { name: "Comment by Alex Morgan" })
    .first();
  await expect(replacement).toContainText(
    "Updated review with an exact version.",
  );
  await replacement.hover();
  await expect(
    replacement.getByRole("button", { name: "Edit comment", exact: true }),
  ).toBeVisible();
});

test("reply contexts have one padded border around their quote and comments", async ({
  page,
}) => {
  await open(page);
  const context = page
    .locator(".ui-transcript-reply-context .ui-transcript-comment-context")
    .first();
  const shell = await context.evaluate((node) =>
    [node, node.firstElementChild!].map((part) => {
      const style = getComputedStyle(part);
      return {
        padding: parseFloat(style.paddingTop),
        border: parseFloat(style.borderTopWidth),
      };
    }),
  );
  expect(shell.reduce((sum, part) => sum + part.padding, 0)).toBe(8);
  expect(shell.reduce((sum, part) => sum + part.border, 0)).toBe(1);
});

test("jump to end focuses the retained composer in both views", async ({
  page,
}) => {
  await open(page);
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  for (const mode of ["Document", "Classic"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await page
      .getByRole("button", { name: "Jump to end", exact: true })
      .click();
    await expect(input).toBeFocused();
    await page
      .getByRole("button", { name: "Jump to end", exact: true })
      .focus();
    await page.keyboard.press("Control+ArrowDown");
    await expect(input).toBeFocused();
  }
});

test("classic puts the author above the body without replacing captured readers", async ({
  page,
}) => {
  await open(page);
  const message = page.locator('[data-chat-item="delta-0"]');
  const reader = message.getByRole("textbox", {
    name: "User message",
    exact: true,
  });
  await reader.evaluate((node) =>
    node.setAttribute("data-parity-reader", "retained"),
  );
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  const heading = message.locator(".ui-transcript-message-author");
  await expect(heading).toBeVisible();
  expect((await heading.boundingBox())!.y).toBeLessThan(
    (await reader.boundingBox())!.y,
  );
  await expect(reader).toHaveAttribute("data-parity-reader", "retained");
  await page.getByRole("button", { name: "Document", exact: true }).click();
  await expect(heading).toHaveCount(0);
  await expect(reader).toHaveAttribute("data-parity-reader", "retained");
});

test("document prompt aligns its first line with the avatar centre", async ({
  page,
}) => {
  await open(page);
  const message = page.locator('[data-chat-item="delta-0"]');
  const avatar = message.locator('[data-ui-component="avatar"]').first();
  const line = message
    .getByRole("textbox", { name: "User message", exact: true })
    .locator(".cm-line")
    .first();
  const image = (await avatar.boundingBox())!;
  const text = (await line.boundingBox())!;
  // A CodeMirror logical line can wrap; compare its first visual line.
  const lineHeight = await line.evaluate((node) =>
    parseFloat(getComputedStyle(node).lineHeight),
  );
  expect(
    Math.abs(image.y + image.height / 2 - text.y - lineHeight / 2),
  ).toBeLessThanOrEqual(1);
});

test("composer keeps multiline Enter and docks formatting actions in the fixed footer", async ({
  page,
}) => {
  await open(page);
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  for (const mode of ["Document", "Classic"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await input.fill("First line");
    await input.press("End");
    await input.press("Enter");
    await input.pressSequentially("Second line");
    await expect(input).toContainText("First line");
    await expect(input).toContainText("Second line");
  }
  await page.getByRole("button", { name: "Document", exact: true }).click();
  const footer = page.locator('[data-ui-component="transcript-footer"]');
  await expect(
    footer.getByRole("button", { name: "Formatting options" }),
  ).toBeVisible();
  await expect(
    footer.getByRole("button", { name: "Add emoji", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", {
      name: "Message formatting and actions",
      exact: true,
    }),
  ).toHaveCount(1);
  await input.fill("Retained formatting selection");
  await input.press("ControlOrMeta+a");
  await footer.getByRole("button", { name: "Formatting options" }).click();
  await footer.getByRole("button", { name: "Bold", exact: true }).click();
  await expect(input).toContainText("**Retained formatting selection**");
});

test("reply link decoration stays on the label and never crosses the avatars", async ({
  page,
}) => {
  await open(page);
  for (const mode of ["Document", "Classic"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    const replies = page
      .getByRole("button", { name: "2 replies", exact: true })
      .first();
    await replies.hover();
    await expect(replies).toHaveCSS("text-decoration-line", "none");
    await expect(
      replies.locator(".ui-transcript-message-reply-label"),
    ).toHaveCSS("text-decoration-line", "underline");
    await expect(
      replies.locator("..").locator('[data-ui-component="avatar-group"]'),
    ).toHaveCSS("text-decoration-line", "none");
    await expect(replies.locator("button, a[href], [tabindex]")).toHaveCount(0);
  }
});
