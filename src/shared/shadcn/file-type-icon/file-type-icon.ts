import artwork from "./file-type-artwork.generated.json";
import matchers from "./file-type-matchers.generated.json";

const icons: Readonly<Record<string, string>> = artwork;
const filenames: Readonly<Record<string, string>> = matchers.filenames;
const extensions: Readonly<Record<string, string>> = matchers.extensions;
const own = (map: Readonly<Record<string, string>>, key: string) =>
  Object.hasOwn(map, key) ? map[key] : undefined;

function icon(name: string) {
  const svg = own(icons, name);
  return svg ? { name, svg } : { name: "file", svg: artwork.file };
}

/** Match special filenames using the leaf, never the containing directory. */
export function resolveFileTypeIcon(path: string) {
  const basename = (path.split(/[\\/]/).at(-1) ?? "").toLowerCase();
  const named = own(filenames, basename);
  if (named) return icon(named);
  // Walk longest suffix first: "test.ts" before "ts".
  for (
    let dot = basename.indexOf(".");
    dot >= 0;
    dot = basename.indexOf(".", dot + 1)
  ) {
    const matched = own(extensions, basename.slice(dot + 1));
    if (matched) return icon(matched);
  }
  return icon("file");
}
