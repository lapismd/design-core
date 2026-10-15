/** @param {string} token */
function stripVariants(token) {
  const lastVariant = token.lastIndexOf(":");
  return lastVariant >= 0 ? token.slice(lastVariant + 1) : token;
}

/** True for utility candidates; native a11y and semantic markers are allowed.
 * @param {string} token
 */
export function isTailwindUtility(token) {
  if (/^cn-[a-z0-9-]+$/i.test(token)) return false;
  const candidate = stripVariants(token.replace(/^!/, ""));
  // Intentional a11y helpers kept as class names across shadcn families.
  if (candidate === "sr-only" || candidate === "not-sr-only") return false;
  if (/^(?:group|peer)\//.test(candidate)) return true;
  if (
    /^(?:flex|inline-flex|grid|block|inline-block|inline|hidden|contents|table|table-row|table-cell|group|peer|container)$/.test(
      candidate,
    )
  ) {
    return true;
  }

  return /^(?:flex|grid|col|row|order|grow|shrink|basis|items|justify|content|self|place|gap|space|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|ms|me|w|h|min-w|max-w|min-h|max-h|size|bg|text|border|rounded|shadow|ring|outline|font|leading|tracking|whitespace|break|truncate|overflow|object|aspect|opacity|cursor|pointer-events|select|transition|duration|delay|ease|animate|absolute|relative|fixed|sticky|static|inset|top|right|bottom|left|start|end|z|visible|invisible|columns|divide|underline|decoration|uppercase|lowercase|capitalize|italic|not-italic|list|align|justify|peer-|group-)-/.test(
    candidate,
  );
}
