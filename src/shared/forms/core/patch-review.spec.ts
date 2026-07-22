import { describe, expect, it } from "vitest";

import {
  acceptedJsonReviewValue,
  createOrAppendJsonReview,
  pendingReviewChanges,
  previewJsonReviewChangeValue,
  previewJsonReviewValue,
  proposalReviewStatus,
  reviewChangeValuePreview,
  reviewIsResolved,
  setAllReviewChangesStatus,
  setReviewChangeStatus,
  setReviewProposalStatus,
  type FormPatchProposal,
} from "./patch-review";

type Profile = {
  name: string;
  headline: string;
  location: string;
  roles: string[];
};

function profile(): Profile {
  return {
    name: "Original Name",
    headline: "Engineer",
    location: "London",
    roles: ["Backend"],
  };
}

function proposal(id: string, path: string, value: unknown): FormPatchProposal {
  return {
    id,
    title: "Update profile",
    valid: true,
    operations: [{ op: "replace", path, value }],
  };
}

function multiProposal(): FormPatchProposal {
  return {
    id: "proposal-multi",
    title: "Update multiple fields",
    valid: true,
    operations: [
      { op: "replace", path: "/name", value: "AI Name" },
      { op: "replace", path: "/headline", value: "Principal Engineer" },
    ],
  };
}

describe("form patch review", () => {
  it("previews valid proposals without changing the base value", () => {
    expect.assertions(4);
    const base = profile();
    const review = createOrAppendJsonReview(
      null,
      "main",
      base,
      proposal("proposal-1", "/name", "AI Name"),
    );

    expect(previewJsonReviewValue(review).name).toBe("AI Name");
    expect(base.name).toBe("Original Name");
    expect(reviewIsResolved(review)).toBe(false);
    expect(review.changes[0]).toMatchObject({
      proposalId: "proposal-1",
      paths: ["/name"],
      status: "pending",
    });
  });

  it("keeps and rejects proposals from a stable base", () => {
    expect.assertions(3);
    const base = profile();
    const review = createOrAppendJsonReview(
      createOrAppendJsonReview(
        null,
        "main",
        base,
        proposal("proposal-1", "/name", "AI Name"),
      ),
      "main",
      base,
      proposal("proposal-2", "/headline", "Principal Engineer"),
    );
    const next = setReviewChangeStatus(
      setReviewChangeStatus(review, "proposal-1", "accepted"),
      "proposal-2",
      "rejected",
    );

    expect(reviewIsResolved(next)).toBe(true);
    expect(acceptedJsonReviewValue(next).name).toBe("AI Name");
    expect(acceptedJsonReviewValue(next).headline).toBe("Engineer");
  });

  it("splits independent proposal operations into separate review items", () => {
    expect.assertions(5);
    const review = createOrAppendJsonReview(
      null,
      "main",
      profile(),
      multiProposal(),
    );

    expect(review.changes).toHaveLength(2);
    expect(review.changes.map((change) => change.paths)).toEqual([
      ["/name"],
      ["/headline"],
    ]);
    expect(pendingReviewChanges(review)).toHaveLength(2);
    expect(proposalReviewStatus(review, "proposal-multi")).toBe("pending");
    expect(previewJsonReviewValue(review)).toMatchObject({
      name: "AI Name",
      headline: "Principal Engineer",
    });
  });

  it("normalizes missing optional fields in JSON review proposals", () => {
    const review = createOrAppendJsonReview(
      null,
      "prep",
      {
        stages: [
          {
            id: "stage-screen",
            type: "screen",
            name: "Screen",
            likelyQuestions: [
              {
                id: "question-delivery",
                prompt: "How do you handle delivery pressure?",
              },
            ],
          },
        ],
      },
      {
        id: "proposal-stage-category",
        kind: "application_prep",
        title: "Categorize question",
        valid: true,
        operations: [
          {
            op: "replace",
            path: "/stages/0/likelyQuestions/0/category",
            value: "delivery",
          },
        ],
      },
      "stages",
    );

    expect(review.changes[0].operations).toEqual([
      {
        op: "add",
        path: "/stages/0/likelyQuestions/0/category",
        value: "delivery",
      },
    ]);
    expect(previewJsonReviewValue(review)).toMatchObject({
      stages: [
        {
          likelyQuestions: [
            {
              category: "delivery",
            },
          ],
        },
      ],
    });
    expect(
      previewJsonReviewChangeValue(review, review.changes[0]),
    ).toMatchObject({
      stages: [
        {
          likelyQuestions: [
            {
              category: "delivery",
            },
          ],
        },
      ],
    });
  });

  it("can keep or undo all items from a proposal", () => {
    expect.assertions(3);
    const review = createOrAppendJsonReview(
      null,
      "main",
      profile(),
      multiProposal(),
    );
    const kept = setReviewProposalStatus(review, "proposal-multi", "accepted");

    expect(kept.changes.every((change) => change.status === "accepted")).toBe(
      true,
    );
    expect(reviewIsResolved(kept)).toBe(true);
    expect(acceptedJsonReviewValue(kept).headline).toBe("Principal Engineer");
  });

  it("deduplicates identical changes from repeated proposals", () => {
    expect.assertions(1);
    const base = profile();
    const first = createOrAppendJsonReview(
      null,
      "main",
      base,
      proposal("proposal-1", "/name", "AI Name"),
    );
    const second = createOrAppendJsonReview(
      first,
      "main",
      base,
      proposal("proposal-2", "/name", "AI Name"),
    );

    expect(second.changes).toHaveLength(1);
  });

  it("expands complex array replacements into item-level review changes", () => {
    expect.assertions(3);
    const base = profile();
    const nextRoles = ["Platform", "Staff"];
    const review = createOrAppendJsonReview(null, "main", base, {
      id: "proposal-array",
      title: "Rewrite roles",
      valid: true,
      operations: [{ op: "replace", path: "/roles", value: nextRoles }],
    });

    expect(review.changes.map((change) => change.paths)).toEqual([
      ["/roles/0"],
      ["/roles/1"],
    ]);
    expect(previewJsonReviewValue(review).roles).toEqual(nextRoles);
    expect(
      reviewChangeValuePreview(review, review.changes[0], "/roles/0"),
    ).toEqual({
      before: "Backend",
      after: "Platform",
    });
  });

  it("supports keeping all proposals", () => {
    expect.assertions(2);
    const base = profile();
    const review = createOrAppendJsonReview(
      null,
      "main",
      base,
      proposal("proposal-1", "/name", "AI Name"),
    );
    const next = setAllReviewChangesStatus(review, "accepted");

    expect(reviewIsResolved(next)).toBe(true);
    expect(acceptedJsonReviewValue(next).name).toBe("AI Name");
  });

  it("rejects paths outside requiredRoot", () => {
    expect.assertions(1);
    expect(() =>
      createOrAppendJsonReview(
        null,
        "notes",
        { notes: { title: "A" } },
        proposal("proposal-1", "/other/title", "B"),
        "notes",
      ),
    ).toThrow("Patch path must target /notes");
  });
});
