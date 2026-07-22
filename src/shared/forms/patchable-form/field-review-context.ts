import type { FieldReview, FieldReviewContext } from "../core/field-review";
import {
  formatReviewValue,
  pendingChangesForPath,
  reviewChangeValuePreview,
  type FormReviewChange,
  type FormReviewState,
} from "../core/patch-review";

function fieldPath(fieldId: string, pathPrefix = "") {
  const prefix = pathPrefix.replace(/\/$/, "");
  if (!prefix) return `/${fieldId}`;
  return prefix.startsWith("/")
    ? `${prefix}/${fieldId}`
    : `/${prefix}/${fieldId}`;
}

function itemPath(fieldId: string, index: number, pathPrefix = "") {
  return `${fieldPath(fieldId, pathPrefix)}/${index}`;
}

function fieldReviewForChange<T>(
  review: FormReviewState<T>,
  change: FormReviewChange,
  path: string,
  onKeep: (changeId: string) => void,
  onUndo: (changeId: string) => void,
): FieldReview | null {
  const preview = reviewChangeValuePreview(review, change, path);
  if (!preview) return null;
  return {
    removedValue: formatReviewValue(preview.before),
    stale: review.stale,
    onKeep: () => onKeep(change.id),
    onUndo: () => onUndo(change.id),
  };
}

/** Build StructuredForm review context from a pending FormReviewState. */
export function fieldReviewContextFromReview<T>(
  review: FormReviewState<T> | null,
  onKeep: (changeId: string) => void,
  onUndo: (changeId: string) => void,
  pathPrefix = "",
): FieldReviewContext {
  if (!review) return {};

  return {
    reviewForField: (fieldId) => {
      const path = fieldPath(fieldId, pathPrefix);
      const change = pendingChangesForPath(review, path).find((item) =>
        item.operations.some((operation) => operation.path === path),
      );
      if (!change) return null;
      return fieldReviewForChange(review, change, path, onKeep, onUndo);
    },
    reviewItemsForField: (fieldId) => {
      const items: Record<number, FieldReview | null | undefined> = {};
      const prefix = fieldPath(fieldId, pathPrefix);
      for (const change of pendingChangesForPath(review, prefix)) {
        for (const path of change.paths) {
          if (!path.startsWith(`${prefix}/`)) continue;
          const indexPart = path.slice(prefix.length + 1).split("/")[0];
          const index = Number(indexPart);
          if (!Number.isInteger(index) || index < 0 || items[index]) continue;
          items[index] = fieldReviewForChange(
            review,
            change,
            itemPath(fieldId, index, pathPrefix),
            onKeep,
            onUndo,
          );
        }
      }
      return items;
    },
  };
}
