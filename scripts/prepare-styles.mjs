import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { compile } from "@tailwindcss/node";
import postcss from "postcss";
import valueParser from "postcss-value-parser";
import {
  utilitySelectors,
  assertNoUtilitySelectors,
} from "./lib/style-utilities.mjs";
export {
  utilitySelectors,
  assertNoUtilitySelectors,
} from "./lib/style-utilities.mjs";

const compilerRules = new Set([
  "apply",
  "theme",
  "utility",
  "custom-variant",
  "variant",
  "source",
  "reference",
  "tailwind",
  "config",
  "plugin",
]);

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(file) : [file];
    })
    .sort();
}

/** Audit output syntax, not comments, license notices, or private variable names. */
export function assertBrowserCss(css, file = "stylesheet") {
  const root = postcss.parse(css, { from: file });
  root.walkAtRules((rule) => {
    if (compilerRules.has(rule.name)) {
      throw rule.error(`Unprepared Tailwind directive @${rule.name}`);
    }
    if (rule.name === "import" && !/^["']\.\.?\//.test(rule.params)) {
      throw rule.error(
        "Prepared CSS may import only relative package stylesheets",
      );
    }
  });
  root.walkDecls((declaration) => {
    if (
      /(?:\btheme|--(?:alpha|spacing|theme|value|modifier))\(/.test(
        declaration.value,
      )
    ) {
      throw declaration.error("Unprepared Tailwind value function");
    }
  });
}

function copyAssetLicense(asset, assetsDirectory) {
  let directory = path.dirname(asset);
  while (directory !== path.dirname(directory)) {
    const manifest = path.join(directory, "package.json");
    if (existsSync(manifest)) {
      const { name } = JSON.parse(readFileSync(manifest, "utf8"));
      const license = ["LICENSE", "LICENSE.md", "LICENSE.txt", "OFL.txt"].find(
        (name) => existsSync(path.join(directory, name)),
      );
      if (!license) throw new Error(`Missing asset license for ${asset}`);
      copyFileSync(
        path.join(directory, license),
        path.join(
          assetsDirectory,
          `${name.replaceAll(/[^a-z0-9.-]/gi, "-")}-${license}`,
        ),
      );
      return;
    }
    directory = path.dirname(directory);
  }
  throw new Error(`Cannot identify the package license for ${asset}`);
}

function packageAssets(css, file, outputDirectory) {
  const root = postcss.parse(css, { from: file });
  const assetsDirectory = path.join(outputDirectory, "assets");
  root.walkDecls((declaration) => {
    const value = valueParser(declaration.value);
    value.walk((node) => {
      if (node.type !== "function" || node.value !== "url") return;
      const argument = node.nodes[0];
      if (!argument || !["word", "string"].includes(argument.type)) {
        throw declaration.error("Unsupported CSS asset URL");
      }
      const url = argument.value;
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(url)) return;
      const suffixStart = url.search(/[?#]/);
      const pathname = suffixStart < 0 ? url : url.slice(0, suffixStart);
      const suffix = suffixStart < 0 ? "" : url.slice(suffixStart);
      const source = path.resolve(
        path.dirname(file),
        decodeURIComponent(pathname),
      );
      if (!existsSync(source))
        throw declaration.error(`Missing CSS asset ${url}`);
      if (!path.relative(outputDirectory, source).startsWith("..")) return;
      mkdirSync(assetsDirectory, { recursive: true });
      const digest = createHash("sha256")
        .update(readFileSync(source))
        .digest("hex")
        .slice(0, 16);
      const destination = path.join(
        assetsDirectory,
        `${digest}-${path.basename(source)}`,
      );
      copyFileSync(source, destination);
      copyAssetLicense(source, assetsDirectory);
      argument.value =
        path
          .relative(path.dirname(file), destination)
          .split(path.sep)
          .join("/") + suffix;
    });
    declaration.value = value.toString();
  });
  return root.toString();
}

/** Compile only authoring sheets; keep ordinary component CSS imports intact. */
export async function prepareStyles(
  outputDirectory,
  { requireNoUtilitySelectors = true } = {},
) {
  const files = filesUnder(outputDirectory);
  const prepared = new Map();
  for (const file of files.filter((file) => file.endsWith(".css"))) {
    const source = readFileSync(file, "utf8");
    let needsCompiler = false;
    postcss.parse(source, { from: file }).walkAtRules((rule) => {
      if (
        compilerRules.has(rule.name) ||
        (rule.name === "import" &&
          /["'](?:tailwindcss|tw-animate-css|shadcn-svelte\/tailwind\.css)["']/.test(
            rule.params,
          ))
      ) {
        needsCompiler = true;
      }
    });
    if (!needsCompiler) continue;
    // Static theme output is essential: components already use semantic CSS and
    // their variable/keyframe dependencies cannot be inferred from utility scans.
    const compiler = await compile(
      `@import ${JSON.stringify("./" + path.basename(file))} source(none) theme(static);`,
      { base: path.dirname(file), onDependency() {}, shouldRewriteUrls: true },
    );
    if (
      (compiler.root !== "none" && compiler.root !== null) ||
      compiler.sources.length !== 0
    ) {
      throw new Error(`Package styles must not scan source files: ${file}`);
    }
    const css = packageAssets(compiler.build([]), file, outputDirectory);
    assertBrowserCss(css, file);
    assertNoUtilitySelectors(css, file);
    prepared.set(file, css);
  }
  // Compile all roots before replacing any imported authoring sheets, so output
  // cannot depend on traversal order (storybook.css imports styles.css).
  for (const [file, css] of prepared) writeFileSync(file, css);
  let audited = 0;
  const remainingUtilities = [];
  for (const file of files) {
    if (file.endsWith(".css")) {
      const css = readFileSync(file, "utf8");
      assertBrowserCss(css, file);
      remainingUtilities.push(
        ...utilitySelectors(css, path.relative(outputDirectory, file)),
      );
      audited++;
    } else if (file.endsWith(".svelte")) {
      for (const match of readFileSync(file, "utf8").matchAll(
        /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g,
      )) {
        assertBrowserCss(match[1], file);
        remainingUtilities.push(
          ...utilitySelectors(match[1], path.relative(outputDirectory, file)),
        );
        audited++;
      }
    }
  }
  if (requireNoUtilitySelectors && remainingUtilities.length) {
    const first = remainingUtilities[0];
    throw new Error(
      `${first.file}:${first.line}: Tailwind utility selector .${first.token}; ${remainingUtilities.length} references block release packaging`,
    );
  }
  return { compiled: prepared.size, audited, remainingUtilities };
}
