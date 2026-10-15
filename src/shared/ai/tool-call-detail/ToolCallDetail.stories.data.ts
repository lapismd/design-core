import type { ToolCallDetailProps } from "./rich-tool-call-detail.types.js";

function captured(value: ToolCallDetailProps): ToolCallDetailProps {
  return {
    ...value,
    raw: JSON.stringify(
      {
        id: `call-${value.toolName}`,
        tool: value.toolName,
        input: value.input,
        output: value.output,
        detail: value.detail,
        capture: value.capture,
      },
      null,
      2,
    ),
  };
}

export const examples = {
  shell: captured({
    toolName: "bash",
    input: '{"command":"pnpm test","cwd":"/workspace/design-core"}',
    output:
      '{"stdout":"PASS tabs.spec.ts\nPASS avatar.spec.ts\nTests: 42 passed","exitCode":0}',
    detail: {
      kind: "shell",
      command: "pnpm test",
      cwd: "/workspace/design-core",
      output: "PASS tabs.spec.ts\nPASS avatar.spec.ts\n\nTests: 42 passed",
      exitCode: 0,
    },
  }),
  failed: captured({
    toolName: "bash",
    detail: {
      kind: "shell",
      command: "pnpm check",
      cwd: "/workspace/design-core",
      output: "Checking source files…",
      error:
        "src/example.ts:4:7 — Type 'string' is not assignable to type 'number'.\nFound 1 error.",
      exitCode: 1,
    },
  }),
  read: captured({
    toolName: "read_file",
    detail: {
      kind: "file-read",
      path: "src/lib/greeting.ts",
      startLine: 12,
      content:
        "export function greet(name: string) {\n  return `Hello, ${name}!`;\n}\n",
    },
  }),
  edit: captured({
    toolName: "apply_patch",
    detail: {
      kind: "file-edit",
      files: [
        {
          path: "src/lib/greeting.ts",
          oldText:
            'export function greet(name: string) {\n  return "Hello " + name;\n}\n',
          newText:
            "export function greet(name: string) {\n  return `Hello, ${name}!`;\n}\n",
        },
        {
          path: "src/lib/greeting.test.ts",
          patch:
            '@@ -1,2 +1,3 @@\n import { greet } from "./greeting";\n-expect(greet("Ada")).toBe("Hello Ada");\n+expect(greet("Ada")).toBe("Hello, Ada!");\n+expect(greet("Lin")).toBe("Hello, Lin!");',
        },
      ],
    },
  }),
  search: captured({
    toolName: "search",
    detail: {
      kind: "search",
      query: "greet",
      command: 'rg -n "greet" src/',
      matches: [
        {
          path: "src/lib/greeting.ts",
          line: 12,
          column: 17,
          text: "export function greet(name: string) {",
        },
        {
          path: "src/lib/greeting.test.ts",
          line: 2,
          text: 'expect(greet("Ada")).toBe("Hello, Ada!");',
        },
      ],
    },
  }),
  partial: captured({
    toolName: "edit_file",
    capture: {
      partial: true,
      truncated: true,
      redacted: true,
      note: "The capture contains updated text only; it does not prove the change was applied.",
    },
    detail: {
      kind: "file-edit",
      files: [
        {
          path: "src/config.ts",
          partial: true,
          capturedSide: "after",
          capturedText:
            'export const token = "[redacted]";\n// remaining output was not captured',
        },
      ],
    },
  }),
  missingPath: captured({
    toolName: "read_file",
    detail: {
      kind: "file-read",
      content:
        "Captured text from a read with no unique recorded path.\nThe UI does not invent a filename or an Open action.",
    },
  }),
  unavailable: {
    toolName: "custom_tool",
    detail: {
      kind: "unavailable",
      reason:
        "This tool's formatted output is unavailable. Raw retains the recorded fields.",
    },
    raw: '{\n  "id": "call-custom",\n  "tool": "custom_tool",\n  "status": "unknown",\n  "provider_specific": { "receipt": "activity-42" }\n}',
  },
  generic: {
    toolName: "custom_lookup",
    input: '{"query":"release status"}',
    output: '{"version":"0.4.0","checks":["types","stories"]}',
  },
} satisfies Record<string, ToolCallDetailProps>;

export type ToolExample = keyof typeof examples;
