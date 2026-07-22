import { describe, expect, it, vi } from "vitest";

import { createOrAppendJsonReview } from "../core/patch-review";
import { fieldReviewContextFromReview } from "./field-review-context";

describe("fieldReviewContextFromReview", () => {
  it("maps scalar and list pending paths into field review context", () => {
    const base = { name: "Ada", roles: ["Backend"] };
    const review = createOrAppendJsonReview(null, "story", base, {
      id: "proposal-1",
      title: "Update",
      valid: true,
      operations: [
        { op: "replace", path: "/name", value: "Grace" },
        { op: "replace", path: "/roles/0", value: "Staff" },
      ],
    });
    const onKeep = vi.fn();
    const onUndo = vi.fn();
    const context = fieldReviewContextFromReview(review, onKeep, onUndo);

    expect(context.reviewForField?.("name")).toMatchObject({
      removedValue: "Ada",
    });
    expect(context.reviewForField?.("roles")).toBeNull();
    expect(context.reviewItemsForField?.("roles")[0]).toMatchObject({
      removedValue: "Backend",
    });

    context.reviewForField?.("name")?.onKeep?.();
    expect(onKeep).toHaveBeenCalled();
  });
});
