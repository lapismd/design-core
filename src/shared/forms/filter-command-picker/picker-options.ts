export type FilterCommandOption = {
  value: string;
  label: string;
  accent?: string;
  /** Optional supporting text rendered below the option label. */
  description?: string;
  /** Optional decorative image, such as a merchant logo. */
  imageUrl?: string;
  keywords?: string[];
};

/** An optional action offered for the current picker search text. */
export type FilterCommandSearchAction = Omit<FilterCommandOption, "value">;
