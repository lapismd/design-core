import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, name = "nested-groups") {
  const id = "shadcn-forms-filter-builder--" + name;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
}
async function choose(page: Page, name: string, option: string) {
  await page.getByLabel(name, { exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
test("preserves the initial row, edits nested groups and resets external state", async ({
  page,
}) => {
  await open(page);
  const rows = page.locator("[data-filter-condition]");
  await expect(rows).toHaveCount(2);
  await page
    .locator(".filter-builder__group")
    .first()
    .locator(":scope > .filter-builder__actions")
    .getByRole("button", { name: "Add filter", exact: true })
    .click();
  await expect(rows).toHaveCount(3);
  await page.getByLabel("Filter group match", { exact: true }).first().click();
  await page
    .getByRole("option", { name: "Any of the following are true", exact: true })
    .click();
  await expect(page.getByLabel("Filter group match").first()).toHaveText(
    /Any of/,
  );
  await page
    .getByRole("button", { name: "Remove filter group", exact: true })
    .click();
  await expect(rows).toHaveCount(2);
  await page.getByRole("button", { name: "Reset filters externally" }).click();
  await expect(rows).toHaveCount(1);
  await expect(
    page.getByRole("textbox", { name: "Name filter value" }),
  ).toHaveValue("");
});
test("keeps last applied values during invalid edits and accepts zero and false", async ({
  page,
}) => {
  await open(page, "typed-editors");
  const amount = page.getByRole("spinbutton", { name: "Amount filter value" });
  await amount.fill("");
  await expect(amount).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("status", { name: "Filter draft status" }),
  ).toContainText("Changes not applied");
  await expect(page.getByLabel("Applied conditions")).toHaveText(
    "4 root conditions",
  );
  await amount.fill("0");
  await expect(
    page.getByRole("status", { name: "Filter draft status" }),
  ).toHaveCount(0);
  const checkbox = page.getByRole("checkbox", { name: "Active filter value" });
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
  await expect(page.getByLabel("Applied conditions")).toHaveText(
    "4 root conditions",
  );
});
test("searches fields with the keyboard and offers appropriate operators", async ({
  page,
}) => {
  await open(page, "standalone");
  await page
    .getByRole("button", { name: "Filter field: Name", exact: true })
    .click();
  const search = page.getByRole("combobox", {
    name: "Find filter field",
    exact: true,
  });
  await search.fill("Amount");
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(
    page.getByRole("spinbutton", { name: "Amount filter value" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Amount field type", { exact: true }),
  ).toHaveCount(0);
  await choose(page, "Amount filter operator", "at least");
  await page
    .getByRole("spinbutton", { name: "Amount filter value" })
    .fill("125");
  await expect(page.getByLabel("Applied conditions")).toHaveText(
    "1 root conditions",
  );
});
test("edits multiple literal values and restores an inferred mode", async ({
  page,
}) => {
  await open(page, "standalone");
  await choose(page, "Name filter operator", "contains any of");
  const input = page.getByRole("textbox", { name: "Name filter value" });
  await input.fill("alpha");
  await input.press("Enter");
  await input.fill("beta");
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: "Remove value alpha" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Remove value beta" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Remove value beta" }).click();
  await page.getByRole("button", { name: "Remove value alpha" }).click();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.fill("literal");
  await input.press("Enter");
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
  await choose(page, "Name field type", "Number");
  await expect(
    page.getByRole("spinbutton", { name: "Name filter value" }),
  ).toBeVisible();
  await choose(page, "Name field type", "Auto · Text");
  await expect(
    page.getByRole("textbox", { name: "Name filter value" }),
  ).toBeVisible();
});
test("keeps independent builder instances and empty schemas usable", async ({
  page,
}) => {
  await open(page, "independent-builders");
  const builders = page.getByRole("group", {
    name: "Structured filters",
    exact: true,
  });
  await builders
    .nth(0)
    .getByRole("textbox", { name: "Name filter value" })
    .fill("Alpha");
  await expect(
    builders.nth(1).getByRole("textbox", { name: "Name filter value" }),
  ).toHaveValue("");
  await open(page, "no-fields");
  await expect(page.getByText("No filter fields available.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add filter", exact: true }),
  ).toBeDisabled();
});
