import type { Locator, Page } from "playwright";
import {
  TASKS_REFERENCE_LIST_NAME,
  taskFixtures,
} from "../../src/lib/fixtures.js";
import { enableFlutterSemantics } from "./runtime.js";

export async function firstVisible(locator: Locator): Promise<Locator | null> {
  const count = await locator.count();
  for (let index = 0; index < count; index++) {
    const candidate = locator.nth(index);
    if (await candidate.isVisible().catch(() => false)) return candidate;
  }
  return null;
}

export async function activateDestination(
  page: Page,
  name: string,
): Promise<void> {
  for (let attempt = 0; attempt < 8; attempt++) {
    await enableFlutterSemantics(page);
    const control =
      (await firstVisible(
        page.getByRole("button", { name: new RegExp(`^${name}`, "i") }),
      )) ??
      (await firstVisible(page.getByText(name, { exact: true }))) ??
      (await firstVisible(page.locator(`[aria-label^="${name}" i]`)));
    if (control) {
      await control.click();
      await page.waitForTimeout(400);
      return;
    }
    if (attempt === 2) {
      process.stdout.write(
        `Still looking for "${name}" — if a tiny "Enable accessibility" control is visible, click it.\n`,
      );
    }
    await page.waitForTimeout(500);
  }
  throw new Error(`Could not find the accessible ${name} destination.`);
}

/** Wait until Superlist shell nav is actually accessible (not just a logged-in URL). */
export async function waitForLoggedInShell(page: Page): Promise<void> {
  process.stdout.write(
    "Waiting for Superlist shell… log in in the headed window if needed.\n",
  );
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    await enableFlutterSemantics(page);
    const shell = page
      .getByText(/^(Inbox|Today|Tasks|Lists)$/i)
      .or(page.getByRole("button", { name: /^(Inbox|Today|Tasks|Lists)/i }))
      .or(page.locator('[aria-label^="Inbox" i], [aria-label^="Lists" i]'))
      .first();
    if (await shell.isVisible().catch(() => false)) {
      process.stdout.write("Logged-in shell detected.\n");
      return;
    }
    await page.waitForTimeout(500);
  }
  throw new Error("Timed out waiting for Superlist shell");
}

/**
 * Open the fixture task's right detail rail.
 * Single click selects; Details (or double-click) opens `/…/tasks/<id>`.
 */
export async function openTaskDetail(page: Page): Promise<void> {
  const title = taskFixtures[0].title;
  const task = await firstVisible(page.getByText(title, { exact: true }));
  if (!task) {
    throw new Error(
      `Reference fixture task "${title}" is missing; run reference:bootstrap.`,
    );
  }

  process.stdout.write(
    `task bbox before open: ${JSON.stringify(await task.boundingBox())}\n`,
  );

  await task.click();
  await page.waitForTimeout(400);

  const details =
    (await firstVisible(
      page.getByRole("button", { name: /details|open details/i }),
    )) ??
    (await firstVisible(page.locator('[aria-label*="Details" i]'))) ??
    (await firstVisible(page.getByRole("button", { name: /^Open$/i })));

  if (details) {
    process.stdout.write("Clicking Details affordance\n");
    await details.click();
  } else {
    process.stdout.write("No Details button — double-click row\n");
    await task.dblclick();
  }

  await page
    .waitForURL(/\/tasks\/[0-9a-f-]+/i, { timeout: 8000 })
    .catch(() => undefined);
  await page.waitForTimeout(600);

  const back = await firstVisible(
    page.getByRole("button", { name: /back|close/i }),
  );
  process.stdout.write(
    `after open: backVisible=${Boolean(back)} url=${page.url()}\n`,
  );
  if (!/\/tasks\//i.test(page.url()) && !back) {
    throw new Error(
      "Task detail did not open (URL still list-only and no back control).",
    );
  }
}

export async function runCaptureNav(
  page: Page,
  steps: readonly string[],
): Promise<void> {
  for (const step of steps) {
    process.stdout.write(`nav: ${step}\n`);
    if (step === "inbox") await activateDestination(page, "Inbox");
    else if (step === "today") await activateDestination(page, "Today");
    else if (step === "tasks") await activateDestination(page, "Tasks");
    else if (step === "updates") await activateDestination(page, "Updates");
    else if (step === "lists") await activateDestination(page, "Lists");
    else if (step === "list-detail") {
      await activateDestination(page, "Lists");
      const fixture =
        (await firstVisible(
          page.getByText(TASKS_REFERENCE_LIST_NAME, { exact: true }),
        )) ??
        (await firstVisible(page.getByText(/Tasks UI Reference/i))) ??
        (await firstVisible(page.getByText(/Tasks Tasks UI/i)));
      if (!fixture) {
        throw new Error(
          `Fixture list "${TASKS_REFERENCE_LIST_NAME}" not found; run reference:bootstrap.`,
        );
      }
      await fixture.click();
      await page.waitForTimeout(500);
    } else if (step === "open-first-task") {
      await openTaskDetail(page);
    } else if (step === "select-first-task") {
      const task = await firstVisible(
        page.getByText(taskFixtures[0].title, { exact: true }),
      );
      if (!task) {
        throw new Error(
          "Reference fixture task is missing; run reference:bootstrap.",
        );
      }
      await task.click();
      await page.waitForTimeout(400);
    } else if (step === "focus-composer") {
      const add =
        (await firstVisible(
          page.getByRole("button", { name: /new task|add task/i }),
        )) ?? (await firstVisible(page.getByText(/add task/i)));
      if (add) await add.click();
      await page.waitForTimeout(200);
    } else {
      throw new Error(`Unknown nav step: ${step}`);
    }
  }
}
