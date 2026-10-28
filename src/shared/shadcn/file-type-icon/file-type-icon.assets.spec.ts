import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "vite";
import { describe, expect, it } from "vitest";
import artwork from "./file-type-artwork.generated.json";
import matchers from "./file-type-matchers.generated.json";

describe("curated file icon assets", () => {
  it("keeps every supported mapping within the curated artwork", () => {
    expect(Object.keys(artwork).length).toBeLessThanOrEqual(128);
    for (const name of Object.values(matchers.filenames).concat(
      Object.values(matchers.extensions),
    ))
      expect(Object.hasOwn(artwork, name)).toBe(true);
  });

  it("ships the resolver below 48 KiB gzip without the full runtime catalogue", async () => {
    const result = await build({
      configFile: false,
      logLevel: "silent",
      build: {
        write: false,
        minify: "esbuild",
        target: "es2022",
        lib: {
          entry: fileURLToPath(new URL("./file-type-icon.ts", import.meta.url)),
          formats: ["es"],
        },
      },
    });
    const outputs = Array.isArray(result) ? result : [result];
    const chunks = outputs
      .flatMap((output) => ("output" in output ? output.output : []))
      .filter((output) => output.type === "chunk");
    expect(chunks.length).toBeGreaterThan(0);
    expect(
      gzipSync(chunks.map((chunk) => chunk.code).join("\n")).length,
    ).toBeLessThan(48 * 1024);
    expect(
      chunks.flatMap((chunk) => Object.keys(chunk.modules)).join("\n"),
    ).not.toContain("node_modules/material-file-icons");
    const manifest = JSON.parse(
      readFileSync(
        new URL("../../../../package.json", import.meta.url),
        "utf8",
      ),
    );
    expect(manifest.dependencies).not.toHaveProperty("material-file-icons");
    expect(manifest.devDependencies["material-file-icons"]).toBe("2.4.0");
  });
});
