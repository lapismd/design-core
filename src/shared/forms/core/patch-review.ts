import {
  applyJsonPatch,
  pointerParts,
  pointerValue,
  type JsonPatchOperation,
} from "./json-patch";

export type FormPatchProposal = {
  id: string;
  kind?: string;
  base?: {
    fileId?: string;
    updatedAt?: string;
    sourceHash?: string;
    schemaVersion?: string;
    [key: string]: unknown;
  };
  title: string;
  operations: JsonPatchOperation[];
  valid: boolean;
  errors?: string[];
  preview?: Record<string, unknown>;
};

export type FormReviewChangeStatus = "pending" | "accepted" | "rejected";

export type FormReviewChange = {
  id: string;
  proposalId: string;
  title: string;
  operations: JsonPatchOperation[];
  paths: string[];
  status: FormReviewChangeStatus;
  base?: FormPatchProposal["base"];
  createdAt: string;
  updatedAt: string;
};

export type FormReviewState<T> = {
  fileId: string;
  /** When set, all operations must target `/${requiredRoot}` or nested paths. */
  requiredRoot?: string;
  baseValue: T;
  baseValueHash?: string;
  createdAt: string;
  updatedAt: string;
  stale?: boolean;
  changes: FormReviewChange[];
};

export type FormReviewSummary = {
  id: string;
  proposalId: string;
  title: string;
  status: FormReviewChangeStatus;
  paths: string[];
};

type FormReviewChangeCollection = {
  changes: FormReviewChange[];
};

type FormMutableReviewState = FormReviewChangeCollection & {
  updatedAt: string;
};

export function pendingReviewChanges(
  review: FormReviewChangeCollection | null,
) {
  return review?.changes.filter((change) => change.status === "pending") ?? [];
}

export function activeReviewChanges(review: FormReviewChangeCollection | null) {
  return review?.changes.filter((change) => change.status !== "rejected") ?? [];
}

export function acceptedReviewChanges(
  review: FormReviewChangeCollection | null,
) {
  return review?.changes.filter((change) => change.status === "accepted") ?? [];
}

export function summarizeReviewChanges(
  review: FormReviewChangeCollection | null,
): FormReviewSummary[] {
  return (
    review?.changes.map((change) => ({
      id: change.id,
      proposalId: change.proposalId,
      title: change.title,
      status: change.status,
      paths: change.paths,
    })) ?? []
  );
}

function now() {
  return new Date().toISOString();
}

function operationPaths(operations: JsonPatchOperation[]) {
  return Array.from(new Set(operations.map((operation) => operation.path)));
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function operationSignature(operation: JsonPatchOperation) {
  return operation.op === "remove"
    ? `${operation.op}:${operation.path}`
    : `${operation.op}:${operation.path}:${stableStringify(operation.value)}`;
}

function changeSignature(operations: JsonPatchOperation[]) {
  return operations.map(operationSignature).sort().join("|");
}

function encodePointerSegment(segment: string) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function pathContains(parent: string, child: string) {
  return child === parent || child.startsWith(`${parent}/`);
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isComplexValue(value: unknown) {
  return Boolean(value && typeof value === "object");
}

function childPath(path: string, key: string | number) {
  return `${path}/${encodePointerSegment(String(key))}`;
}

function diffComplexValue(
  before: unknown,
  after: unknown,
  path: string,
): JsonPatchOperation[] {
  if (valuesEqual(before, after)) return [];
  if (Array.isArray(before) && Array.isArray(after)) {
    const operations: JsonPatchOperation[] = [];
    const sharedLength = Math.min(before.length, after.length);
    for (let index = 0; index < sharedLength; index += 1) {
      operations.push(
        ...diffComplexValue(
          before[index],
          after[index],
          childPath(path, index),
        ),
      );
    }
    for (let index = before.length - 1; index >= after.length; index -= 1) {
      operations.push({ op: "remove", path: childPath(path, index) });
    }
    for (let index = before.length; index < after.length; index += 1) {
      operations.push({
        op: "add",
        path: childPath(path, index),
        value: after[index],
      });
    }
    return operations;
  }
  if (
    before &&
    after &&
    typeof before === "object" &&
    typeof after === "object" &&
    !Array.isArray(before) &&
    !Array.isArray(after)
  ) {
    const operations: JsonPatchOperation[] = [];
    const beforeRecord = before as Record<string, unknown>;
    const afterRecord = after as Record<string, unknown>;
    const keys = Array.from(
      new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)]),
    );
    for (const key of keys) {
      const pathForKey = childPath(path, key);
      if (!(key in afterRecord)) {
        operations.push({ op: "remove", path: pathForKey });
      } else if (!(key in beforeRecord)) {
        operations.push({
          op: "add",
          path: pathForKey,
          value: afterRecord[key],
        });
      } else {
        operations.push(
          ...diffComplexValue(beforeRecord[key], afterRecord[key], pathForKey),
        );
      }
    }
    return operations;
  }
  return [{ op: "replace", path, value: after }];
}

