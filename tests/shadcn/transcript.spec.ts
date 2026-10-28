import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
async function open(
  page: Page,
  scenario = "continuous-document",
  dark = false,
) {
  const id = `chat-transcript--${scenario}`;
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story${dark ? "&globals=colorMode:dark" : ""}`,
  );
  await waitForVisualStoryFinished(page, id);
  await expect(page.locator('[data-ui-component="transcript"]')).toBeVisible();
}
test("retains jj-store document geometry and exact numbered capture", async ({
  page,
}) => {
  await open(page);
  const geometry = await page
    .locator(".ui-transcript-message")
    .first()
    .evaluate((node) => {
      const style = getComputedStyle(node);
      const avatar = node.querySelector('[data-ui-component="avatar"]')!;
      return {
        columns: style.gridTemplateColumns,
        gap: style.gap,
        avatar: avatar.getBoundingClientRect().width,
      };
    });
  expect(geometry.avatar).toBe(24);
  expect(geometry.gap).toBe("8px");
  expect(geometry.columns.split(" ")[0]).toBe("24px");
  const input = page.getByRole("textbox", {
    name: "src/settings.ts",
    exact: true,
  });
  await expect(input).toBeVisible();
  await expect(page.locator(".ui-transcript-capture-gutter")).toContainText(
    "90",
  );
  await expect(input).toHaveAttribute("aria-readonly", "true");
  await page.screenshot({ path: "/tmp/dc-transcript-document-review.png" });
});
test("typing and paste create comments without changing captured text", async ({
  page,
}) => {
  await open(page);
  const reader = page.getByRole("textbox", {
    name: "Implementation summary",
    exact: true,
  });
  const text = await reader.locator(":scope > .cm-line").allTextContents();
  await reader.click();
  await page.keyboard.press("Home");
  await page.keyboard.type("Review this");
  const editors = page.getByRole("textbox", {
    name: "Comment on Implementation summary",
    exact: true,
  });
  await expect(editors.first()).toContainText("Review this");
  await expect(
    page
      .locator(".ui-transcript-comment-content .ui-comment-composer__card")
      .first(),
  ).toHaveCSS("padding", "0px");
  await expect(
    page
      .locator(".ui-transcript-comment-content .ui-comment-composer__card")
      .first(),
  ).toHaveCSS("border-width", "0px");
  expect(await reader.locator(":scope > .cm-line").allTextContents()).toEqual(
    text,
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("group", { name: "Pending comments", exact: true }),
  ).toBeVisible();
  await reader.click();
  await reader.evaluate((node) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "Pasted café 👩🏽‍💻");
    node.dispatchEvent(
      new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData,
      }),
    );
  });
  await expect(editors.first()).toContainText("Pasted café 👩🏽‍💻");
  expect(await reader.locator(":scope > .cm-line").allTextContents()).toEqual(
    text,
  );
});
test("comments-only acknowledgement retains delivered text and uses source navigation", async ({
  page,
}) => {
  await open(page, "inline-comments-and-queue");
  // The story has acknowledged its initial comment; create another exact-anchor draft.
  const reader = page.getByRole("textbox", {
    name: "Implementation summary",
    exact: true,
  });
  await reader.locator(":scope > .cm-line").first().click();
  await page.keyboard.press("Control+Alt+m");
  const input = page
    .getByRole("textbox", {
      name: "Comment on Implementation summary",
      exact: true,
    })
    .first();
  await expect(input).toBeVisible();
  await input.fill("A second comment");
  await page.locator(".ui-comment-composer__card").last().hover();
  await page
    .getByRole("button", {
      name: "Go to source: Implementation summary",
      exact: true,
    })
    .last()
    .click();
  await expect(reader).toBeFocused();
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByTestId("transcript-result")).toHaveText(
    "1 comments submitted",
  );
  await expect(
    page.getByRole("img", { name: "Sent", exact: true }).first(),
  ).toBeVisible();
});
test("changed revisions preserve exact quotes and unavailable explanation", async ({
  page,
}) => {
  await open(page, "changed-source-retains-quote");
  await expect(
    page.getByText("Original content unavailable or changed.").first(),
  ).toBeVisible();
  await expect(page.locator("[data-chat-quote]").first()).toHaveAttribute(
    "data-chat-quote",
    "workspace settings",
  );
  await page.screenshot({ path: "/tmp/dc-transcript-comments-review.png" });
});
test("streaming and history retain reader identity and viewport anchors", async ({
  page,
}) => {
  await open(page);
  const reader = page.getByRole("textbox", {
    name: "Implementation summary",
    exact: true,
  });
  await reader.evaluate((node) =>
    node.setAttribute("data-retained-reader", "original"),
  );
  const viewport = page.locator(
    '.ui-transcript-viewport > [data-ui-part="scroll-area-viewport"]',
  );
  await viewport.evaluate((node) => {
    node.scrollTop = 50;
  });
  await expect
    .poll(() => viewport.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0);
  const before = await reader.boundingBox();
  await page
    .getByRole("button", { name: "Prepend history", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Earlier message", exact: true }),
  ).toBeVisible();
  await expect(reader).toHaveAttribute("data-retained-reader", "original");
  await expect
    .poll(async () => Math.abs((await reader.boundingBox())!.y - before!.y))
    .toBeLessThan(3);
  await page
    .getByRole("button", { name: "Stream update", exact: true })
    .click();
  await expect(reader).toHaveAttribute("data-retained-reader", "original");
});
test("raw/formatted transitions and folds preserve captured source and keyboard controls", async ({
  page,
}) => {
  await open(page, "large-folded-capture");
  // Large captures expose the reference's middle-fold control.
  await expect(page.locator("[data-chat-fold-control]").first()).toBeVisible();
  await page.locator("[data-chat-fold-control]").first().click();
  await expect(
    page.getByRole("textbox", { name: "src/settings.ts", exact: true }).last(),
  ).toContainText("line40");
  await page
    .getByRole("button", {
      name: "Show details for Read src/settings.ts",
      exact: true,
    })
    .click();
  const raw = page.getByRole("button", {
    name: "Show raw output for Read src/settings.ts",
    exact: true,
  });
  await raw.focus();
  await raw.press("Enter");
  await expect(
    page.getByRole("textbox", {
      name: "Raw captured data for Read src/settings.ts",
      exact: true,
    }),
  ).toContainText('"captured":true');
});
test("unknown and rejected delivery leave drafts visible", async ({ page }) => {
  for (const scenario of [
    "unknown-submission-retains-identity",
    "rejected-submission-retains-drafts",
  ]) {
    await open(page, scenario);
    const reader = page.getByRole("textbox", {
      name: "Implementation summary",
      exact: true,
    });
    await reader.click();
    await page.keyboard.press("Control+Alt+m");
    await page
      .getByRole("textbox", {
        name: "Comment on Implementation summary",
        exact: true,
      })
      .first()
      .fill("Keep my draft");
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await expect(
      page.getByRole("group", { name: "Pending comments", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Keep my draft").first()).toBeVisible();
  }
});
test("narrow, dark, reduced-motion and forced-colors retain bounded keyboard navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "narrow-document", true);
  await expect(page.locator("html")).toHaveClass(/dark/);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page
    .getByRole("button", { name: "Preview turn 1", exact: true })
    .focus();
  await expect(
    page.getByRole("group", { name: "Turn summary", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Preview turn 1", exact: true }),
  ).toBeFocused();
});

test("IME creates one comment and teardown preserves the host-owned draft", async ({
  page,
}) => {
  await open(page);
  const reader = page.getByRole("textbox", {
    name: "Implementation summary",
    exact: true,
  });
  await reader.locator(":scope > .cm-line").first().click();
  await reader.evaluate((node) => {
    node.dispatchEvent(
      new CompositionEvent("compositionstart", { bubbles: true, data: "" }),
    );
    node.dispatchEvent(
      new CompositionEvent("compositionend", { bubbles: true, data: "かな" }),
    );
  });
  await expect(
    page
      .getByRole("textbox", {
        name: "Comment on Implementation summary",
        exact: true,
      })
      .first(),
  ).toHaveText("かな");
  await page
    .getByRole("button", { name: "Toggle transcript", exact: true })
    .click();
  await expect(page.locator('[data-ui-component="transcript"]')).toHaveCount(0);
  await page
    .getByRole("button", { name: "Toggle transcript", exact: true })
    .click();
  await expect(
    page.getByRole("group", { name: "Pending comments", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("textbox", {
        name: "Comment on Implementation summary",
        exact: true,
      })
      .first(),
  ).toHaveText("かな");
});

test("reply navigation focuses the host supplied destination", async ({
  page,
}) => {
  await open(page, "reply-destinations");
  const jump = page
    .getByRole("button", { name: "Go to reply", exact: true })
    .first();
  await jump.click();
  await expect(page.locator('[data-chat-item="comment-reply"]')).toBeFocused();
});
test("custom sections use the current capture after a host update", async ({
  page,
}) => {
  await open(page, "custom-section-comments");
  await page
    .getByRole("button", { name: "Stream update", exact: true })
    .click();
  const section = page.getByRole("group", {
    name: "Implementation summary",
    exact: true,
  });
  await section.focus();
  await page.keyboard.press("Control+Alt+m");
  await page
    .getByRole("textbox", {
      name: "Comment on Implementation summary",
      exact: true,
    })
    .first()
    .fill("Whole section");
  await expect(
    page.locator("[data-chat-pending] [data-chat-quote]").first(),
  ).toHaveAttribute(
    "data-chat-quote",
    /A streamed update retains the same reader/,
  );
});

test("rendered comments retain jj-store spacing without an extra Markdown inset", async ({
  page,
}) => {
  await open(page, "inline-comments-and-queue");
  const reader = page.getByRole("textbox", {
    name: "Implementation summary",
    exact: true,
  });
  await expect(reader).toHaveCSS("padding", "0px");
  await expect(reader.locator(":scope > .cm-line").first()).toHaveCSS(
    "padding",
    "0px",
  );
  const content = page
    .locator(
      '.ui-transcript-comment-content [data-ui-component="chat-markdown"]',
    )
    .first();
  await expect(content).toHaveCSS("padding", "0px");
  await page.screenshot({ path: "/tmp/dc-transcript-padding-after.png" });
  const preview = content.locator(".ui-chat-markdown-preview");
  await expect(preview).toHaveCSS("padding", "0px");
  await expect(preview).toHaveCSS("line-height", "21px");
  await expect(preview).toHaveCSS("font-size", "14px");
  const stockGap = await preview.evaluate(
    (node) => getComputedStyle(node).rowGap,
  );
  const stockParagraphMargins = await preview
    .locator("p")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        start: getComputedStyle(node).marginBlockStart,
        end: getComputedStyle(node).marginBlockEnd,
      })),
    );
  // Exercise actual published Mira defaults arriving after the shared family CSS.
  const styles = pathToFileURL(
    createRequire(import.meta.url).resolve("@lapismd/mira/styles.css"),
  );
  await page.addStyleTag({
    content: await readFile(
      new URL("./preview/styles/surfaces.css", styles),
      "utf8",
    ),
  });
  await expect(content).toHaveCSS("padding", "0px");
  await expect(preview).toHaveCSS("padding", "0px");
  await expect(preview).toHaveCSS("row-gap", stockGap);

  expect(
    await preview.locator("p").evaluateAll((nodes) =>
      nodes.map((node) => ({
        start: getComputedStyle(node).marginBlockStart,
        end: getComputedStyle(node).marginBlockEnd,
      })),
    ),
  ).toEqual(stockParagraphMargins);
});

test("embedded comments inherit the host palette across Mira reader boundaries", async ({
  page,
}) => {
  await open(page, "inline-comments-and-queue");
  const expected = await page
    .locator(".transcript-fixture")
    .evaluate((el) => getComputedStyle(el).color);
  const paragraph = page.locator(".ui-transcript-comment-content p").first();
  await expect(paragraph).toHaveCSS("color", expected);
  await expect(paragraph).toHaveCSS("font-size", "14px");
});

test("closing a host inspector restores navigation to the mounted transcript", async ({
  page,
}) => {
  await open(page, "inspector-reader-lifecycle");
  const source = page
    .locator('[data-ui-component="transcript"]')
    .getByRole("group", { name: "Implementation summary", exact: true });
  await source.focus();
  await page.keyboard.press("Control+Alt+m");
  await page
    .getByRole("textbox", {
      name: "Comment on Implementation summary",
      exact: true,
    })
    .first()
    .fill("Keep source navigation");
  await page
    .getByRole("button", { name: "Open source inspector", exact: true })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Source inspector", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("complementary", { name: "Source inspector", exact: true })
      .locator('[data-ui-component="chat-markdown"]')
      .first(),
  ).toHaveCSS("padding", "0px");
  await page
    .getByRole("button", { name: "Close source inspector", exact: true })
    .click();
  await page.locator(".ui-comment-composer__card").last().hover();
  await page
    .getByRole("button", {
      name: "Go to source: Implementation summary",
      exact: true,
    })
    .last()
    .click();
  await expect(source).toBeFocused();
});
