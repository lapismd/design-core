import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, name = "detected-column-types") {
  const id = "shadcn-data-display-canvas-table--" + name;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
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
test("filters real rows, preserves hidden selection and selects beyond the viewport", async ({
  page,
}) => {
  await open(page, "large-filtered-dataset");
  await page.keyboard.press("Escape");
  await page
    .getByRole("checkbox", { name: "Select row 2", exact: true })
    .check();
  await page.getByRole("button", { name: "Filter rows", exact: true }).click();
  await choose(page, "Name filter operator", "contains");
  await page
    .getByRole("textbox", { name: "Name filter value" })
    .fill("Record 99");
  await page.keyboard.press("Escape");
  await page
    .getByRole("checkbox", { name: "Select all filtered rows", exact: true })
    .check();
  await expect(page.getByLabel("Selected rows", { exact: true })).toHaveText(
    "112 selected",
  );
  expect(await page.getByRole("checkbox").count()).toBeLessThan(35);
  await page.getByRole("button", { name: "Filter rows" }).click();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("checkbox", { name: "Select row 2", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Select all filtered rows" }),
  ).toHaveAttribute("data-state", "indeterminate");
});
test("detects typed editors, permits overrides, locks explicit types", async ({
  page,
}) => {
  await open(page);
  await field(page, "Amount");
  await expect(page.getByLabel("Amount field type")).toHaveText(
    "Auto · Number",
  );
  await choose(page, "Amount field type", "Text");
  await expect(
    page.getByRole("textbox", { name: "Amount filter value" }),
  ).toBeVisible();
  await choose(page, "Amount field type", "Auto · Number");
  await expect(
    page.getByRole("spinbutton", { name: "Amount filter value" }),
  ).toBeVisible();
  await field(page, "Created");
  await expect(page.getByLabel("Created field type")).toHaveText("Auto · Date");
  await field(page, "Active");
  await expect(
    page.getByRole("checkbox", { name: "Active filter value" }),
  ).toBeVisible();
  await open(page, "explicit-filter-types");
  await field(page, "Status");
  await expect(page.getByLabel("Status field type")).toHaveCount(0);
  await page.getByLabel("Status filter value", { exact: true }).click();
  await page.getByRole("option", { name: "Open", exact: true }).click();
  await page.keyboard.press("Escape");
  await page
    .getByRole("checkbox", { name: "Select all filtered rows" })
    .check();
  await expect(page.getByLabel("Selected rows", { exact: true })).toHaveText(
    "12 selected",
  );
});
test("retains applied rows for invalid drafts and discards unfinished edits on close", async ({
  page,
}) => {
  await open(page);
  await field(page, "Amount");
  await choose(page, "Amount filter operator", "greater than");
  const input = page.getByRole("spinbutton", { name: "Amount filter value" });
  await input.fill("500");
  await input.fill("");
  await expect(
    page.getByRole("status", { name: "Filter draft status" }),
  ).toContainText("Changes not applied");
  await page.keyboard.press("Escape");
  await page
    .getByRole("checkbox", { name: "Select all filtered rows" })
    .check();
  await expect(page.getByLabel("Selected rows", { exact: true })).toHaveText(
    "3 selected",
  );
  await page.getByRole("button", { name: "Filter rows" }).click();
  await expect(
    page.getByRole("spinbutton", { name: "Amount filter value" }),
  ).toHaveValue("500");
});
test("composes host visibility, sorting, external reset and cell edits", async ({
  page,
}) => {
  await open(page);
  await page
    .getByRole("textbox", { name: "Name filter value" })
    .fill("Record 24");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Toggle host visibility" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Select all filtered rows" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Toggle host visibility" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Select row 25", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sort Name", exact: true }).click();
  const address = page.getByRole("textbox", { name: "Cell address" });
  await address.fill("A25");
  await address.press("Enter");
  await page.getByRole("grid").press("Enter");
  await page.getByRole("textbox", { name: "Edit cell" }).fill("Renamed");
  await page.getByRole("textbox", { name: "Edit cell" }).press("Enter");
  await expect(
    page.getByRole("checkbox", { name: "Select all filtered rows" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Reset filters externally" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Select all filtered rows" }),
  ).toBeEnabled();
});
test("portals stay opaque and hit-tested above headers and return keyboard focus", async ({
  page,
}) => {
  await open(page);
  const panel = page.getByRole("dialog", { name: "Filter table rows" });
  const box = (await panel.boundingBox())!;
  const target = await page.evaluate(
    ({ x, y }) =>
      Boolean(
        document
          .elementFromPoint(x, y)
          ?.closest('[data-ui-component="popover"]'),
      ),
    { x: box.x + box.width / 2, y: box.y + 15 },
  );
  expect(target).toBe(true);
  await page.getByLabel("Name filter operator").click();
  const option = page.getByRole("option", { name: "contains", exact: true });
  await expect(option).toBeVisible();
  await option.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Filter rows" })).toBeFocused();
});
test("keeps narrow popovers in the viewport and tears down an open panel", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "narrow-filter-popover");
  const panel = page.getByRole("dialog", { name: "Filter table rows" });
  const box = (await panel.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Toggle mounted" }).click();
  await expect(panel).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle mounted" }).click();
  await expect(page.getByRole("grid")).toBeVisible();
  expect(errors).toEqual([]);
});
