/** Values accepted by the config-driven form path helpers. */
export type FieldValues = Record<string, unknown>;

type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type BrowserNativeObject = Date | FileList | File;
type IsTuple<T extends readonly unknown[]> = number extends T["length"]
  ? false
  : true;
type TupleKeys<T extends readonly unknown[]> = Exclude<
  keyof T,
  keyof unknown[]
>;
type ArrayKey = number;
type IsAny<TValue> = 0 extends 1 & TValue ? true : false;
type PreviousDepth = [never, 0, 1, 2, 3, 4, 5, 6];

type PathImpl<
  TKey extends string | number,
  TValue,
  TDepth extends number,
> = TValue extends Primitive | BrowserNativeObject
  ? `${TKey}`
  : TDepth extends 0
    ? `${TKey}`
    : `${TKey}` | `${TKey}.${PathInternal<TValue, PreviousDepth[TDepth]>}`;

type PathInternal<
  TValue,
  TDepth extends number = 6,
> = TValue extends readonly (infer TItem)[]
  ? IsTuple<TValue> extends true
    ? {
        [TKey in TupleKeys<TValue>]-?: PathImpl<
          TKey & string,
          TValue[TKey],
          TDepth
        >;
      }[TupleKeys<TValue>]
    : PathImpl<ArrayKey, TItem, TDepth>
  : TValue extends object
    ? {
        [TKey in keyof TValue]-?: TKey extends string | number
          ? PathImpl<TKey, TValue[TKey], TDepth>
          : never;
      }[keyof TValue]
    : never;

/** Dot-separated paths through objects, tuples, and arrays. */
export type FieldPath<TValues> =
  IsAny<TValues> extends true
    ? string
    : TValues extends unknown
      ? PathInternal<TValues>
      : never;

type ArrayPathImpl<
  TKey extends string | number,
  TValue,
  TDepth extends number,
> = TValue extends Primitive | BrowserNativeObject
  ? never
  : TValue extends readonly unknown[]
    ? `${TKey}`
    : TDepth extends 0
      ? never
      : `${TKey}.${ArrayPathInternal<TValue, PreviousDepth[TDepth]>}`;

type ArrayPathInternal<
  TValue,
  TDepth extends number = 6,
> = TValue extends readonly (infer TItem)[]
  ? IsTuple<TValue> extends true
    ? {
        [TKey in TupleKeys<TValue>]-?: ArrayPathImpl<
          TKey & string,
          TValue[TKey],
          TDepth
        >;
      }[TupleKeys<TValue>]
    : ArrayPathImpl<ArrayKey, TItem, TDepth>
  : TValue extends object
    ? {
        [TKey in keyof TValue]-?: TKey extends string | number
          ? ArrayPathImpl<TKey, TValue[TKey], TDepth>
          : never;
      }[keyof TValue]
    : never;

/** Paths whose value is an array. */
export type FieldArrayPath<TValues> =
  IsAny<TValues> extends true
    ? string
    : TValues extends unknown
      ? ArrayPathInternal<TValues>
      : never;

/** Value resolved at a dot-separated field path. */
export type FieldPathValue<
  TValues,
  TPath extends FieldPath<TValues> | FieldArrayPath<TValues>,
> =
  IsAny<TValues> extends true
    ? any
    : TPath extends `${infer TKey}.${infer TRest}`
      ? TKey extends keyof TValues
        ? TRest extends FieldPath<TValues[TKey]>
          ? FieldPathValue<TValues[TKey], TRest>
          : never
        : TValues extends readonly (infer TItem)[]
          ? TKey extends `${number}`
            ? TRest extends FieldPath<TItem>
              ? FieldPathValue<TItem, TRest>
              : never
            : never
          : never
      : TPath extends keyof TValues
        ? TValues[TPath]
        : TValues extends readonly (infer TItem)[]
          ? TPath extends `${number}`
            ? TItem
            : never
          : never;

/** Paths whose resolved value is assignable to `TValue`. */
export type FieldPathByValue<TValues, TValue> = {
  [TPath in FieldPath<TValues>]: FieldPathValue<TValues, TPath> extends TValue
    ? TPath
    : never;
}[FieldPath<TValues>];
