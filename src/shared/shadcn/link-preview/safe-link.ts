/** Restrict links to web, mail and explicit local paths; never execute supplied protocols. */
export function safeLink(href: string | undefined): string | undefined {
  if (!href || /[\u0000-\u0020\u007f]/u.test(href)) return undefined;
  if (/^(?:\/(?![\/\\])|#|\.\.?\/)/u.test(href)) return href;
  try {
    const url = new URL(href);
    return ["https:", "http:", "mailto:"].includes(url.protocol)
      ? href
      : undefined;
  } catch {
    return undefined;
  }
}
