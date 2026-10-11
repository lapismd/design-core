import { expect, test } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

test("secondary toast actions retain distinct resting hover and focus surfaces", async ({
  page,
}) => {
  const storyId =
    "workspace-plugins-notifications-controlled--secondary-action-has-a-resting-surface";
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await waitForVisualStoryFinished(page, storyId);
  const action = page.getByRole("button", { name: "Retry request" });
  await expect(action).toBeVisible();
  await expect(page.getByText("Action: error:retry")).toBeVisible();
  await expect(page.getByText("Actions: 1")).toBeVisible();
  const rest = await action.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(rest).not.toBe("rgba(0, 0, 0, 0)");
  await action.hover();
  expect(
    await action.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    ),
  ).not.toBe(rest);
  await page.mouse.move(0, 0);
  await action.focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Dismiss Request failed" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(action).toBeFocused();
  expect(
    await action.evaluate((element) => getComputedStyle(element).outlineStyle),
  ).toBe("solid");
  await action.press("Enter");
  await expect(page.getByText("Actions: 2")).toBeVisible();
});
