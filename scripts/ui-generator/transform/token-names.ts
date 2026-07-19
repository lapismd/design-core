export function publicTokenName(
  prefix: string,
  component: string,
  parts: string[],
): string {
  const slug = [component, ...parts]
    .filter(Boolean)
    .map((part) => part.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean)
    .join("-")
    .toLowerCase();
  return `--${prefix}-${slug}`;
}

export function privateTokenName(component: string, property: string): string {
  return `--_${component}-${property}`;
}
