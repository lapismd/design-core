/**
 * Clone values that cross the framework's serializable API boundaries.
 *
 * Svelte state proxies cannot be passed to `structuredClone` directly, even
 * when every value beneath the proxy is JSON-safe. The shell's layout, view
 * state, and hotkey contracts are JSON data, so a JSON fallback is both
 * deterministic and compatible with persisted values.
 */
export function cloneSerializable<T>(value: T): T {
  if (value === undefined || value === null) return value;
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
