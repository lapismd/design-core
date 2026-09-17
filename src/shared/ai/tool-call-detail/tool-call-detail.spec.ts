import { describe, expect, it } from "vitest";
import {
  isOneLineToolAlert,
  presentToolPayload,
  toolCallTarget,
} from "./tool-call-detail.js";

describe("tool call detail formatting", () => {
  it("unwraps output envelopes and preserves structured values", () => {
    expect(presentToolPayload('{"output":"hello\\nworld"}')).toEqual({
      code: "hello\nworld",
      language: "bash",
    });
    expect(presentToolPayload('{"ok":true,"totalMatches":3}')).toEqual({
      code: '{\n  "ok": true,\n  "totalMatches": 3\n}',
      language: "json",
    });
  });

  it("distinguishes short alerts and derives call targets", () => {
    expect(isOneLineToolAlert({ code: "failed", language: "plaintext" })).toBe(
      true,
    );
    expect(toolCallTarget('{"command":"pnpm test"}', "mcp")).toBe("pnpm test");
    expect(toolCallTarget(undefined, "lapis-tools")).toBe("lapis-tools");
  });
});
