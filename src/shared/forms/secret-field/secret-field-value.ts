/** The storage choices supported by the shared secret field. */
export type SecretFieldMode = "env" | "inline";

export function secretFieldMode(value: string | undefined): SecretFieldMode {
  return value?.startsWith("env:") ? "env" : "inline";
}

/** The editable portion of a stored environment reference or inline secret. */
export function secretFieldDisplayValue(value: string | undefined): string {
  if (!value) return "";
  return value.startsWith("env:") ? value.slice("env:".length) : value;
}

/** Store an environment reference as `env:NAME`, or retain an inline secret. */
export function secretFieldStoredValue(
  mode: SecretFieldMode,
  display: string,
): string {
  const trimmed = display.trim();
  if (mode === "env") {
    const name = trimmed.startsWith("env:")
      ? trimmed.slice("env:".length).trim()
      : trimmed;
    return name ? `env:${name}` : "env:";
  }
  return trimmed;
}

export function isSecretFieldConfigured(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  if (value.startsWith("env:")) {
    return value.slice("env:".length).trim().length > 0;
  }
  return true;
}
