import { expect, test } from "@playwright/test";

const docsUrl = (id: string) =>
  `/iframe.html?id=${encodeURIComponent(id)}&viewMode=docs`;

const pipeTableDocs = [
  { id: "ai-overview--docs", headers: ["Component", "Role"] },
  { id: "filter-guidance--docs", headers: ["Need", "Package"] },
  { id: "ui-forms-guidance--docs", headers: ["Section", "Contents"] },
  {
    id: "shell-app-shell--docs",
    headers: ["Token", "Default", "Purpose"],
  },
  {
    id: "workspace-components-settings--docs",
    headers: ["Token", "Default"],
  },
] as const;

test.describe("Storybook MDX rendering", () => {
  for (const { id, headers } of pipeTableDocs) {
    test(`renders GitHub Flavored Markdown pipe tables in ${id}`, async ({
      page,
    }) => {
      await page.goto(docsUrl(id));

      const table = page
        .locator("#storybook-docs table")
        .filter({
          has: page.getByRole("columnheader", {
            name: headers[0],
            exact: true,
          }),
        })
        .first();
      await expect(table).toBeVisible();
      for (const header of headers) {
        await expect(
          table.getByRole("columnheader", { name: header, exact: true }),
        ).toBeVisible();
      }
      await expect(table.getByRole("cell")).not.toHaveCount(0);
    });
  }

  test("highlights Svelte markup through the HTML language alias", async ({
    page,
  }) => {
    await page.goto(docsUrl("shell-guidance--docs"));

    const source = page
      .locator("#storybook-docs pre.prismjs .language-html")
      .first();
    await expect(source).toBeVisible();
    await expect(source.locator(".token.tag").first()).toBeVisible();
    await expect(source.locator(".token.attr-name").first()).toBeVisible();
  });
});
