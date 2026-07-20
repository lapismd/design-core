import { chromium, type Locator, type Page } from "playwright";
import {
  TASKS_REFERENCE_LIST_NAME,
  taskFixtures,
} from "../../src/lib/fixtures.js";
import { authStatePath, fileExists, openSource } from "./runtime.js";

async function firstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();
  for (let index = 0; index < count; index++) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible().catch(() => false)) return candidate;
  }
  return null;
}

async function activateFixture(page: Page): Promise<void> {
  const existing = await firstVisible(
    page.getByText(TASKS_REFERENCE_LIST_NAME, { exact: true }),
  );
  if (existing) {
    await existing.click();
    return;
  }

  const create = await firstVisible(
    page.getByRole("button", { name: /new list|create list|add list/i }),
  );
  if (!create) {
    throw new Error(
      "Could not find an accessible create-list control. Do not use bootstrap against a non-fixture list.",
    );
  }

  await create.click();
  const fields = page.getByRole("textbox");
  const fieldCount = await fields.count();
  if (!fieldCount)
    throw new Error("Create-list dialog has no accessible text field.");
  await fields.nth(fieldCount - 1).fill(TASKS_REFERENCE_LIST_NAME);
  await fields.nth(fieldCount - 1).press("Enter");

  const created = await firstVisible(
    page.getByText(TASKS_REFERENCE_LIST_NAME, { exact: true }),
  );
  if (!created) throw new Error("Fixture list was not visible after creation.");
  await created.click();
}

async function addTaskIfMissing(page: Page, title: string): Promise<void> {
  if (await page.getByText(title, { exact: true }).count()) return;
  const trigger = await firstVisible(
    page.getByRole("button", { name: /new task|add task/i }),
  );
  if (!trigger)
    throw new Error(`No accessible task composer was found for "${title}".`);
  await trigger.click();

  const fields = page.getByRole("textbox");
  const fieldCount = await fields.count();
  if (!fieldCount)
    throw new Error("Task composer has no accessible text field.");
  const field = fields.nth(fieldCount - 1);
  await field.fill(title);
  await field.press("Enter");
}

/**
 * This deliberately touches only the exact-name private fixture. It is safe to
 * re-run; existing fixture rows are not duplicated.
 */
async function main(): Promise<void> {
  if (!(await fileExists(authStatePath))) {
    throw new Error("Missing local auth state. Run reference:auth first.");
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: authStatePath,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    await openSource(page);
    await activateFixture(page);
    for (const task of taskFixtures) await addTaskIfMissing(page, task.title);
    process.stdout.write(`Fixture "${TASKS_REFERENCE_LIST_NAME}" is ready.\n`);
  } finally {
    await browser.close();
  }
}

void main();