function expandOperationForReview(
  baseSource: unknown,
  operation: JsonPatchOperation,
) {
  if (operation.op !== "replace" || !isComplexValue(operation.value)) {
    return [operation];
  }
  const before = pointerValue(baseSource, operation.path);
  if (!isComplexValue(before)) return [operation];
  const expanded = diffComplexValue(before, operation.value, operation.path);
  return expanded.length ? expanded : [operation];
}

function expandOperationsForReview(
  baseSource: unknown,
  operations: JsonPatchOperation[],
) {
  return operations.flatMap((operation) =>
    expandOperationForReview(baseSource, operation),
  );
}

function jsonPointerPartsExist(root: unknown, parts: string[]) {
  let target = root;
  for (const part of parts) {
    if (Array.isArray(target)) {
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= target.length) {
        return false;
      }
      target = target[index];
    } else if (target && typeof target === "object") {
      if (!(part in target)) return false;
      target = (target as Record<string, unknown>)[part];
    } else {
      return false;
    }
  }
  return true;
}

export function normalizeJsonReviewOperations(
  baseSource: unknown,
  operations: JsonPatchOperation[],
): JsonPatchOperation[] {
  return operations.map((operation) => {
    if (operation.op !== "replace") return operation;
    const parts = pointerParts(operation.path);
    if (jsonPointerPartsExist(baseSource, parts)) return operation;
    if (!jsonPointerPartsExist(baseSource, parts.slice(0, -1)))
      return operation;
    return { op: "add", path: operation.path, value: operation.value };
  });
}

function operationsAreRelated(
  left: JsonPatchOperation[],
  right: JsonPatchOperation[],
) {
  return left.some((leftOperation) =>
    right.some(
      (rightOperation) =>
        pathContains(leftOperation.path, rightOperation.path) ||
        pathContains(rightOperation.path, leftOperation.path),
    ),
  );
}

function splitProposalOperations(operations: JsonPatchOperation[]) {
  const groups: JsonPatchOperation[][] = [];
  for (const operation of operations) {
    const relatedIndexes = groups
      .map((group, index) =>
        operationsAreRelated(group, [operation]) ? index : -1,
      )
      .filter((index) => index >= 0);
    if (!relatedIndexes.length) {
      groups.push([operation]);
      continue;
    }
    const [firstIndex, ...restIndexes] = relatedIndexes;
    groups[firstIndex].push(operation);
    for (const index of restIndexes.reverse()) {
      groups[firstIndex].push(...groups[index]);
      groups.splice(index, 1);
    }
  }
  return groups;
}

function dedupeReviewChanges(changes: FormReviewChange[]) {
  const seen = new Set<string>();
  const deduped: FormReviewChange[] = [];
  for (const change of changes) {
    const signature = changeSignature(change.operations);
    if (seen.has(signature)) continue;
    seen.add(signature);
    deduped.push(change);
  }
  return deduped;
}

function changeTitle(
  proposal: FormPatchProposal,
  operations: JsonPatchOperation[],
  index: number,
) {
  if (proposal.operations.length === operations.length) {
    return proposal.title || "Proposed change";
  }
  const path = operationPaths(operations)[0] ?? "/";
  const label =
    path
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) ??
    `Change ${index + 1}`;
  return label || `Change ${index + 1}`;
}

function isRootPath(path: string, requiredRoot: string) {
  return path === `/${requiredRoot}` || path.startsWith(`/${requiredRoot}/`);
}

function assertOperationsForRoot(
  operations: JsonPatchOperation[],
  requiredRoot?: string,
) {
  if (!requiredRoot) return;
  for (const operation of operations) {
    if (!isRootPath(operation.path, requiredRoot)) {
      throw new Error(
        `Patch path must target /${requiredRoot}: ${operation.path}`,
      );
    }
  }
}

export function setReviewChangeStatus<T extends FormMutableReviewState>(
  review: T,
  changeId: string,
  status: FormReviewChangeStatus,
): T {
  const timestamp = now();
  return {
    ...review,
    updatedAt: timestamp,
    changes: review.changes.map((change) =>
      change.id === changeId
        ? { ...change, status, updatedAt: timestamp }
        : change,
    ),
  } as T;
}

export function setReviewProposalStatus<T extends FormMutableReviewState>(
  review: T,
  proposalId: string,
  status: FormReviewChangeStatus,
): T {
  const timestamp = now();
  return {
    ...review,
    updatedAt: timestamp,
    changes: review.changes.map((change) =>
      change.proposalId === proposalId
        ? { ...change, status, updatedAt: timestamp }
        : change,
    ),
  } as T;
}

export function proposalReviewStatus(
  review: FormReviewChangeCollection | null,
  proposalId: string,
) {
  const changes =
    review?.changes.filter((change) => change.proposalId === proposalId) ?? [];
  if (!changes.length) return null;
  if (changes.some((change) => change.status === "pending")) return "pending";
  if (changes.every((change) => change.status === "accepted"))
    return "accepted";
  if (changes.every((change) => change.status === "rejected"))
    return "rejected";
  return "mixed";
}

