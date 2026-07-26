import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export type CacheOptions = {
  /** Disable all caching. */
  disabled?: boolean;
  /** Persist entries under this directory (optional). */
  diskRoot?: string;
};

type MemoryEntry = {
  fingerprint: string;
  value: unknown;
};

function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Content hash fingerprint for a set of source files. Missing files contribute a sentinel. */
export function fingerprintFiles(filePaths: string[]): string {
  const normalized = [...new Set(filePaths.map((p) => path.resolve(p)))].sort();
  const parts: string[] = [];
  for (const filePath of normalized) {
    if (!existsSync(filePath)) {
      parts.push(`${filePath}:missing`);
      continue;
    }
    const buf = readFileSync(filePath);
    const st = statSync(filePath);
    parts.push(`${filePath}:${st.size}:${sha256(buf)}`);
  }
  return sha256(parts.join("\n"));
}

export function createDocsCache(options: CacheOptions = {}) {
  const memory = new Map<string, MemoryEntry>();
  const disabled =
    options.disabled === true ||
    process.env.DOCS_MCP_CACHE === "0" ||
    process.env.DOCS_MCP_CACHE === "false" ||
    process.env.UI_DOCS_CACHE === "0" ||
    process.env.UI_DOCS_CACHE === "false";
  const diskRoot = options.diskRoot;

  if (diskRoot && !disabled) {
    mkdirSync(diskRoot, { recursive: true });
  }

  function diskPath(key: string): string | undefined {
    if (!diskRoot || disabled) return undefined;
    const safe = sha256(key);
    return path.join(diskRoot, `${safe}.json`);
  }

  function get<T>(
    key: string,
    filePaths: string[],
    build: () => T,
  ): { value: T; cacheHit: boolean } {
    if (disabled) {
      return { value: build(), cacheHit: false };
    }

    const fingerprint = fingerprintFiles(filePaths);
    const mem = memory.get(key);
    if (mem && mem.fingerprint === fingerprint) {
      return { value: mem.value as T, cacheHit: true };
    }

    const disk = diskPath(key);
    if (disk && existsSync(disk)) {
      try {
        const raw = JSON.parse(readFileSync(disk, "utf8")) as {
          fingerprint: string;
          value: T;
        };
        if (raw.fingerprint === fingerprint) {
          memory.set(key, { fingerprint, value: raw.value });
          return { value: raw.value, cacheHit: true };
        }
      } catch {
        // ignore corrupt cache
      }
    }

    const value = build();
    memory.set(key, { fingerprint, value });
    if (disk) {
      try {
        writeFileSync(
          disk,
          JSON.stringify({ fingerprint, value }, null, 0),
          "utf8",
        );
      } catch {
        // disk cache is best-effort
      }
    }
    return { value, cacheHit: false };
  }

  function clear(): void {
    memory.clear();
  }

  return { get, clear, fingerprintFiles, disabled };
}

export type DocsCache = ReturnType<typeof createDocsCache>;
