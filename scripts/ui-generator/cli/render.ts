import type { CliColors } from "./color.js";
import type { GuideIndex, GuideTopic } from "../pipeline/guide.js";
import type {
  ComponentDoc,
  ComponentsIndex,
} from "../pipeline/components.js";

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

export function renderComponentsIndex(
  index: ComponentsIndex,
  colors: CliColors,
): string {
  const lines: string[] = [
    colors.bold(index.title),
    "",
    colors.dim(index.summary),
    "",
    colors.bold("Components"),
  ];

  const keyWidth = Math.max(...index.components.map((c) => c.key.length), 8);
  let lastLayer = "";
  for (const component of index.components) {
    if (component.layer !== lastLayer) {
      if (lastLayer) lines.push("");
      lines.push(colors.bold(component.layer));
      lastLayer = component.layer;
    }
    const docs = component.hasDocs
      ? colors.green("docs")
      : colors.yellow("no-docs");
    const batch = component.batch
      ? colors.dim(` batch:${component.batch}`)
      : "";
    const examples =
      component.exampleCount > 0
        ? colors.dim(` · ${component.exampleCount} examples`)
        : "";
    lines.push(
      `  ${colors.cyan(component.key.padEnd(keyWidth))}  ${docs}${batch}${examples}`,
      `  ${"".padEnd(keyWidth)}  ${component.title} — ${colors.dim(component.summary)}`,
    );
  }

  lines.push(
    "",
    colors.dim("Usage: pnpm ui components <layer/id|id>"),
    colors.dim("Filter: pnpm ui components --layer forms"),
    colors.dim("JSON:  pnpm ui components <name> --json"),
  );

  if (index.related.length > 0) {
    lines.push("", colors.bold("Related"));
    for (const related of index.related) {
      lines.push(`  ${colors.dim("•")} ${related}`);
    }
  }

  return lines.join("\n");
}

export function renderComponentShow(
  component: ComponentDoc,
  colors: CliColors,
): string {
  const lines: string[] = [
    colors.bold(component.title),
    "",
    colors.dim(component.summary),
    "",
    `${colors.bold("Key")}     ${colors.cyan(component.key)}`,
    `${colors.bold("Layer")}   ${component.layer}`,
    `${colors.bold("Import")}  ${colors.cyan(component.import)}`,
  ];

  if (component.batch) {
    lines.push(`${colors.bold("Batch")}   ${component.batch}`);
  }

  if (component.sources.length > 0) {
    lines.push("", colors.bold("Sources"));
    for (const source of component.sources) {
      lines.push(`  ${colors.dim("•")} ${source}`);
    }
  }

  lines.push("", renderMarkdownLite(component.body, colors));
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
