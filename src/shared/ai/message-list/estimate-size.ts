export type MessageListEstimateSize<T> =
  | number
  | ((item: T, index: number) => number);

export function resolveMessageListEstimateSize<T>(
  estimateSize: MessageListEstimateSize<T>,
  item: T | undefined,
  index: number,
  fallback = 112,
): number {
  const candidate =
    typeof estimateSize === "function" && item !== undefined
      ? estimateSize(item, index)
      : typeof estimateSize === "number"
        ? estimateSize
        : fallback;
  return Number.isFinite(candidate) && candidate > 0 ? candidate : fallback;
}
