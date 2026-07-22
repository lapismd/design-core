import type {
  BulletEntry,
  CvEntry,
  CvEntryType,
  CvSection,
  EducationEntry,
  ExperienceEntry,
  NormalEntry,
  NumberedEntry,
  OneLineEntry,
  PublicationEntry,
  ReversedNumberedEntry,
} from "./types";

export const ENTRY_TYPE_OPTIONS: Array<{
  value: CvEntryType;
  label: string;
  addLabel: string;
}> = [
  { value: "TextEntry", label: "Text", addLabel: "text" },
  {
    value: "ExperienceEntry",
    label: "Experience Entry",
    addLabel: "experience entry",
  },
  {
    value: "EducationEntry",
    label: "Education Entry",
    addLabel: "education entry",
  },
  {
    value: "PublicationEntry",
    label: "Publication Entry",
    addLabel: "publication entry",
  },
  {
    value: "OneLineEntry",
    label: "One-Line Entry",
    addLabel: "one-line entry",
  },
  { value: "BulletEntry", label: "Bullet Entry", addLabel: "bullet entry" },
  {
    value: "NumberedEntry",
    label: "Numbered Entry",
    addLabel: "numbered entry",
  },
  {
    value: "ReversedNumberedEntry",
    label: "Reversed Numbered Entry",
    addLabel: "reversed numbered entry",
  },
  { value: "NormalEntry", label: "Normal Entry", addLabel: "normal entry" },
];

function stableId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function createSectionId(
  title: string,
  existingIds: Iterable<string> = [],
) {
  const base = stableId(title) || "section";
  const ids = new Set(existingIds);
  if (!ids.has(base)) return base;
  let index = 2;
  while (ids.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

export function entryTypeLabel(entryType: CvEntryType) {
  return (
    ENTRY_TYPE_OPTIONS.find((option) => option.value === entryType)?.label ??
    entryType
  );
}

export function addEntryLabel(entryType: CvEntryType) {
  return (
    ENTRY_TYPE_OPTIONS.find((option) => option.value === entryType)?.addLabel ??
    "entry"
  );
}

export function defaultEntry(entryType: CvEntryType): CvEntry {
  if (entryType === "TextEntry") return "";
  if (entryType === "ExperienceEntry") {
    return {
      company: "New company",
      position: "Role",
      location: "",
      start_date: "",
      end_date: "",
      display_date: "",
      role_history: [],
      extra_details: [],
      highlights: [""],
    } satisfies ExperienceEntry;
  }
  if (entryType === "EducationEntry") {
    return {
      institution: "Institution",
      degree: "",
      area: "",
      location: "",
      start_date: "",
      end_date: "",
      display_date: "",
      highlights: [],
    } satisfies EducationEntry;
  }
  if (entryType === "PublicationEntry") {
    return {
      title: "Publication title",
      authors: [""],
      journal: "",
      date: "",
    } satisfies PublicationEntry;
  }
  if (entryType === "OneLineEntry") {
    return { label: "Label", details: "" } satisfies OneLineEntry;
  }
  if (entryType === "BulletEntry") {
    return { bullet: "" } satisfies BulletEntry;
  }
  if (entryType === "NumberedEntry") {
    return { number: "" } satisfies NumberedEntry;
  }
  if (entryType === "ReversedNumberedEntry") {
    return { reversed_number: "" } satisfies ReversedNumberedEntry;
  }
  return {
    name: "New entry",
    date: "",
    location: "",
    summary: "",
    highlights: [],
  } satisfies NormalEntry;
}

export function defaultSection(
  entryType: CvEntryType,
  existingIds: Iterable<string> = [],
): CvSection {
  const title =
    entryType === "TextEntry"
      ? "New Section"
      : entryTypeLabel(entryType).replace(" Entry", "");
  return {
    id: createSectionId(title, existingIds),
    title,
    entry_type: entryType,
    entries: [defaultEntry(entryType)],
  };
}

export function entryTitle(
  entryType: CvEntryType,
  entry: CvEntry,
  index: number,
) {
  if (entryType === "TextEntry") {
    return typeof entry === "string" && entry.trim()
      ? entry.trim().slice(0, 80)
      : `Text ${index + 1}`;
  }
  if (!isRecord(entry)) return `${entryTypeLabel(entryType)} ${index + 1}`;
  const record = entry as Record<string, unknown>;
  if (entryType === "ExperienceEntry") {
    return (
      [record.company, record.position].filter(Boolean).join(" - ") ||
      `Experience ${index + 1}`
    );
  }
  if (entryType === "EducationEntry") {
    return (
      [record.institution, record.area].filter(Boolean).join(" - ") ||
      `Education ${index + 1}`
    );
  }
  if (entryType === "PublicationEntry")
    return String(record.title || `Publication ${index + 1}`);
  if (entryType === "OneLineEntry")
    return String(record.label || `One-line ${index + 1}`);
  if (entryType === "BulletEntry")
    return String(record.bullet || `Bullet ${index + 1}`).slice(0, 80);
  if (entryType === "NumberedEntry")
    return String(record.number || `Numbered ${index + 1}`).slice(0, 80);
  if (entryType === "ReversedNumberedEntry") {
    return String(
      record.reversed_number || `Reversed numbered ${index + 1}`,
    ).slice(0, 80);
  }
  return String(record.name || `Entry ${index + 1}`);
}

export function isSimpleListEntryType(entryType: CvEntryType) {
  return (
    entryType === "BulletEntry" ||
    entryType === "NumberedEntry" ||
    entryType === "ReversedNumberedEntry"
  );
}

export function simpleListValue(
  entryType: CvEntryType,
  entry: CvEntry,
): string {
  if (!isRecord(entry)) return "";
  const record = entry as Record<string, unknown>;
  if (entryType === "BulletEntry") return String(record.bullet ?? "");
  if (entryType === "NumberedEntry") return String(record.number ?? "");
  if (entryType === "ReversedNumberedEntry")
    return String(record.reversed_number ?? "");
  return "";
}

export function setSimpleListValue(
  entryType: CvEntryType,
  value: string,
): CvEntry {
  if (entryType === "BulletEntry") return { bullet: value };
  if (entryType === "NumberedEntry") return { number: value };
  return { reversed_number: value };
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
