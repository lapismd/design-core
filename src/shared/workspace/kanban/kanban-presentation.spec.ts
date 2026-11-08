import { describe, expect, it } from "vitest";
import {
  resolveKanbanAnchor,
  buildKanbanActivityDays,
} from "./kanban-presentation.js";

const columns = [
  { id: "collect", label: "Collect", color: "#0e7490", cards: [] },
  {
    id: "reflect",
    label: "Reflect",
    color: "#4d7c0f",
    primary: true,
    cards: [],
  },
];
const card = { id: "note.md", title: "A note", color: "#0e7490" };

describe("kanban presentation", () => {
  it("preserves the legacy anchor only when the override is omitted", () => {
    expect(resolveKanbanAnchor(columns, undefined)).toBe("reflect");
    expect(resolveKanbanAnchor(columns, null)).toBeNull();
    expect(resolveKanbanAnchor(columns, "collect")).toBe("collect");
    expect(resolveKanbanAnchor(columns, "missing")).toBeNull();
    expect(resolveKanbanAnchor([], undefined)).toBeNull();
  });

  it("keeps calendar dates literal and sorts newest days first", () => {
    const days = buildKanbanActivityDays([
      { card, columnId: "collect", date: "2026-06-25" },
      {
        card: { ...card, id: "later.md" },
        columnId: "reflect",
        date: "2026-06-27",
      },
    ]);
    expect(days.map((day) => day.key)).toEqual(["2026-06-27", "2026-06-25"]);
    expect(days[1].entries[0].card.id).toBe("note.md");
  });

  it("keeps invalid and absent dates in one reachable undated section", () => {
    const days = buildKanbanActivityDays([
      { card, columnId: "collect", date: "2026-02-31" },
      {
        card: { ...card, id: "invalid.md" },
        columnId: "reflect",
        date: "invalid",
      },
      { card: { ...card, id: "empty.md" }, columnId: "reflect", date: null },
    ]);
    expect(days).toHaveLength(1);
    expect(days[0].key).toBe("undated");
    expect(days[0].entries).toHaveLength(3);
  });

  it("orders timestamps within a day and preserves ties", () => {
    const days = buildKanbanActivityDays([
      { card, columnId: "collect", date: "2026-06-25T09:00:00Z" },
      {
        card: { ...card, id: "later.md" },
        columnId: "reflect",
        date: "2026-06-25T12:00:00Z",
      },
      {
        card: { ...card, id: "tie.md" },
        columnId: "reflect",
        date: "2026-06-25T12:00:00Z",
      },
    ]);
    expect(days[0].entries.map((entry) => entry.card.id)).toEqual([
      "later.md",
      "tie.md",
      "note.md",
    ]);
  });
});
