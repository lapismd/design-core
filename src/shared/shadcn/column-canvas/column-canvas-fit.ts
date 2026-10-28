/** Fit only the currently rendered content; never clone editors or load hidden data. */
export function measureColumnContentWidth(root: HTMLElement): number {
  let remaining = 4096;
  const number = (value: string) => Number.parseFloat(value) || 0;
  function measure(node: Element): number {
    const style = getComputedStyle(node);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      node.hasAttribute("inert") ||
      !node.getClientRects().length
    )
      return 0;
    if (--remaining < 0) return node.getBoundingClientRect().width;
    const margin =
      number(style.marginInlineStart) + number(style.marginInlineEnd);
    const border =
      number(style.borderInlineStartWidth) + number(style.borderInlineEndWidth);
    const padding =
      number(style.paddingInlineStart) + number(style.paddingInlineEnd);
    if (node.matches("svg, img, canvas, video, input, textarea, select"))
      return node.getBoundingClientRect().width + margin;
    const widths: number[] = [];
    for (const child of node.childNodes) {
      if (remaining <= 0) break;
      if (child instanceof Element) widths.push(measure(child));
      else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        const range = node.ownerDocument.createRange();
        range.selectNode(child);
        widths.push(range.getBoundingClientRect().width);
      }
    }
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
      for (const child of Array.from(node.children)) {
        if (remaining <= 0) break;
        const top = Math.round(child.getBoundingClientRect().top);
        const row = rows.get(top) ?? [];
        row.push(measure(child));
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
    const overflow =
      node.scrollWidth > node.clientWidth + 1 ? node.scrollWidth + border : 0;
    const minimum = style.minWidth.endsWith("px") ? number(style.minWidth) : 0;
    return Math.ceil(
      Math.max(
        content + padding + border,
        overflow,
        minimum,
        node.getBoundingClientRect().width,
      ) + margin,
    );
  }
  return measure(root);
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
