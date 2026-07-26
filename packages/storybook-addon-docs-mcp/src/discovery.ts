import type {
  DocsMcpArtifact,
  DocsMcpCatalog,
  DocsMcpComponent,
  DocsMcpConfig,
  DocsMcpDocument,
  DocsMcpSection,
} from "./types.js";

export const DEFAULT_SEARCH_LIMIT = 8;
export const MAX_SEARCH_LIMIT = 20;
export const DEFAULT_BOUNDED_CHARS = 12_000;

export type DocsMcpEntryKind = "component" | "guide" | "template" | "block";
export type DocsMcpGetFormat = "bounded" | "full" | "dense";

export type DocsMcpSearchResult = {
  id: string;
  kind: DocsMcpEntryKind;
  name: string;
  summary: string;
  score: number;
  reason: string;
  path: string;
  importPath?: string;
};

export type DocsMcpSearchResponse = {
  query: string;
  normalizedQuery: string;
  results: DocsMcpSearchResult[];
  limit: number;
};

export type DocsMcpGetResponse = {
  status: "ok" | "not_found" | "ambiguous";
  requestedId: string;
  id?: string;
  kind?: DocsMcpEntryKind;
  name?: string;
  summary?: string;
  path?: string;
  importPath?: string;
  format?: DocsMcpGetFormat;
  section?: string;
  markdown?: string;
  truncated?: boolean;
  sections?: Array<{ id: string; title: string }>;
  relatedIds?: string[];
  candidates?: Array<{ id: string; kind: DocsMcpEntryKind; name: string }>;
  hint?: string;
};

type SearchableEntry = {
  id: string;
  kind: DocsMcpEntryKind;
  group: string;
  slug: string;
  name: string;
  summary: string;
  path: string;
  importPath?: string;
  markdown: string;
  keywords: string[];
  sections: DocsMcpSection[];
  relatedIds: string[];
  denseMarkdown?: string;
  component?: DocsMcpComponent;
  artifact?: DocsMcpArtifact;
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "component",
  "components",
  "documentation",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "please",
  "show",
  "that",
  "the",
  "this",
  "to",
  "use",
  "with",
]);

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stem(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith("ies") && token.length > 4)
    return `${token.slice(0, -3)}y`;
  if (token.endsWith("sses")) return token.slice(0, -2);
  if (token.endsWith("ing") && token.length > 5) return token.slice(0, -3);
  if (token.endsWith("ed") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("es") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s") && token.length > 3) return token.slice(0, -1);
  return token;
}

function rawTokens(value: string): string[] {
  return slugify(value).split("-").filter(Boolean).map(stem);
}

function meaningfulTokens(value: string): string[] {
  return rawTokens(value).filter((token) => !STOPWORDS.has(token));
}

function synonymMap(
  configured: string[][] | Record<string, string[]> | undefined,
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const groups = Array.isArray(configured)
    ? configured
    : Object.entries(configured ?? {}).map(([canonical, aliases]) => [
        canonical,
        ...aliases,
      ]);
  for (const group of groups) {
    const normalized = [...new Set(group.flatMap(rawTokens))];
    for (const token of normalized) {
      const values = map.get(token) ?? new Set<string>();
      for (const candidate of normalized) values.add(candidate);
      map.set(token, values);
    }
  }
  return map;
}

function tokenAlternatives(
  token: string,
  synonyms: Map<string, Set<string>>,
): Set<string> {
  return synonyms.get(token) ?? new Set([token]);
}

function markdownWithoutCode(markdown: string): string {
  return markdown.replace(/```[\s\S]*?```/g, " ");
}

