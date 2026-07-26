import {
  searchCatalog,
  type DocsMcpEntryKind,
  type DocsMcpSearchResult,
} from "./discovery.js";
import type { DocsMcpCatalog, DocsMcpConfig } from "./types.js";

export type DocsMcpEvalCase = {
  id?: string;
  query: string;
  expectedIds: string[];
  maxRank?: number;
  forbiddenIds?: string[];
  kinds?: DocsMcpEntryKind[];
};

export type DocsMcpEvalCaseResult = {
  id: string;
  query: string;
  expectedIds: string[];
  forbiddenIds: string[];
  maxRank: number;
  rank: number | null;
  topIds: string[];
  forbiddenHits: string[];
  passed: boolean;
};

export type DocsMcpEvalReport = {
  ok: boolean;
  caseCount: number;
  expectedResultCases: number;
  noResultCases: number;
  metrics: {
    top1Accuracy: number;
    hitAtK: number;
    k: number;
    meanReciprocalRank: number;
    noResultCorrectness: number;
    perKindCoverage: Record<
      DocsMcpEntryKind,
      { cases: number; hits: number; rate: number }
    >;
  };
  cases: DocsMcpEvalCaseResult[];
};

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 1 : Number((numerator / denominator).toFixed(4));
}

function catalogKindById(
  catalog: DocsMcpCatalog,
): Map<string, DocsMcpEntryKind> {
  return new Map([
    ...catalog.components.map((entry) => [entry.id, "component"] as const),
    ...catalog.documents.map((entry) => [entry.id, "guide"] as const),
    ...(catalog.artifacts ?? []).map(
      (entry) => [entry.id, entry.kind] as const,
    ),
  ]);
}

function bestRank(
  results: DocsMcpSearchResult[],
  expectedIds: string[],
): number | null {
  const ranks = expectedIds.flatMap((id) => {
    const index = results.findIndex((entry) => entry.id === id);
    return index === -1 ? [] : [index + 1];
  });
  return ranks.length ? Math.min(...ranks) : null;
}

export function evaluateCatalog(
  catalog: DocsMcpCatalog,
  config: DocsMcpConfig,
  cases: DocsMcpEvalCase[],
  options: { k?: number } = {},
): DocsMcpEvalReport {
  const k = Math.min(Math.max(1, options.k ?? 5), 20);
  const kindById = catalogKindById(catalog);
  const caseResults = cases.map((testCase, index): DocsMcpEvalCaseResult => {
    const maxRank = Math.min(Math.max(1, testCase.maxRank ?? k), 20);
    const result = searchCatalog(catalog, config, {
      query: testCase.query,
      kinds: testCase.kinds,
      limit: Math.max(k, maxRank),
    });
    const rank = bestRank(result.results, testCase.expectedIds);
    const forbiddenIds = testCase.forbiddenIds ?? [];
    const forbiddenHits = result.results
      .map((entry) => entry.id)
      .filter((id) => forbiddenIds.includes(id));
    const expectsNone = testCase.expectedIds.length === 0;
    return {
      id: testCase.id ?? `case-${index + 1}`,
      query: testCase.query,
      expectedIds: testCase.expectedIds,
      forbiddenIds,
      maxRank,
      rank,
      topIds: result.results.map((entry) => entry.id),
      forbiddenHits,
      passed: expectsNone
        ? result.results.length === 0 && forbiddenHits.length === 0
        : rank !== null && rank <= maxRank && forbiddenHits.length === 0,
    };
  });

  const positive = caseResults.filter((entry) => entry.expectedIds.length > 0);
  const noResult = caseResults.filter(
    (entry) => entry.expectedIds.length === 0,
  );
  const coverage: DocsMcpEvalReport["metrics"]["perKindCoverage"] = {
    component: { cases: 0, hits: 0, rate: 1 },
    guide: { cases: 0, hits: 0, rate: 1 },
    template: { cases: 0, hits: 0, rate: 1 },
    block: { cases: 0, hits: 0, rate: 1 },
  };
  for (const result of positive) {
    const kinds = new Set(
      result.expectedIds.flatMap((id) => {
        const kind = kindById.get(id);
        return kind ? [kind] : [];
      }),
    );
    for (const kind of kinds) {
      coverage[kind].cases += 1;
      if (result.rank !== null && result.rank <= result.maxRank) {
        coverage[kind].hits += 1;
      }
    }
  }
  for (const value of Object.values(coverage)) {
    value.rate = value.cases ? ratio(value.hits, value.cases) : 0;
  }

  return {
    ok: caseResults.every((entry) => entry.passed),
    caseCount: caseResults.length,
    expectedResultCases: positive.length,
    noResultCases: noResult.length,
    metrics: {
      top1Accuracy: ratio(
        positive.filter((entry) => entry.rank === 1).length,
        positive.length,
      ),
      hitAtK: ratio(
        positive.filter((entry) => entry.rank !== null && entry.rank <= k)
          .length,
        positive.length,
      ),
      k,
      meanReciprocalRank: positive.length
        ? Number(
            (
              positive.reduce(
                (sum, entry) => sum + (entry.rank ? 1 / entry.rank : 0),
                0,
              ) / positive.length
            ).toFixed(4),
          )
        : 1,
      noResultCorrectness: ratio(
        noResult.filter((entry) => entry.passed).length,
        noResult.length,
      ),
      perKindCoverage: coverage,
    },
    cases: caseResults,
  };
}
