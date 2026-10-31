/** Fit only the currently rendered content; never clone editors or load hidden data. */
export function measureColumnContentWidth(root: HTMLElement): number {
  let remaining = 65536;
  const number = (value: string) => Number.parseFloat(value) || 0;
  function measure(node: Element): { width: number; excluded: boolean } {
    const style = getComputedStyle(node);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      node.hasAttribute("inert") ||
      (style.display !== "contents" && !node.getClientRects().length)
    )
      return { width: 0, excluded: true };
    if (--remaining < 0)
      return { width: node.getBoundingClientRect().width, excluded: false };
    const margin =
      number(style.marginInlineStart) + number(style.marginInlineEnd);
    const border =
      number(style.borderInlineStartWidth) + number(style.borderInlineEndWidth);
    const padding =
      number(style.paddingInlineStart) + number(style.paddingInlineEnd);
    if (node.matches("svg, img, canvas, video, input, textarea, select"))
      return {
        width: node.getBoundingClientRect().width + margin,
        excluded: false,
      };
    const children: { element?: Element; width: number }[] = [];
    let excluded = false;
    function collect(parent: Element) {
      for (const child of parent.childNodes) {
        if (remaining <= 0) break;
        if (child instanceof Element) {
          const childStyle = getComputedStyle(child);
          if (
            childStyle.display === "contents" &&
            childStyle.visibility !== "hidden" &&
            !child.hasAttribute("inert")
          ) {
            remaining--;
            collect(child);
          } else {
            const measured = measure(child);
            excluded ||= measured.excluded;
            if (measured.width)
              children.push({ element: child, width: measured.width });
          }
        } else if (
          child.nodeType === Node.TEXT_NODE &&
          child.textContent?.trim()
        ) {
          const range = node.ownerDocument.createRange();
          range.selectNode(child);
          children.push({ width: range.getBoundingClientRect().width });
        }
      }
    }
    collect(node);
    const widths = children.map((child) => child.width);
    if (style.display === "contents")
      return { width: Math.max(0, ...widths), excluded };
    const horizontal =
      (style.display.includes("flex") &&
        !style.flexDirection.startsWith("column")) ||
      style.display === "inline" ||
      style.display === "inline-block";
    // Grid rows contribute their widest visible row, not every cell in the grid.
    let content = Math.max(0, ...widths);
    if (horizontal)
      content =
        widths.reduce((sum, width) => sum + width, 0) +
        Math.max(0, widths.length - 1) * number(style.columnGap);
    else if (style.display.includes("grid")) {
      const rows = new Map<number, number[]>();
      for (const child of children) {
        if (!child.element) continue;
        const top = Math.round(child.element.getBoundingClientRect().top);
        const row = rows.get(top) ?? [];
        row.push(child.width);
        rows.set(top, row);
      }
      content = Math.max(
        content,
        ...Array.from(
          rows.values(),
          (row) =>
            row.reduce((sum, width) => sum + width, 0) +
            Math.max(0, row.length - 1) * number(style.columnGap),
        ),
      );
    }
    // Ancestor scrollWidth includes hidden/inert descendants even when skipped.
    const overflow =
      !excluded && node.scrollWidth > node.clientWidth + 1
        ? node.scrollWidth + border
        : 0;
    const minimum = style.minWidth.endsWith("px") ? number(style.minWidth) : 0;
    return {
      width: Math.ceil(
        Math.max(
          content + padding + border,
          overflow,
          minimum,
          node.getBoundingClientRect().width,
        ) + margin,
      ),
      excluded,
    };
  }
  return measure(root).width;
}

/** A finite default also bounds columns configured with maxWidth:null. */
export function constrainColumnFitWidth(
  content: number,
  minimum: number,
  maximum: number | null,
  fitMaximum = 720,
): number {
  const cap = Number.isFinite(fitMaximum) && fitMaximum > 0 ? fitMaximum : 720;
  return Math.max(
    minimum,
    Math.min(Math.max(minimum, maximum ?? Infinity), cap, Math.ceil(content)),
  );
}
