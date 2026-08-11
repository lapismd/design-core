import { describe, expect, it } from "vitest";

import {
  applyYamlEdit,
  createUiIdentityState,
  defaultEntry,
  defaultSection,
  getAtPath,
  moveItem,
  parseFragment,
  removeItem,
  serializeFragment,
  setAtPath,
  simpleListEntryMarker,
  uniqueId,
} from "./complete-cv-form.model";
import { createSampleCv } from "./sample-cv.fixture";

describe("complete CV form model", () => {
  it("creates CV Studio-compatible defaults for every entry type", () => {
    expect(defaultEntry("TextEntry")).toBe("");
    expect(defaultEntry("ExperienceEntry")).toMatchObject({
      company: "New company",
      role_history: [],
      extra_details: [],
      highlights: [""],
    });
    expect(defaultEntry("EducationEntry")).toMatchObject({
      institution: "Institution",
    });
    expect(defaultEntry("PublicationEntry")).toMatchObject({
      title: "Publication title",
      authors: [""],
    });
    expect(defaultEntry("OneLineEntry")).toEqual({
      label: "Label",
      details: "",
    });
    expect(defaultEntry("BulletEntry")).toEqual({ bullet: "" });
    expect(defaultEntry("NumberedEntry")).toEqual({ number: "" });
    expect(defaultEntry("ReversedNumberedEntry")).toEqual({
      reversed_number: "",
    });
    expect(defaultEntry("NormalEntry")).toMatchObject({
      name: "New entry",
      highlights: [],
    });
  });

  it("creates unique section and stable UI identities without changing source data", () => {
    const section = defaultSection(
      "EducationEntry",
      ["education"],
      "Education",
    );
    expect(section.id).toBe("education-2");
    expect(uniqueId("Education", ["education", "education-2"])).toBe(
      "education-3",
    );

    const source = createSampleCv();
    const first = createUiIdentityState(source);
    const second = createUiIdentityState(source);
    expect(first).toEqual(second);
    expect(first.sections).toHaveLength(9);
    expect(source.cv.sections?.[0]).not.toHaveProperty("_uiId");
  });

  it("updates nested paths immutably", () => {
    const source = createSampleCv();
    const next = setAtPath(
      source,
      ["cv", "sections", 1, "entries", 0, "degree"],
      "DPhil",
    );
    expect(getAtPath(next, ["cv", "sections", 1, "entries", 0, "degree"])).toBe(
      "DPhil",
    );
    expect(
      getAtPath(source, ["cv", "sections", 1, "entries", 0, "degree"]),
    ).toBe("PhD");
    expect(next).not.toBe(source);
    expect(next.cv).not.toBe(source.cv);
  });

  it("moves and removes list values without mutating the original", () => {
    const items = ["alpha", "beta", "gamma"];
    expect(moveItem(items, 0, 1)).toEqual(["beta", "alpha", "gamma"]);
    expect(moveItem(items, 0, -1)).toBe(items);
    expect(removeItem(items, 1)).toEqual(["alpha", "gamma"]);
    expect(items).toEqual(["alpha", "beta", "gamma"]);
  });

  it("renders simple list markers in forward and reversed order", () => {
    expect(simpleListEntryMarker("BulletEntry", 0, 3)).toBe("•");
    expect(simpleListEntryMarker("NumberedEntry", 1, 3)).toBe("2.");
    expect(simpleListEntryMarker("ReversedNumberedEntry", 0, 3)).toBe("3.");
    expect(simpleListEntryMarker("ReversedNumberedEntry", 2, 3)).toBe("1.");
    expect(simpleListEntryMarker("TextEntry", 0, 1)).toBeNull();
  });

  it("serializes wrapped fragments and parses wrapped or unwrapped YAML", () => {
    const source = createSampleCv();
    expect(serializeFragment(source, "cv")).toContain("cv:\n  name: John Doe");

    const wrapped = parseFragment(
      "settings",
      "settings:\n  pdf_title: Example CV\n  extra: kept\n",
    );
    const unwrapped = parseFragment(
      "settings",
      "pdf_title: Example CV\nextra: kept\n",
    );
    expect(wrapped).toEqual(unwrapped);
    expect(wrapped).toMatchObject({ ok: true, value: { extra: "kept" } });
  });

  it("rejects malformed structures before the renderer sees them", () => {
    expect(parseFragment("cv", "cv:\n  sections: nope\n")).toEqual({
      ok: false,
      error: "cv.sections must be a list",
    });
    expect(
      parseFragment(
        "cv",
        "cv:\n  sections:\n    - id: bad\n      title: Bad\n      entry_type: UnknownEntry\n      entries: []\n",
      ),
    ).toMatchObject({ ok: false });
  });

  it("preserves invalid YAML text and the last valid structured source", () => {
    const source = createSampleCv();
    const invalidText = "cv:\n  name: [broken\n";
    const result = applyYamlEdit(source, "cv", invalidText);
    expect(result.applied).toBe(false);
    expect(result.text).toBe(invalidText);
    expect(result.source).toBe(source);
    expect(result.source.cv.name).toBe("John Doe");
    expect(result.error).toBeTruthy();
  });
});
