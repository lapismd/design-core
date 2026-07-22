import { describe, expect, test } from "vitest";
import {
  isSecretFieldConfigured,
  secretFieldDisplayValue,
  secretFieldMode,
  secretFieldStoredValue,
} from "./secret-field-value";

describe("secret field values", () => {
  test("separates an environment reference from an inline secret", () => {
    expect(secretFieldMode("env:BANK_TOKEN")).toBe("env");
    expect(secretFieldMode("sk-live")).toBe("inline");
    expect(secretFieldDisplayValue("env:BANK_TOKEN")).toBe("BANK_TOKEN");
    expect(secretFieldDisplayValue("sk-live")).toBe("sk-live");
  });

  test("serializes only the editable credential value", () => {
    expect(secretFieldStoredValue("env", "BANK_TOKEN")).toBe("env:BANK_TOKEN");
    expect(secretFieldStoredValue("env", "env:BANK_TOKEN")).toBe(
      "env:BANK_TOKEN",
    );
    expect(secretFieldStoredValue("inline", " sk-live ")).toBe("sk-live");
  });

  test("requires a value after an environment prefix", () => {
    expect(isSecretFieldConfigured("env:")).toBe(false);
    expect(isSecretFieldConfigured("env:BANK_TOKEN")).toBe(true);
    expect(isSecretFieldConfigured("sk-live")).toBe(true);
  });
});
