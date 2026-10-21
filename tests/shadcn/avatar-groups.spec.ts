import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, story: string, dark = false) {
  const id = `shadcn-data-avatar--${story}`;
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story${dark ? "&globals=colorMode:dark" : ""}`,
  );
  await waitForVisualStoryFinished(page, id);
}

test("avatar groups keep member and overflow sizes aligned with image and emoji identities", async ({
  page,
}) => {
  for (const dark of [false, true]) {
    await open(page, "participant-group-sizes", dark);
    for (const [size, pixels] of [
      ["xs", 20],
      ["sm", 24],
      ["md", 32],
      ["lg", 48],
      ["xl", 80],
      ["2xl", 128],
      ["3xl", 160],
    ] as const) {
      const group = page.getByRole("group", {
        name: `${size} participants`,
        exact: true,
      });
      const avatars = group.locator('[data-ui-component="avatar"]');
      await expect(avatars).toHaveCount(2);
      const dimensions = await group
        .locator('[data-ui-component="avatar"], .ui-avatar-group__overflow')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            width: node.getBoundingClientRect().width,
            height: node.getBoundingClientRect().height,
          })),
        );
      expect(dimensions).toEqual(
        Array.from({ length: 3 }, () => ({ width: pixels, height: pixels })),
      );
      const image = group
        .getByRole("button", { name: "Alex Morgan: AM", exact: true })
        .locator("img");
      await expect
        .poll(() =>
          image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      const emoji = group.getByRole("button", {
        name: "Build agent: 🐝",
        exact: true,
      });
      await expect(emoji).toContainText("🐝");
      await expect(emoji).toHaveAttribute("data-shape", "rounded");
      await expect(
        group.getByRole("button", {
          name: "1 more participants: Sam Kim",
          exact: true,
        }),
      ).toHaveText("+1");
    }
    await page.setViewportSize({ width: 360, height: 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(360);
    await page.setViewportSize({ width: 800, height: 900 });
  }
});

test("named participant groups retain keyboard tooltips and their default size", async ({
  page,
}) => {
  await open(page, "participant-groups");
  const group = page.getByRole("group", { name: "Review participants" });
  const first = group.getByRole("button", {
    name: "Alex Morgan: AM",
    exact: true,
  });
  await first.focus();
  await expect(page.getByRole("tooltip")).toHaveText("Alex Morgan");
  await expect(first.locator('[data-ui-component="avatar"]')).toHaveCSS(
    "width",
    "32px",
  );
  await page.keyboard.press("Escape");
  await group
    .getByRole("button", { name: "1 more participants: Sam Kim", exact: true })
    .focus();
  await expect(page.getByRole("tooltip")).toHaveText("Sam Kim");
});

test("compact reply groups keep participant details separate from reply activation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await open(page, "compact-reply-indicator");
  const replies = page.getByRole("button", { name: "3 replies", exact: true });
  const group = page.getByRole("group", { name: "Reply participants" });
  await expect(group).toHaveAttribute("data-size", "xs");
  await expect(
    replies.locator("button, [data-ui-component='avatar-group']"),
  ).toHaveCount(0);
  await expect(group.getByRole("button")).toHaveCount(3);
  await expect(group.locator(".ui-avatar-group__overflow")).toHaveText("+1");
  await replies.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Reply thread opened");
  await expect(replies).toBeFocused();
});

test("overlapping participants rise above their neighbours on hover and focus", async ({
  page,
}) => {
  for (const story of ["participant-groups", "compact-reply-indicator"]) {
    await open(page, story);
    const group = page.locator('[data-ui-component="avatar-group"]');
    const members = group.locator(".ui-avatar-group__member");
    const first = members.first();
    const second = members.nth(1);
    await first.hover();
    await expect(first).toHaveCSS("z-index", "1");
    await expect(second).toHaveCSS("z-index", "auto");
    await second.hover();
    await expect(first).toHaveCSS("z-index", "auto");
    await expect(second).toHaveCSS("z-index", "1");
    if (story === "participant-groups") {
      await page.mouse.move(0, 0);
      await first.focus();
      await expect(first).toHaveCSS("z-index", "1");
    }
  }
});
