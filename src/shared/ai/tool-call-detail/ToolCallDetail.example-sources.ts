export const Shell = `<script lang="ts">
  import { RichToolCallDetail } from "@lapismd/design-core/chat";
  // The host retains the exact recorded payload and adapts its tool schema.
  const raw = '{"tool":"bash","input":{"command":"pnpm test"},"output":{"stdout":"42 tests passed","exitCode":0}}';
</script>

<RichToolCallDetail
  toolName="bash"
  {raw}
  detail={{ kind: "shell", command: "pnpm test", output: "42 tests passed", exitCode: 0 }}
/>`;

export const Files = `<script lang="ts">
  import { RichToolCallDetail, type ToolDetailTarget } from "@lapismd/design-core/chat";
  function openFile(target: ToolDetailTarget) { console.log(target); }
</script>

<RichToolCallDetail
  toolName="read_file"
  detail={{ kind: "file-read", path: "src/example.ts", content: "export const answer = 42;" }}
  onOpen={openFile}
/>
<RichToolCallDetail
  toolName="edit_file"
  detail={{ kind: "file-edit", files: [{ path: "src/example.ts", oldText: "const answer = 41;", newText: "const answer = 42;" }] }}
  onOpen={openFile}
/>`;

export const Search = `<script lang="ts">
  import { RichToolCallDetail } from "@lapismd/design-core/chat";
</script>

<RichToolCallDetail
  toolName="search"
  detail={{ kind: "search", query: "answer", matches: [{ path: "src/example.ts", line: 1, text: "const answer = 42;" }] }}
  onOpen={(target) => console.log(target)}
/>`;

export const Incomplete = `<script lang="ts">
  import { RichToolCallDetail } from "@lapismd/design-core/chat";
</script>

<RichToolCallDetail
  toolName="edit_file"
  raw={'{"capturedText":"const token = \\"[redacted]\\";","truncated":true}'}
  capture={{ partial: true, truncated: true, redacted: true }}
  detail={{ kind: "file-edit", files: [{ path: "src/config.ts", partial: true, capturedSide: "after", capturedText: 'const token = "[redacted]";' }] }}
/>`;

export const Grouped = `<script lang="ts">
  import { ToolCalls } from "@lapismd/design-core/chat";
</script>

<ToolCalls defaultExpanded calls={[
  { id: "test", name: "bash", status: "complete", presentation: {
    raw: '{"command":"pnpm test","stdout":"42 tests passed"}',
    detail: { kind: "shell", command: "pnpm test", output: "42 tests passed", exitCode: 0 },
  } },
  { id: "read", name: "read_file", status: "complete", presentation: {
    detail: { kind: "file-read", path: "README.md", content: "# Project" },
  } },
]} />`;

export const Generic = `<script lang="ts">
  import { ToolCallDetail } from "@lapismd/design-core/ai/chat";
</script>

<ToolCallDetail toolName="custom_lookup" input={'{"query":"release"}'} output={'{"version":"0.4.0"}'} />`;