export function setAllReviewChangesStatus<T extends FormMutableReviewState>(
  review: T,
  status: FormReviewChangeStatus,
): T {
  const timestamp = now();
  return {
    ...review,
    updatedAt: timestamp,
    changes: review.changes.map((change) => ({
      ...change,
      status,
      updatedAt: timestamp,
    })),
  } as T;
}

export function reviewOperations(
  review: FormReviewChangeCollection | null,
  statuses: FormReviewChangeStatus[],
) {
  if (!review) return [];
  const allowed = new Set(statuses);
  return review.changes
    .filter((change) => allowed.has(change.status))
    .flatMap((change) => change.operations);
}

export function reviewIsResolved(review: FormReviewChangeCollection | null) {
  return Boolean(
    review && review.changes.every((change) => change.status !== "pending"),
  );
}

export function createOrAppendJsonReview<T>(
  review: FormReviewState<T> | null,
  fileId: string,
  baseValue: T,
  proposal: FormPatchProposal,
  requiredRoot?: string,
): FormReviewState<T> {
  if (!proposal.valid) {
    throw new Error("Only valid proposals can be reviewed.");
  }
  if (!proposal.operations.length) {
    throw new Error("Proposal did not include patch operations.");
  }
  assertOperationsForRoot(proposal.operations, requiredRoot);
  if (
    review &&
    (review.fileId !== fileId || review.requiredRoot !== requiredRoot)
  ) {
    throw new Error("Resolve pending changes before switching targets.");
  }
  const operations = expandOperationsForReview(
    baseValue,
    normalizeJsonReviewOperations(baseValue, proposal.operations),
  );
  const timestamp = now();
  const nextReview =
    review ??
    ({
      fileId,
      ...(requiredRoot ? { requiredRoot } : {}),
      baseValue,
      baseValueHash: proposal.base?.sourceHash,
      createdAt: timestamp,
      updatedAt: timestamp,
      changes: [],
    } satisfies FormReviewState<T>);
  if (nextReview.changes.some((change) => change.proposalId === proposal.id)) {
    return nextReview;
  }
  const changeGroups = splitProposalOperations(operations);
  return {
    ...nextReview,
    updatedAt: timestamp,
    changes: dedupeReviewChanges([
      ...nextReview.changes,
      ...changeGroups.map(
        (groupOps, index) =>
          ({
            id:
              changeGroups.length === 1
                ? proposal.id
                : `${proposal.id}:${index + 1}`,
            proposalId: proposal.id,
            title: changeTitle(proposal, groupOps, index),
            operations: groupOps,
            paths: operationPaths(groupOps),
            status: "pending",
            base: proposal.base,
            createdAt: timestamp,
            updatedAt: timestamp,
          }) satisfies FormReviewChange,
      ),
    ]),
  };
}

export function previewJsonReviewValue<T>(review: FormReviewState<T>) {
  return applyJsonPatch(
    review.baseValue,
    normalizeJsonReviewOperations(
      review.baseValue,
      reviewOperations(review, ["pending", "accepted"]),
    ),
    review.requiredRoot,
  );
}

export function previewJsonReviewChangeValue<T>(
  review: FormReviewState<T>,
  change: FormReviewChange,
) {
  return applyJsonPatch(
    review.baseValue,
    normalizeJsonReviewOperations(review.baseValue, change.operations),
    review.requiredRoot,
  );
}

export function acceptedJsonReviewValue<T>(review: FormReviewState<T>) {
  return applyJsonPatch(
    review.baseValue,
    normalizeJsonReviewOperations(
      review.baseValue,
      reviewOperations(review, ["accepted"]),
    ),
    review.requiredRoot,
  );
}

export function reviewAffectsPath(
  review: FormReviewChangeCollection | null,
  pathPrefix: string,
) {
  return Boolean(
    review?.changes.some(
      (change) =>
        change.status === "pending" &&
        change.operations.some(
          (operation) =>
            operation.path === pathPrefix ||
            operation.path.startsWith(`${pathPrefix}/`),
        ),
    ),
  );
}

export function pendingChangesForPath(
  review: FormReviewChangeCollection | null,
  pathPrefix: string,
) {
  return (
    review?.changes.filter(
      (change) =>
        change.status === "pending" &&
        change.operations.some(
          (operation) =>
            operation.path === pathPrefix ||
            operation.path.startsWith(`${pathPrefix}/`),
        ),
    ) ?? []
  );
}

export function reviewChangeValuePreview<T>(
  review: FormReviewState<T> | null,
  change: FormReviewChange,
  path: string,
) {
  if (!review) return null;
  const changedValue = previewJsonReviewChangeValue(review, change);
  return {
    before: pointerValue(review.baseValue, path),
    after: pointerValue(changedValue, path),
  };
}

export function formatReviewValue(value: unknown) {
  if (value === undefined) return "(not set)";
  if (value === null) return "null";
  if (typeof value === "string") return value || "(empty)";
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }
  if (typeof value === "object") return "Object changed";
  return String(value);
}