export function parseMarkdownSections(markdown: string): DocsMcpSection[] {
  const lines = markdown.split(/\r?\n/);
  const sections: DocsMcpSection[] = [];
  const used = new Map<string, number>();
  let fenced = false;
  let current:
    | { id: string; title: string; start: number; level: number }
    | undefined;

  function finish(end: number): void {
    if (!current) return;
    sections.push({
      id: current.id,
      title: current.title,
      markdown: `${lines.slice(current.start, end).join("\n").trimEnd()}\n`,
    });
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const heading = /^(#{2,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) continue;
    finish(index);
    const title = heading[2]!.trim();
    const base = slugify(title) || "section";
    const occurrence = (used.get(base) ?? 0) + 1;
    used.set(base, occurrence);
    current = {
      id: occurrence === 1 ? base : `${base}-${occurrence}`,
      title,
      start: index,
      level: heading[1]!.length,
    };
  }
  finish(lines.length);
  return sections;
}

function overviewMarkdown(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  let fenced = false;
  const end = lines.findIndex((line) => {
    if (/^\s*```/.test(line)) fenced = !fenced;
    return !fenced && /^#{2,6}\s+/.test(line);
  });
  return `${lines
    .slice(0, end === -1 ? lines.length : end)
    .join("\n")
    .trimEnd()}\n`;
}

function entryMarkdown(
  entry: DocsMcpComponent | DocsMcpDocument | DocsMcpArtifact,
): string {
  return "documentation" in entry ? entry.documentation : entry.markdown;
}

function normalizedSections(
  entry: DocsMcpComponent | DocsMcpDocument | DocsMcpArtifact,
): DocsMcpSection[] {
  return entry.sections?.length
    ? entry.sections
    : parseMarkdownSections(entryMarkdown(entry));
}

function searchableEntries(catalog: DocsMcpCatalog): SearchableEntry[] {
  const components = catalog.components.map(
    (entry): SearchableEntry => ({
      ...entry,
      kind: "component",
      keywords: entry.keywords ?? [],
      sections: normalizedSections(entry),
      relatedIds: entry.relatedIds ?? [],
      component: entry,
    }),
  );
  const guides = catalog.documents.map(
    (entry): SearchableEntry => ({
      ...entry,
      kind: "guide",
      keywords: entry.keywords ?? [],
      sections: normalizedSections(entry),
      relatedIds: entry.relatedIds ?? [],
    }),
  );
  const artifacts = (catalog.artifacts ?? []).map(
    (entry): SearchableEntry => ({
      ...entry,
      markdown: entry.documentation,
      keywords: entry.keywords ?? [],
      sections: normalizedSections(entry),
      relatedIds: entry.relatedIds ?? [],
      artifact: entry,
    }),
  );
  return [...components, ...guides, ...artifacts];
}

export function normalizeCatalog(catalog: DocsMcpCatalog): DocsMcpCatalog {
  return {
    ...catalog,
    components: catalog.components.map((entry) => ({
      ...entry,
      sections: normalizedSections(entry),
    })),
    documents: catalog.documents.map((entry) => ({
      ...entry,
      sections: normalizedSections(entry),
    })),
    artifacts: (catalog.artifacts ?? []).map((entry) => ({
      ...entry,
      sections: normalizedSections(entry),
    })),
  };
}

function levenshtein(left: string, right: string): number {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    const next = [i];
    for (let j = 1; j <= right.length; j++) {
      next[j] = Math.min(
        next[j - 1]! + 1,
        previous[j]! + 1,
        previous[j - 1]! + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
    previous = next;
  }
  return previous[right.length]!;
}

function containsAll(
  haystack: Set<string>,
  query: string[],
  synonyms: Map<string, Set<string>>,
): boolean {
  return query.every((token) =>
    [...tokenAlternatives(token, synonyms)].some((value) =>
      haystack.has(value),
    ),
  );
}

function coverage(
  haystack: Set<string>,
  query: string[],
  synonyms: Map<string, Set<string>>,
): number {
  if (query.length === 0) return 0;
  const hits = query.filter((token) =>
    [...tokenAlternatives(token, synonyms)].some((value) =>
      haystack.has(value),
    ),
  ).length;
  return hits / query.length;
}

function scoreEntry(
  entry: SearchableEntry,
  queryPhrase: string,
  queryTokens: string[],
  synonyms: Map<string, Set<string>>,
): { score: number; reason: string } | undefined {
  const namePhrase = slugify(entry.name);
  const idPhrase = slugify(entry.id);
  const slugPhrase = slugify(entry.slug);
  if (
    queryPhrase === namePhrase ||
    queryPhrase === idPhrase ||
    queryPhrase === slugPhrase
  ) {
    return { score: 100, reason: "exact name or ID" };
  }

  const keywordPhrases = entry.keywords.map(slugify);
  if (keywordPhrases.includes(queryPhrase)) {
    return { score: 92, reason: "authored keyword" };
  }

  const nameTokens = new Set(
    rawTokens(`${entry.name} ${entry.id} ${entry.slug}`),
  );
  const keywordTokens = new Set(entry.keywords.flatMap(rawTokens));
  const summaryTokens = new Set(rawTokens(entry.summary));
  const sectionTokens = new Set(
    entry.sections.flatMap((section) =>
      rawTokens(`${section.title} ${markdownWithoutCode(section.markdown)}`),
    ),
  );

  if (containsAll(keywordTokens, queryTokens, synonyms)) {
    return { score: 84, reason: "authored keyword proximity" };
  }
  if (containsAll(nameTokens, queryTokens, synonyms)) {
    return { score: 76, reason: "name terms" };
  }

  const nameTypos = queryTokens.map((token) => {
    const alternatives = [...tokenAlternatives(token, synonyms)];
    if (alternatives.some((candidate) => nameTokens.has(candidate))) return 0;
    return Math.min(
      ...alternatives.flatMap((candidate) =>
        [...nameTokens].map((nameToken) => levenshtein(candidate, nameToken)),
      ),
      Number.POSITIVE_INFINITY,
    );
  });
  const typoMatch = nameTypos.every((distance, index) => {
    const token = queryTokens[index]!;
    const allowed = token.length >= 7 ? 2 : token.length >= 4 ? 1 : 0;
    return distance <= allowed;
  });
  if (typoMatch && nameTypos.some((distance) => distance > 0)) {
    return {
      score: 70 - Math.max(...nameTypos),
      reason: "typo-tolerant name",
    };
  }

  const nameCoverage = coverage(nameTokens, queryTokens, synonyms);
  const keywordCoverage = coverage(keywordTokens, queryTokens, synonyms);
  if (keywordCoverage >= 0.6) {
    return {
      score: Math.round(66 + keywordCoverage * 8),
      reason: "related authored keywords",
    };
  }
  if (nameCoverage >= 0.6) {
    return {
      score: Math.round(60 + nameCoverage * 8),
      reason: "related name terms",
    };
  }
  if (containsAll(summaryTokens, queryTokens, synonyms)) {
    return { score: 58, reason: "description" };
  }
  if (containsAll(sectionTokens, queryTokens, synonyms)) {
    return { score: 46, reason: "section prose" };
  }
  return undefined;
}

export function searchCatalog(
  catalog: DocsMcpCatalog,
  config: DocsMcpConfig,
  options: {
    query: string;
    kinds?: DocsMcpEntryKind[];
    limit?: number;
  },
): DocsMcpSearchResponse {
  const configuredDefault = config.search?.defaultLimit ?? DEFAULT_SEARCH_LIMIT;
  const configuredMax = config.search?.maxLimit ?? MAX_SEARCH_LIMIT;
  const maxLimit = Math.min(Math.max(1, configuredMax), MAX_SEARCH_LIMIT);
  const limit = Math.min(
    Math.max(1, options.limit ?? configuredDefault),
    maxLimit,
  );
  const queryPhrase = slugify(options.query);
  const queryTokens = meaningfulTokens(options.query);
  if (!queryPhrase || queryTokens.length === 0) {
    return {
      query: options.query,
      normalizedQuery: queryTokens.join(" "),
      results: [],
      limit,
    };
  }
  const synonyms = synonymMap(config.search?.synonyms);
  const kinds = options.kinds?.length ? new Set(options.kinds) : undefined;
  const results = searchableEntries(catalog)
    .filter((entry) => !kinds || kinds.has(entry.kind))
    .flatMap((entry) => {
      const match = scoreEntry(entry, queryPhrase, queryTokens, synonyms);
      return match
        ? [
            {
              id: entry.id,
              kind: entry.kind,
              name: entry.name,
              summary: entry.summary,
              score: match.score,
              reason: match.reason,
              path: entry.path,
              ...(entry.importPath ? { importPath: entry.importPath } : {}),
            },
          ]
        : [];
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.name.localeCompare(right.name) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, limit);
  return {
    query: options.query,
    normalizedQuery: queryTokens.join(" "),
    results,
    limit,
  };
}

function denseMarkdown(entry: SearchableEntry): string {
  if (entry.denseMarkdown) return entry.denseMarkdown;
  const lines = [
    `# ${entry.name}`,
    "",
    entry.summary,
    "",
    `- ID: \`${entry.id}\``,
    `- Kind: \`${entry.kind}\``,
    `- Source: \`${entry.path}\``,
  ];
  if (entry.importPath) lines.push(`- Import: \`${entry.importPath}\``);
  if (entry.keywords.length) {
    lines.push(
      `- Keywords: ${entry.keywords.map((item) => `\`${item}\``).join(", ")}`,
    );
  }
  if (entry.relatedIds.length) {
    lines.push(
      `- Related IDs: ${entry.relatedIds.map((item) => `\`${item}\``).join(", ")}`,
    );
  }
  if (entry.component?.reactDocgen) {
    const names = Object.keys(entry.component.reactDocgen.props);
    if (names.length)
      lines.push(`- Props: ${names.map((name) => `\`${name}\``).join(", ")}`);
  }
  if (entry.component?.stories?.length) {
    lines.push("", "## Examples", "");
    for (const story of entry.component.stories) {
      lines.push(`### ${story.name}`, "");
      if (story.snippet) lines.push(story.snippet, "");
    }
  }
  if (entry.artifact?.componentIds.length) {
    lines.push(
      "",
      "## Components",
      "",
      ...entry.artifact.componentIds.map((id) => `- \`${id}\``),
    );
  }
  if (entry.sections.length) {
    lines.push(
      "",
      "## Sections",
      "",
      ...entry.sections.map(
        (section) => `- \`${section.id}\` — ${section.title}`,
      ),
    );
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function boundedMarkdown(
  entry: SearchableEntry,
  budget: number,
): { markdown: string; truncated: boolean; hint?: string } {
  if (entry.markdown.length <= budget) {
    return { markdown: entry.markdown, truncated: false };
  }
  const hint = `Call get with id "${entry.id}", section "<section-id>" for one section, or format "full" for all authored prose.`;
  const index = [
    "",
    "## Section index",
    "",
    ...entry.sections.map(
      (section) => `- \`${section.id}\` — ${section.title}`,
    ),
    "",
    `> ${hint}`,
    "",
  ].join("\n");
  const overview = overviewMarkdown(entry.markdown);
  const header = [
    `# ${entry.name}`,
    "",
    entry.summary,
    "",
    `ID: \`${entry.id}\``,
    "",
  ].join("\n");
  const allowance = Math.max(0, budget - header.length - index.length);
  const paragraphs = overview
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  const selected: string[] = [];
  let used = 0;
  for (const paragraph of paragraphs) {
    const extra = paragraph.length + (selected.length ? 2 : 0);
    if (used + extra > allowance) break;
    selected.push(paragraph);
    used += extra;
  }
  const body = selected.length ? `${selected.join("\n\n")}\n` : "";
  return {
    markdown: `${header}${body}${index}`.slice(0, budget),
    truncated: true,
    hint,
  };
}

export function getCatalogEntry(
  catalog: DocsMcpCatalog,
  config: DocsMcpConfig,
  options: {
    id: string;
    section?: string;
    format?: DocsMcpGetFormat;
  },
): DocsMcpGetResponse {
  const entries = searchableEntries(catalog);
  const requested = options.id.trim();
  let matches = entries.filter((entry) => entry.id === requested);
  if (matches.length === 0) {
    const normalized = slugify(requested);
    matches = entries.filter(
      (entry) =>
        slugify(entry.name) === normalized ||
        slugify(entry.slug) === normalized,
    );
  }
  if (matches.length === 0) {
    return {
      status: "not_found",
      requestedId: requested,
      candidates: [],
      hint: "Use search to discover an exact documentation ID.",
    };
  }
  if (matches.length > 1) {
    return {
      status: "ambiguous",
      requestedId: requested,
      candidates: matches.map((entry) => ({
        id: entry.id,
        kind: entry.kind,
        name: entry.name,
      })),
      hint: "Retry get with one exact candidate ID.",
    };
  }

  const entry = matches[0]!;
  const format = options.format ?? "bounded";
  let markdown: string;
  let truncated = false;
  let hint: string | undefined;
  let selectedSection: DocsMcpSection | undefined;
  if (options.section) {
    const normalized = slugify(options.section);
    const sectionMatches = entry.sections.filter(
      (section) =>
        section.id === options.section ||
        slugify(section.title) === normalized ||
        section.id.includes(normalized),
    );
    if (sectionMatches.length !== 1) {
      return {
        status: sectionMatches.length ? "ambiguous" : "not_found",
        requestedId: requested,
        id: entry.id,
        kind: entry.kind,
        name: entry.name,
        candidates: sectionMatches.map((section) => ({
          id: `${entry.id}#${section.id}`,
          kind: entry.kind,
          name: section.title,
        })),
        sections: entry.sections.map(({ id, title }) => ({ id, title })),
        hint: sectionMatches.length
          ? "Retry with one exact section ID."
          : "Use one of the listed section IDs.",
      };
    }
    selectedSection = sectionMatches[0];
    markdown = selectedSection!.markdown;
  } else if (format === "full") {
    markdown = entry.markdown;
  } else if (format === "dense") {
    markdown = denseMarkdown(entry);
  } else {
    const bounded = boundedMarkdown(
      entry,
      Math.max(500, config.retrieval?.maxChars ?? DEFAULT_BOUNDED_CHARS),
    );
    markdown = bounded.markdown;
    truncated = bounded.truncated;
    hint = bounded.hint;
  }

  return {
    status: "ok",
    requestedId: requested,
    id: entry.id,
    kind: entry.kind,
    name: entry.name,
    summary: entry.summary,
    path: entry.path,
    ...(entry.importPath ? { importPath: entry.importPath } : {}),
    format,
    ...(selectedSection ? { section: selectedSection.id } : {}),
    markdown,
    truncated,
    sections: entry.sections.map(({ id, title }) => ({ id, title })),
    relatedIds: entry.relatedIds,
    ...(hint ? { hint } : {}),
  };
}
