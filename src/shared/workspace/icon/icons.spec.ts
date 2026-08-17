import { describe, expect, it } from "vitest";

import { filterWorkspaceIconNames, listWorkspaceIconNames } from "./icons.js";

describe("workspace icon catalog", () => {
  it("lists Lucide names used by workspace chrome", () => {
    const names = listWorkspaceIconNames();
    expect(names).toContain("notebook-tabs");
    expect(names).toContain("search");
    expect(names.length).toBeGreaterThan(1000);
  });

  it("filters by compact or spaced query text", () => {
    expect(filterWorkspaceIconNames("notebook-tabs")).toContain(
      "notebook-tabs",
    );
    expect(filterWorkspaceIconNames("notebook tabs")).toContain(
      "notebook-tabs",
    );
    expect(filterWorkspaceIconNames("no-such-icon-name")).toEqual([]);
  });
});
