import { describe, expect, it } from "vitest";
import { resolveFileTypeIcon } from "./file-type-icon.js";

describe("file type icon resolution", () => {
  it.each([
    ["src/main.ts", "typescript"],
    ["Main.TS", "typescript"],
    ["C:\\project\\main.ts", "typescript"],
    ["config/package.json", "nodejs"],
    ["C:\\project\\package.json", "nodejs"],
    ["containers/Dockerfile", "docker"],
    ["config/.gitignore", "git"],
    ["docs/README.md", "readme"],
    ["src/component.svelte", "svelte"],
    ["assets/photo.png", "image"],
    ["Research/paper.pdf", "pdf"],
    ["Books/handbook.epub", "document"],
    ["Notes/meeting.rtf", "word"],
    ["Documents/proposal.docx", "word"],
    ["Documents/proposal.pages", "word"],
    ["Sheets/budget.xlsx", "table"],
    ["Sheets/budget.numbers", "table"],
    ["Slides/talk.pptx", "powerpoint"],
    ["Credentials/private.key", "key"],
    ["Calendar/events.ics", "todo"],
    ["Notes/overview.canvas", "drawio"],
    ["Notes/diagram.excalidraw", "drawio"],
    ["Notes/diagram.mermaid", "uml"],
    ["Notebooks/experiment.ipynb", "jupyter"],
    ["Audio/voice-note.m4a", "audio"],
    ["Data/notes.sqlite3", "database"],
    ["config/wrangler.toml", "settings"],
    ["config/bun.lockb", "lock"],
    ["unknown.zzz", "file"],
    ["", "file"],
    ["src/", "file"],
    ["<svg onload=alert(1)>.zzz", "file"],
    ["constructor", "file"],
    ["__proto__", "file"],
    ["file.toString", "file"],
  ])("resolves %j to %s", (path, name) => {
    expect(resolveFileTypeIcon(path).name).toBe(name);
  });

  it("prefers the longest supported compound extension", () => {
    expect(resolveFileTypeIcon("src/button.test.ts").name).toBe("test-ts");
  });
});
