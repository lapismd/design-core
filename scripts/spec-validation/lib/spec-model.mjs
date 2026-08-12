import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export const REQUIREMENT_ID_PATTERN = /^DC-[A-Z]+-\d{3}$/;
export const REQUIREMENT_REFERENCE_PATTERN = /\bDC-[A-Z]+-\d{3}\b/g;
export const NORMATIVE_PATTERN = /\b(?:MUST|MUST NOT|SHOULD|SHOULD NOT|MAY)\b/;

export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

export function relativePath(repoRoot, absolutePath) {
  return toPosix(path.relative(repoRoot, absolutePath));
}

export function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(absolutePath);
      return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

export function splitMarkdownTableRow(line) {
  const source = line.trim();
  if (!source.startsWith("|") || !source.endsWith("|")) return null;
  const cells = [];
  let current = "";
  let escaped = false;
  let codeDelimiter = 0;
  for (let index = 1; index < source.length - 1; index += 1) {
    const character = source[index];
    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }
    if (character === "\\") {
      current += character;
      escaped = true;
      continue;
    }
    if (character === "`") {
      let runLength = 1;
      while (source[index + runLength] === "`") runLength += 1;
      if (codeDelimiter === 0) codeDelimiter = runLength;
      else if (codeDelimiter === runLength) codeDelimiter = 0;
      current += "`".repeat(runLength);
      index += runLength - 1;
      continue;
    }
    if (character === "|" && codeDelimiter === 0) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += character;
  }
  cells.push(current.trim());
  return cells;
}

export function markdownToProse(source) {
  return source
    .replace(/!\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/`+([^`]+)`+/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_~>#]/g, " ")
    .replace(/\\([\\`*{}\[\]()#+.!|_-])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function proseMetrics(source) {
  const prose = markdownToProse(source);
  const words = prose.match(/[\p{L}\p{N}]+(?:['’/-][\p{L}\p{N}]+)*/gu) ?? [];
  const sentences = prose.match(/[.!?]+(?=\s|$)/g) ?? [];
  return { prose, words: words.length, sentences: sentences.length };
}

export function withoutFencedCode(source) {
  let fenced = false;
  return source
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced;
        return "";
      }
      return fenced ? "" : line;
    })
    .join("\n");
}

export function localMarkdownTargets(source) {
  const targets = [];
  for (const match of source.matchAll(/\[[^\]]*]\(([^)]+)\)/g)) {
    const target = match[1].trim().replace(/^<|>$/g, "");
    if (/^(?:https?:|mailto:|#|\?)/.test(target)) continue;
    targets.push(target);
  }
  return targets;
}

function nextHeading(lines, start, levelPattern) {
  for (let index = start + 1; index < lines.length; index += 1) {
    if (levelPattern.test(lines[index])) return index;
  }
  return lines.length;
}

export function parseRequirementFile(file) {
  const lines = file.source.split(/\r?\n/);
  const definitions = [];
  const malformed = [];
  const acceptanceSections = [];
  const coverage = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (/^##\s+DC-/.test(lines[index])) {
      const heading = /^##\s+(DC-[A-Z]+-\d{3})\s+—\s+(.+)\s*$/.exec(
        lines[index],
      );
      if (!heading) {
        malformed.push({
          line: index + 1,
          reason: "requirement heading must be “## DC-<AREA>-NNN — <surface>”",
        });
        continue;
      }
      const end = nextHeading(lines, index, /^##\s+/);
      const body = lines.slice(index + 1, end);
      const statementLine = body.findIndex((line) =>
        /^\*\*Requirement\.\*\*\s+/.test(line),
      );
      const statement =
        statementLine < 0
          ? ""
          : body[statementLine].replace(/^\*\*Requirement\.\*\*\s+/, "").trim();
      const acceptanceHeading = body.findIndex((line) =>
        /^###\s+Acceptance details\s*$/.test(line),
      );
      const acceptanceBody =
        acceptanceHeading < 0 ? [] : body.slice(acceptanceHeading + 1);
      const nonBullet = acceptanceBody.filter(
        (line) => line.trim() && !/^-\s+/.test(line),
      );
      const bullets = acceptanceBody
        .map((line, bodyIndex) => ({
          line,
          lineNumber: index + acceptanceHeading + bodyIndex + 3,
        }))
        .filter((entry) => /^-\s+/.test(entry.line))
        .map((entry) => {
          const text = entry.line.replace(/^-\s+/, "").trim();
          return {
            statement: text,
            line: entry.lineNumber,
            ...proseMetrics(text),
          };
        });
      const definition = {
        id: heading[1],
        surface: heading[2],
        statement,
        file: file.relativePath,
        chapterPath: file.chapterPath,
        line: index + 1,
        ...proseMetrics(statement),
      };
      definitions.push(definition);
      acceptanceSections.push({
        id: heading[1],
        file: file.relativePath,
        line: acceptanceHeading < 0 ? index + 1 : index + acceptanceHeading + 2,
        present: acceptanceHeading >= 0,
        nonBullet,
        bullets,
      });
      index = end - 1;
      continue;
    }
    if (/^##\s+Public surface coverage\s*$/.test(lines[index])) {
      const end = nextHeading(lines, index, /^##\s+/);
      for (let rowIndex = index + 1; rowIndex < end; rowIndex += 1) {
        const cells = splitMarkdownTableRow(lines[rowIndex]);
        if (!cells || cells.length !== 3 || cells[0] === "Surface") continue;
        if (/^-+$/.test(cells[0].replaceAll(" ", ""))) continue;
        coverage.push({
          surface: cells[0],
          boundary: cells[1],
          id: cells[2].replaceAll("`", "").trim(),
          file: file.relativePath,
          line: rowIndex + 1,
        });
      }
    }
  }
  return { definitions, malformed, acceptanceSections, coverage };
}

export function createSpecModel(repoRoot) {
  const sourceDirectory = path.join(repoRoot, "spec", "src");
  const files = markdownFiles(sourceDirectory).map((absolutePath) => ({
    absolutePath,
    relativePath: relativePath(repoRoot, absolutePath),
    chapterPath: toPosix(path.relative(sourceDirectory, absolutePath)),
    source: readFileSync(absolutePath, "utf8"),
  }));
  const canonicalFiles = files.filter(
    (file) => !["SUMMARY.md", "verification.md"].includes(file.chapterPath),
  );
  const parsed = canonicalFiles.map((file) => ({
    file,
    ...parseRequirementFile(file),
  }));
  const definitions = parsed.flatMap((entry) => entry.definitions);
  const acceptanceSections = parsed.flatMap(
    (entry) => entry.acceptanceSections,
  );
  const coverage = parsed.flatMap((entry) => entry.coverage);
  return {
    repoRoot,
    sourceDirectory,
    files,
    canonicalFiles,
    parsed,
    definitions,
    acceptanceSections,
    coverage,
    definitionsById: Map.groupBy(definitions, (definition) => definition.id),
    coverageById: Map.groupBy(coverage, (entry) => entry.id),
  };
}

export function diagnostic({ code, rule, file, line = 1, subject, message }) {
  return { code, rule, file, line, subject, message };
}

export function compareDiagnostics(left, right) {
  return (
    left.file.localeCompare(right.file) ||
    left.line - right.line ||
    left.code.localeCompare(right.code) ||
    (left.subject ?? "").localeCompare(right.subject ?? "")
  );
}

export function formatDiagnostic(entry) {
  const subject = entry.subject ? ` [${entry.subject}]` : "";
  return `${entry.code} ${entry.rule} ${entry.file}:${entry.line}${subject} — ${entry.message}`;
}
