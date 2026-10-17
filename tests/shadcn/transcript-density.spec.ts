import { expect, test } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const story =
  "chat-transcript--full-conversation-with-context-tools-and-replies";

test("tool groups, file disclosures and reasoning use one compact row rhythm", async ({
  page,
}) => {
  await page.goto(`/iframe.html?id=${story}&viewMode=story`);
  await waitForVisualStoryFinished(page, story);
  for (const mode of ["Document", "Classic"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    const summary = page.locator(".ui-transcript-tool-summary").first();
    if ((await summary.getAttribute("aria-expanded")) !== "true")
      await summary.click();
    const heading = page.locator(".ui-transcript-tool-heading").first();
    const trigger = heading.locator(".ui-transcript-tool-trigger");
    const file = page.locator(".ui-transcript-file-trigger").first();
    const reasoning = page
      .locator('[data-kind="reasoning"] .ui-transcript-context-trigger')
      .first();
    for (const row of [summary, trigger, file, reasoning]) {
      await expect(row).toHaveCSS("font-size", "13px");
      await expect(row).toHaveCSS("min-height", "24px");
      await expect(row).toHaveCSS("display", "flex");
    }
    // A hidden raw-output action must not reserve a taller line than its title.
    expect((await heading.boundingBox())!.height).toBe(
      (await trigger.boundingBox())!.height,
    );
    const margins = await page
      .locator(
        '.ui-transcript-document > li[data-kind="tools"]:has(+ li[data-kind="tools"])',
      )
      .evaluateAll((nodes) =>
        nodes.map((node) => getComputedStyle(node).marginBottom),
      );
    expect(margins.length).toBeGreaterThan(0);
    expect(new Set(margins)).toEqual(new Set(["4px"]));
    const files = page.locator(".ui-transcript-tool-files").first();
    for (const expanded of await files
      .locator('.ui-transcript-file-trigger[aria-expanded="true"]')
      .all())
      await expanded.click();
    const gaps = await files
      .locator(':scope > [data-ui-part="collapsible"]')
      .evaluateAll((nodes) =>
        nodes
          .slice(1)
          .map(
            (node, index) =>
              node.getBoundingClientRect().top -
              nodes[index]!.getBoundingClientRect().bottom,
          ),
      );
    expect(gaps.length).toBeGreaterThan(0);
    for (const gap of gaps) expect(gap).toBe(4);
    // Dense controls retain real keyboard disclosure and source content.
    await file.focus();
    await page.keyboard.press("Enter");
    await expect(file).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Enter");
    await expect(file).toHaveAttribute("aria-expanded", "false");
  }
});
