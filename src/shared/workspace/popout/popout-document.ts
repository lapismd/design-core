/** Mirror host-owned styles and appearance without replacing popup content. */
export function mirrorPopoutDocument(
  source: HTMLElement,
  target: Document,
): () => void {
  const sourceDocument = source.ownerDocument;
  const clones: Node[] = [];
  const style = target.createElement("style");
  target.head.append(style);
  const syncStyles = () => {
    clones.splice(0).forEach((node) => node.parentNode?.removeChild(node));
    for (const node of sourceDocument.querySelectorAll(
      'style,link[rel="stylesheet"]',
    )) {
      const clone = node.cloneNode(true);
      target.head.insertBefore(clone, style);
      clones.push(clone);
    }
  };
  const syncAppearance = () => {
    target.documentElement.className = sourceDocument.documentElement.className;
    const theme =
      source.closest("[data-ui-theme]")?.getAttribute("data-ui-theme") ??
      sourceDocument.documentElement.getAttribute("data-ui-theme");
    if (theme) target.documentElement.setAttribute("data-ui-theme", theme);
    else target.documentElement.removeAttribute("data-ui-theme");
    const computed = sourceDocument.defaultView!.getComputedStyle(source);
    const declarations: string[] = [];
    for (const name of computed) {
      if (name.startsWith("--"))
        declarations.push(`${name}:${computed.getPropertyValue(name)};`);
    }
    declarations.push(
      `font-family:${computed.fontFamily};font-size:${computed.fontSize};color-scheme:${computed.colorScheme};`,
    );
    style.textContent = `:root{${declarations.join("")}}`;
  };
  syncStyles();
  syncAppearance();
  const headObserver = new MutationObserver(() => {
    syncStyles();
    syncAppearance();
  });
  headObserver.observe(sourceDocument.head, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });
  const appearanceObserver = new MutationObserver(syncAppearance);
  for (let node: HTMLElement | null = source; node; node = node.parentElement) {
    appearanceObserver.observe(node, { attributes: true });
  }
  return () => {
    headObserver.disconnect();
    appearanceObserver.disconnect();
    clones.forEach((node) => node.parentNode?.removeChild(node));
    style.remove();
  };
}
