/** Self-contained reference, adapted from CV Studio 34486d1e sample roles.
 * Presentation reference only: phase, summary and highlight are ordinary metadata.
 * Fixed dates keep both catalogs deterministic; no CV checkout/runtime is needed.
 */
export const referenceNotes = [
  {
    collection: "roles",
    path: "Roles/Atlas.md",
    title: "Engineering Manager, Infrastructure",
    phase: "Applied",
    owner: "Rina Shah",
    tags: ["management", "infrastructure"],
    date: "2026-06-25",
    highlight: "2026-07-01",
    body: "Submitted with a platform-leadership CV variant.\n\n## Preparation\n\n- Review platform reliability examples.\n- Prepare questions for the team.",
  },
  {
    collection: "roles",
    path: "Roles/Harbour.md",
    title: "Solutions Architect",
    phase: "Interview",
    owner: "Aisha Grant",
    tags: ["payments", "architecture"],
    date: "2026-06-26",
    highlight: "Technical interview",
    body: "Prepare a systems design walkthrough for high-volume payment processing.\n\n## Evidence\n\nPayment continuity during infrastructure changes.",
  },
  {
    collection: "notes",
    path: "Research/Fieldwork.md",
    title: "Field observations",
    phase: "Collect",
    owner: "Maya Chen",
    tags: ["research", "fieldwork"],
    date: "2026-06-25",
    highlight: 0,
    body: "Capture observations from the riverside field visit.\n\n## Findings\n\nKeep raw observations separate from interpretation.",
  },
  {
    collection: "notes",
    path: "Research/Synthesis.md",
    title: "Research synthesis",
    phase: "Reflect",
    owner: "Leo Martins",
    tags: ["research"],
    date: "2026-06-27",
    highlight: false,
    body: "Connect field notes with the interview findings.\n\n## Questions\n\nWhich patterns recur across sources?",
  },
  {
    collection: "tasks",
    path: "Tasks/Review.md",
    title: "Review the release notes",
    phase: "Doing",
    owner: "Priya Shah",
    tags: ["release"],
    date: "2026-06-26",
    highlight: "Needs review",
    body: "Check the release notes against the public contracts.\n\n- [ ] Verify examples\n- [ ] Check package versions",
  },
  {
    collection: "tasks",
    path: "Tasks/Publish.md",
    title: "Prepare publication",
    phase: "Next",
    owner: "Maya Chen",
    tags: ["release", "docs"],
    date: "",
    highlight: 3,
    body: "Prepare the documentation for publication.\n\nPublication requires a separate release approval.",
  },
] as const;

export type ReferenceCollection = "roles" | "notes" | "tasks";

export function referenceFiles(
  collection: ReferenceCollection,
): Record<string, string> {
  return Object.fromEntries(
    referenceNotes
      .filter((note) => note.collection === collection)
      .map((note) => [
        note.path,
        "---\n" +
          Object.entries({
            title: note.title,
            phase: note.phase,
            owner: note.owner,
            tags: [...note.tags],
            occurred: note.date || null,
            highlight: note.highlight,
            description: note.body.split("\n\n")[0],
          })
            .map(([key, value]) => key + ": " + JSON.stringify(value))
            .join("\n") +
          "\n---\n\n" +
          note.body +
          "\n",
      ]),
  );
}
