import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
async function open(page: Page, id: string) {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==",
  "base64",
);
const image = (name: string) => ({ name, mimeType: "image/png", buffer: png });

test("responsive tabs retain selection through keyboard overflow and resizing", async ({
  page,
}) => {
  await open(page, "shadcn-navigation-responsive-tabs--resize-and-overflow");
  await page.getByRole("button", { name: "Menu only", exact: true }).click();
  const more = page.getByRole("button", { name: "More project sections" });
  await expect(page.getByRole("tab")).toHaveCount(0);
  await more.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "Documents", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("selected-tab")).toHaveText("documents");
  await expect(more).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: "Wide", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Documents", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Documents" })).toBeVisible();
});

test("avatar uploads cannot overwrite newer files or a pasted URL and failures retain the choice", async ({
  page,
}) => {
  await open(page, "ui-forms-avatar-picker--host-upload-lifecycle");
  const trigger = page.getByRole("button", { name: "Choose avatar" });
  await trigger.click();
  await page
    .getByLabel("Upload avatar image")
    .setInputFiles(image("first.png"));
  await expect(
    page.getByRole("status").filter({ hasText: "Preparing avatar" }),
  ).toBeVisible();
  await page
    .getByLabel("Upload avatar image")
    .setInputFiles(image("second.png"));
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Complete oldest upload" }).click();
  await expect(page.getByTestId("avatar-value")).toHaveText(
    "No avatar selected",
  );
  await page.getByRole("button", { name: "Complete oldest upload" }).click();
  await expect(page.getByTestId("avatar-value")).toHaveText(
    "https://example.test/second.png",
  );
  await trigger.click();
  await page
    .getByLabel("Upload avatar image")
    .setInputFiles(image("third.png"));
  await page
    .getByRole("textbox", { name: "Avatar image URL" })
    .fill("https://example.test/chosen.png");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Complete oldest upload" }).click();
  await expect(page.getByTestId("avatar-value")).toHaveText(
    "https://example.test/chosen.png",
  );
  await trigger.click();
  await page
    .getByLabel("Upload avatar image")
    .setInputFiles(image("failed.png"));
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Fail latest upload" }).click();
  await trigger.click();
  await expect(page.getByRole("alert")).toContainText("Upload failed");
  await expect(page.getByTestId("avatar-value")).toHaveText(
    "https://example.test/chosen.png",
  );
});

test("avatar local previews and inline full emoji keyboard search work without an uploader", async ({
  page,
}) => {
  await open(page, "ui-forms-avatar-picker--choose-image-emoji-or-initials");
  await page.getByRole("tab", { name: "Image", exact: true }).click();
  await page
    .getByLabel("Upload avatar image")
    .setInputFiles(image("preview.png"));
  await expect(page.getByTestId("avatar-value")).toContainText(
    "data:image/png;base64,",
  );
  await page.getByRole("tab", { name: "Emoji", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Search emoji" });
  await search.focus();
  await expect(search).toBeFocused();
  await search.fill("fire");
  await page.getByRole("button", { name: "🔥", exact: true }).click();
  await expect(page.getByTestId("avatar-value")).toContainText(
    "data:image/svg+xml,",
  );
  await expect(search).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /^Choose avatar: / }),
  ).toBeFocused();
});

test("top bar follows main geometry and preserves independent desktop and mobile controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "shell-app-shell--top-bar-and-multiple-sidebars");
  const main = page.locator(
    '[data-ui-component="app-shell"][data-ui-part="main"]',
  );
  const center = page.getByTestId("topbar-center");
  await expect
    .poll(async () => {
      const m = await main.boundingBox(),
        c = await center.boundingBox();
      return Math.abs(m!.x + m!.width / 2 - c!.x - c!.width / 2);
    })
    .toBeLessThan(2);
  await page
    .getByRole("button", { name: "Toggle navigation", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Toggle navigation", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("button", { name: "Toggle tools rail", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Toggle tools rail", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("complementary", { name: "Document details" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 600, height: 900 });
  await page
    .getByRole("button", { name: "Toggle navigation", exact: true })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Project navigation" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Toggle navigation", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "A shared application shell" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Toggle navigation", exact: true }),
  ).toBeFocused();
});

test("Markdown survives narrow layout and late stylesheet updates without replacing its reader", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page, "chat-markdown-content--rich-content-and-streaming");
  const heading = page.getByRole("heading", {
    name: "Project update",
    exact: true,
  });
  const handle = await heading.elementHandle();
  await page.addStyleTag({
    content: '[data-ui-component="chat-markdown"] { --mira-font-size: 19px; }',
  });
  await expect(page.locator('[data-ui-component="chat-markdown"]')).toHaveCSS(
    "--mira-font-size",
    "19px",
  );
  await expect(
    page.locator('[data-ui-component="chat-markdown"] p').first(),
  ).toHaveCSS("font-size", "19px");
  expect(await handle!.evaluate((node) => node.isConnected)).toBe(true);
  await page.getByRole("button", { name: "Append streamed content" }).click();
  await expect(page.getByText("update", { exact: true })).toHaveCount(2);
  await expect(page.getByRole("table")).toBeVisible();
});
