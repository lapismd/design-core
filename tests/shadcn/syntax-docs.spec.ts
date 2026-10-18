import { expect, test } from "@playwright/test";

for (const example of [
  {
    docs: "shadcn-content-code-block--docs",
    story:
      "shadcn-content-code-block--dark-defaults-preserve-custom-syntax-themes",
    boundary: "@lapismd/design-core/shadcn/code-block",
    usage: "syntaxTheme={dracula}",
    last: true,
    primary: false,
  },
  {
    docs: "diff-file-diff--docs",
    story: "diff-file-diff--dark-unchanged-markdown-keeps-readable-syntax",
    boundary: "@lapismd/design-core/diff",
    usage: 'path="README.md"',
    last: false,
    primary: true,
  },
]) {
  test(`${example.docs} isolates dark syntax and shows public usage`, async ({
    page,
  }) => {
    await page.goto(`/iframe.html?id=${example.docs}&viewMode=docs`);
    const docs = page.locator("#storybook-docs");
    await expect(docs).toBeVisible();
    const canvas = docs.locator(
      `#story--${example.story}${example.primary ? "--primary" : ""}`,
    );
    const embed = canvas.locator("iframe");
    await expect(embed).toBeVisible();
    const preview = embed.contentFrame();
    await expect(preview.locator("html")).toHaveClass(/\bdark\b/);
    await expect(
      preview.locator(".ui-code-token-keyword").first(),
    ).toBeVisible();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);

    const buttons = docs.getByRole("switch", {
      name: "Show code",
      exact: true,
    });
    const toggle = example.last ? buttons.last() : buttons.first();
    const sourceId = await toggle.getAttribute("aria-controls");
    expect(sourceId).toBeTruthy();
    await toggle.click();
    const source = docs.locator(`[id="${sourceId}"]`);
    await expect(source).toBeVisible();
    await expect(source).toContainText(example.boundary);
    await expect(source).toContainText(example.usage);
    await expect(source).toContainText("<script");
  });
}
