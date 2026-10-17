import { expect, test } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const story =
  "chat-transcript--full-conversation-with-context-tools-and-replies";

test("full conversation avatars and reply groups use optional shared author cards", async ({
  page,
}) => {
  await page.goto(`/iframe.html?id=${story}&viewMode=story`);
  await waitForVisualStoryFinished(page, story);
  const transcript = page.locator('[data-ui-component="transcript"]');
  const unowned = await transcript
    .locator('[data-ui-component="avatar"]')
    .evaluateAll(
      (nodes) =>
        nodes.filter((node) => !node.closest(".ui-author-card__trigger"))
          .length,
    );
  expect(unowned).toBe(0);
  for (const view of ["Document", "Classic"]) {
    await page.getByRole("button", { name: view, exact: true }).click();
    const replies = transcript
      .getByRole("group", { name: "Reply participants" })
      .first();
    const participant = replies
      .getByRole("button", { name: /^About / })
      .first();
    const label = (await participant.getAttribute("aria-label"))!;
    await participant.hover();
    const card = page.getByRole("group", { name: label, exact: true });
    await expect(
      card.locator('[data-ui-component="author-card"]'),
    ).toBeVisible();
    await expect(card).toContainText("Project maintainer");
    await expect(
      card.locator('.ui-author-card__identity [data-ui-component="avatar"]'),
    ).toHaveCSS("width", "48px");
    await card
      .getByRole("button", { name: "View profile", exact: true })
      .click();
    await expect(page.getByTestId("transcript-result")).toContainText(
      "Profile:",
    );
    await expect(card).toHaveCount(0);
  }
});
