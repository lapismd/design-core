import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  assertReorderBounds,
  assertSelectionConsistent,
  createInitialPager,
  createInitialSelection,
} from "./contracts.js";
import {
  buildGroupedListView,
  buildList,
  buildNavDestinations,
  buildSelection,
  buildTask,
  fixtureTaskIdSet,
  listFixtures,
  TASKS_REFERENCE_LIST_NAME,
  taskFixtures,
} from "./fixtures.js";
import {
  captureScenarios,
  motionContracts,
  referenceViewports,
} from "./reference.js";
import { createTasksStoryFixture } from "./story-fixtures.js";
import { tasksThemeTokens } from "./tokens.js";

const libDir = dirname(fileURLToPath(import.meta.url));
const themeCss = readFileSync(join(libDir, "tasks-theme.css"), "utf8");

describe("Tasks reference contracts", () => {
  it("uses synthetic, internally consistent fixture data", () => {
    expect(listFixtures[0]?.name).toBe(TASKS_REFERENCE_LIST_NAME);
    expect(listFixtures[0]?.taskIds).toEqual(
      taskFixtures.map((task) => task.id),
    );
    expect(new Set(taskFixtures.map((task) => task.id)).size).toBe(
      taskFixtures.length,
    );
  });

  it("covers the requested responsive shells and interaction inputs", () => {
    expect(referenceViewports.map((viewport) => viewport.id)).toEqual([
      "desktop",
      "tablet-landscape",
      "tablet-portrait",
      "mobile",
    ]);
    expect(
      captureScenarios.some((scenario) => scenario.page === "task-detail"),
    ).toBe(true);
    expect(motionContracts.map((motion) => motion.input)).toEqual(
      expect.arrayContaining([
        "click",
        "double-click",
        "drag",
        "swipe-left",
        "swipe-right",
        "keyboard",
      ]),
    );
  });
});

describe("Tasks controlled view-model contracts", () => {
  it("keeps selection ids inside the fixture task set", () => {
    const taskIds = fixtureTaskIdSet();
    const selection = buildSelection("task-brief", "task-brief");
    expect(() => assertSelectionConsistent(selection, taskIds)).not.toThrow();
    expect(() =>
      assertSelectionConsistent(
        createInitialSelection("missing-task"),
        taskIds,
      ),
    ).toThrow(/selectedTaskId/);
    expect(() =>
      assertSelectionConsistent(
        { selectedTaskId: null, openTaskId: "missing-task" },
        taskIds,
      ),
    ).toThrow(/openTaskId/);
  });

  it("rejects reorder indexes outside the list length", () => {
    expect(() =>
      assertReorderBounds(
        {
          taskId: "task-brief",
          fromIndex: 0,
          toIndex: 1,
          accepted: true,
        },
        2,
      ),
    ).not.toThrow();
    expect(() =>
      assertReorderBounds(
        {
          taskId: "task-brief",
          fromIndex: 0,
          toIndex: 5,
          accepted: true,
        },
        2,
      ),
    ).toThrow(/toIndex/);
  });

  it("builds deterministic list groups with a collapsed Done section", () => {
    const view = buildGroupedListView();
    expect(view.empty).toBe(false);
    expect(view.loading).toBe(false);
    expect(view.groups.some((group) => group.id === "overdue")).toBe(true);
    expect(view.groups.some((group) => group.id === "today")).toBe(true);
    const done = view.groups.find((group) => group.id === "done");
    expect(done?.collapsed).toBe(true);
    expect(done?.taskIds).toContain("task-empty-state");
  });

  it("builds nav destinations from list fixtures without inventing account data", () => {
    const destinations = buildNavDestinations();
    expect(destinations.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "inbox",
        "today",
        "tasks",
        "updates",
        "lists",
        "list:list-reference",
      ]),
    );
    expect(
      destinations.every((item) => !/superlist|@|\.com/i.test(item.label)),
    ).toBe(true);
  });

  it("exposes deterministic task and list builders", () => {
    const task = buildTask({
      id: "task-story",
      title: "Story fixture task",
      due: "today",
      priority: "high",
    });
    const list = buildList({
      id: "list-story",
      name: "Story list",
      taskIds: [task.id],
      favourite: true,
    });
    expect(task.status).toBe("open");
    expect(list.kind).toBe("private");
    expect(createInitialPager("detail").preserveListScroll).toBe(true);
  });
});

describe("Tasks story fixture factory", () => {
  it("builds controlled story state from synthetic fixtures", () => {
    const fixture = createTasksStoryFixture({
      selectedTaskId: "task-brief",
      openTaskId: "task-brief",
      pagerPane: "detail",
    });
    expect(fixture.activeTask.id).toBe("task-brief");
    expect(fixture.selection.openTaskId).toBe("task-brief");
    expect(fixture.pager.pane).toBe("detail");
    expect(fixture.listView.orderedTaskIds.length).toBeGreaterThan(0);
    expect(fixture.navDestinations[0]?.id).toBe("inbox");
  });
});

describe("Tasks theme scoping", () => {
  it("scopes light, dark, and reduced-motion tokens under .tasks-theme", () => {
    expect(themeCss).toMatch(/^\.tasks-theme\s*\{/m);
    expect(themeCss).toMatch(/\.tasks-theme\.dark\s*\{/);
    expect(themeCss).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*\.tasks-theme\s*\{/,
    );
    expect(themeCss).not.toMatch(/:root\s*\{/);
    expect(themeCss).not.toMatch(/html\s*\{/);
    for (const token of tasksThemeTokens) {
      expect(themeCss).toContain(`--tasks-${token}`);
    }
  });
});
