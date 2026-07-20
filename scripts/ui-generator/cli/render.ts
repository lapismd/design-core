import type { CliColors } from "./color.js";
import type { GuideIndex, GuideTopic } from "../pipeline/guide.js";

export function renderGuideIndex(index: GuideIndex, colors: CliColors): string {
  const lines: string[] = [
    colors.bold(index.title),
    "",
    colors.dim(index.summary),
    "",
    colors.bold("Reading order"),
  ];

  for (const [i, step] of index.readingOrder.entries()) {
    lines.push(`  ${colors.cyan(`${i + 1}.`)} ${step}`);
  }

  lines.push("", colors.bold("Topics"));
  const idWidth = Math.max(...index.topics.map((t) => t.id.length), 8);
  for (const topic of index.topics) {
    lines.push(
      `  ${colors.green(topic.id.padEnd(idWidth))}  ${topic.title}`,
      `  ${"".padEnd(idWidth)}  ${colors.dim(topic.summary)}`,
    );
  }

  lines.push(
    "",
    colors.dim("Usage: pnpm ui guide <topic>"),
    colors.dim("JSON:  pnpm ui guide <topic> --json"),
  );

  if (index.related.length > 0) {
    lines.push("", colors.bold("Related"));
    for (const related of index.related) {
      lines.push(`  ${colors.dim("•")} ${related}`);
    }
  }

  return lines.join("\n");
}

export function renderGuideTopic(topic: GuideTopic, colors: CliColors): string {
  const lines: string[] = [
    colors.bold(topic.title),
    "",
    colors.dim(topic.summary),
    "",
  ];

  if (topic.sources.length > 0) {
    lines.push(colors.bold("Sources"));
    for (const source of topic.sources) {
      lines.push(`  ${colors.dim("•")} ${source}`);
    }
    lines.push("");
  }

  lines.push(renderMarkdownLite(topic.body, colors));
  return lines.join("\n").trimEnd();
}

/** Minimal markdown coloring for headings, lists, and fenced code labels. */
function renderMarkdownLite(body: string, colors: CliColors): string {
  if (!colors.enabled) return body;

  const lines = body.split("\n");
  const out: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      out.push(colors.dim(line));
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(colors.cyan(line.slice(4)));
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(colors.bold(line.slice(3)));
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(colors.bold(line.slice(2)));
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      out.push(`  ${colors.dim("•")} ${line.slice(2)}`);
      continue;
    }
    out.push(line);
  }

  return out.join("\n");
}
