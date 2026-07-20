import { describe, expect, it } from "vitest";
import {
  listFixtures,
  TASKS_REFERENCE_LIST_NAME,
  taskFixtures,
} from "./fixtures.js";
import {
  captureScenarios,
  motionContracts,
  referenceViewports,
} from "./reference.js";

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
