import { expect, test, type Page, type Route } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, story = "controlled-lifetime") {
  const id = `shadcn-forms-emoji-picker--${story}`;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}

test("full picker searches and selects with the keyboard, then reopens cleanly", async ({
  page,
}) => {
  await open(page);
  const trigger = page.getByRole("button", { name: "Pick an emoji" });
  await trigger.click();
  const search = page.getByRole("searchbox", { name: "Search emoji" });
  await expect(search).toBeFocused();
  await search.fill("fire");
  await expect(
    page.getByRole("button", { name: "🔥", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("🔥");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(page.locator("em-emoji-picker")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("explicit theme updates preserve the picker and skin-tone/category controls", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Pick an emoji" }).click();
  const root = page.locator("em-emoji-picker #root");
  await expect(root).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Change picker theme" }).click();
  await page.getByRole("button", { name: "Pick an emoji" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Choose default skin tone" }).click();
  await expect(
    page.locator("em-emoji-picker input[type=radio]"),
  ).not.toHaveCount(0);
  await expect(page.locator("em-emoji-picker nav button")).not.toHaveCount(0);
});

test("popup fits a narrow viewport and respects its sizing token", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await open(page);
  await page.getByRole("button", { name: "Pick an emoji" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search emoji" }),
  ).toBeVisible();
  const content = page.locator(".ui-emoji-picker-content");
  const bounds = await content.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(640);
  await page.keyboard.press("Escape");
  await expect(content).toBeHidden();
  await page.setViewportSize({ width: 800, height: 900 });
  await page.evaluate(() =>
    document.documentElement.style.setProperty(
      "--ui-emoji-picker-width",
      "24rem",
    ),
  );
  await page.getByRole("button", { name: "Pick an emoji" }).click();
  await expect(content).toHaveCSS("width", "384px");
});

test("restricted and preset choices never request the full library or dataset", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (
      /(?:\/deps\/(?:emoji-mart|@emoji-mart_data)\.js|@emoji-mart\/data\/sets\/.*\.json)/.test(
        request.url(),
      )
    )
      requests.push(request.url());
  });
  await open(page, "restricted-reactions");
  await expect(page.getByRole("status")).toHaveText("❤️");
  expect(requests).toEqual([]);
  await open(page, "suggested-reactions-only");
  await expect(page.getByRole("status")).toHaveText("👍");
  expect(requests).toEqual([]);
});

test("unmounting during a delayed library load cannot install a stale picker", async ({
  page,
}) => {
  let pending: Route | undefined;
  await page.route(
    /(?:\/deps\/@emoji-mart_data\.js|@emoji-mart\/data\/sets\/.*\.json)/,
    (route) => {
      pending = route;
    },
  );
  await open(page);
  await page.getByRole("button", { name: "Pick an emoji" }).click();
  await expect.poll(() => !!pending).toBe(true);
  await page.getByRole("button", { name: "Toggle picker mounting" }).click();
  await pending!.continue();
  await expect(page.locator("em-emoji-picker")).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle picker mounting" }).click();
  await page.getByRole("button", { name: "Pick an emoji" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search emoji" }),
  ).toBeFocused();
  await expect(page.locator("em-emoji-picker")).toHaveCount(1);
});

test("failed data loading explains refresh recovery and dismisses without reloading the host", async ({
  page,
}) => {
  let failed = false;
  await page.route(/@emoji-mart\/data\/sets\/.*\.json/, async (route) => {
    if (!failed) {
      failed = true;
      await route.abort("failed");
    } else await route.continue();
  });
  await open(page);
  await page.getByRole("button", { name: "Pick an emoji" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Emoji could not be loaded",
  );
  await expect(page.getByRole("alert")).toContainText("refresh the page");
  const fixture = await page
    .getByRole("button", { name: "Toggle picker mounting" })
    .elementHandle();
  await page.getByRole("button", { name: "Close emoji picker" }).click();
  await expect(page.locator(".ui-emoji-picker-content")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Pick an emoji" }),
  ).toBeFocused();
  expect(await fixture!.evaluate((element) => element.isConnected)).toBe(true);
});
