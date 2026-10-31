import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";
async function open(page: Page, name = "detected-column-types", dark = false) {
  const id = "shadcn-data-display-canvas-table--" + name;
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story${dark ? "&globals=colorMode:dark" : ""}`,
  );
  await waitForVisualStoryFinished(page, id);
  await page
    .getByRole("button", { name: "Filter rows", exact: true })
    .first()
    .click();
}
async function field(page: Page, name: string) {
  await page
    .getByRole("button", { name: /^Filter field:/ })
    .first()
    .click();
  await page
    .getByRole("combobox", { name: "Find filter field", exact: true })
    .fill(name);
  await page.getByRole("option", { name, exact: true }).click();
}
async function choose(page: Page, name: string, option: string) {
  await page.getByLabel(name, { exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
test("keeps detected modes stable after edits and honors explicit re-detection", async ({
  page,
}) => {
  await open(page);
  await field(page, "Amount");
  await page
    .getByRole("spinbutton", { name: "Amount filter value" })
    .fill("25");
  await page.keyboard.press("Escape");
  const address = page.getByRole("textbox", { name: "Cell address" });
  await address.fill("C3");
  await address.press("Enter");
  await page.getByRole("grid").press("Enter");
  const editor = page.getByRole("textbox", { name: "Edit cell" });
  await editor.fill("unknown");
  await editor.press("Enter");
  await page.getByRole("button", { name: "Filter rows" }).click();
  await expect(page.getByLabel("Amount field type")).toHaveText(
    "Auto · Number",
  );
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Re-detect types" }).click();
  await page.getByRole("button", { name: "Filter rows" }).click();
  await field(page, "Amount");
  await expect(page.getByLabel("Amount field type")).toHaveText("Auto · Text");
  await choose(page, "Amount field type", "Number");
  await page.getByRole("spinbutton", { name: "Amount filter value" }).fill("0");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Re-detect types" }).click();
  await page.getByRole("button", { name: "Filter rows" }).click();
  await expect(page.getByLabel("Amount field type")).toHaveText("Number");
});
test("keeps filtered table instances independent in the dark theme", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await open(page, "independent-filtered-tables", true);
  await page
    .getByRole("textbox", { name: "Name filter value" })
    .fill("Record 24");
  await page.keyboard.press("Escape");
  const tables = page.locator(".canvas-filter-demo");
  await tables
    .nth(0)
    .getByRole("checkbox", { name: "Select all filtered rows" })
    .check();
  await expect(
    tables.nth(0).getByLabel("Selected rows", { exact: true }),
  ).toHaveText("1 selected");
  await expect(
    tables.nth(1).getByLabel("Selected rows", { exact: true }),
  ).toHaveText("0 selected");
  await expect(
    tables.nth(1).getByRole("button", { name: "Filter rows" }),
  ).toHaveAttribute("data-filter-active", "false");
  await page.getByRole("button", { name: "Toggle mounted" }).first().click();
  await expect(tables.nth(1).getByRole("grid")).toBeVisible();
  expect(errors).toEqual([]);
});
