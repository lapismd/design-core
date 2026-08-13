import { describe, expect, it } from "vitest";
import { createFormController } from "../core/form-controller.svelte";
import {
  isControllableFormGroupDisclosure,
  registerConfiguredArraySectionDisclosures,
} from "./disclosure-policy";

describe("structured form disclosure policy", () => {
  it("keeps hidden-header groups outside controller-wide collapse", () => {
    expect(
      isControllableFormGroupDisclosure({
        title: "Sections",
        collapsible: true,
        hiddenHeader: true,
      }),
    ).toBe(false);
    expect(
      isControllableFormGroupDisclosure({
        title: "Sections",
        collapsible: true,
      }),
    ).toBe(true);
  });

  it("registers visible array sections for controller-wide collapse", () => {
    const controller = createFormController({ defaultValues: {} });

    registerConfiguredArraySectionDisclosures(
      controller,
      "complete-cv",
      "sections",
      ["sections:summary", "sections:experience"],
    );

    expect(controller.allDisclosuresCollapsed()).toBe(false);
    controller.collapseAll();
    expect(controller.allDisclosuresCollapsed()).toBe(true);
    expect(
      controller.isDisclosureOpen("complete-cv:sections:sections:summary"),
    ).toBe(false);
  });
});
