/** Per-field Keep/Undo review payload for structured form controls. */
export type FieldReview = {
  removedValue: string;
  stale?: boolean;
  onUndo?: () => void;
  onKeep?: () => void;
};

/** Context passed into reviewed StructuredForm field renderers. */
export type FieldReviewContext = {
  reviewForField?: (field: string) => FieldReview | null;
  reviewItemsForField?: (
    field: string,
  ) => Record<number, FieldReview | null | undefined>;
};
