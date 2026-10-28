/** Project the visible, adjacent surface group without changing panel layout. */
export function syncAttachedSurfaces(composition: HTMLElement): void {
  const children = Array.from(composition.children) as HTMLElement[];
  const panels = children.filter(
    (element) => element.dataset.uiPart === "sidebar",
  );
  const main = children.find((element) => element.dataset.uiPart === "main");
  const flags = [
    "data-joined-start",
    "data-joined-end",
    "data-attached-outer-start",
    "data-attached-outer-end",
  ];
  const projected = new Map<HTMLElement, Set<string>>();
  const visible = (element: HTMLElement) =>
    !element.hidden && element.dataset.state !== "closed";
  const inline = children.filter(
    (element) =>
      element === main ||
      (element.dataset.uiPart === "sidebar-placeholder" && !element.hidden) ||
      (element.dataset.uiPart === "sidebar" &&
        visible(element) &&
        element.dataset.presentation === "inline" &&
        !element.hasAttribute("data-previewed")),
  );
  const index = main ? inline.indexOf(main) : -1;
  if (main && index !== -1) {
    let start = index,
      end = index;
    while (start > 0 && inline[start - 1]?.dataset.variant === "attached")
      start--;
    while (
      end < inline.length - 1 &&
      inline[end + 1]?.dataset.variant === "attached"
    )
      end++;
    if (start !== end) {
      for (let i = start; i <= end; i++) {
        const element = inline[i]!;
        const values = new Set<string>();
        if (i > start) values.add("data-joined-start");
        if (i < end) values.add("data-joined-end");
        if (i === start && start === 0 && element !== main)
          values.add("data-attached-outer-start");
        if (i === end && end === inline.length - 1 && element !== main)
          values.add("data-attached-outer-end");
        projected.set(element, values);
      }
    }
    // A constrained replacement paints the same exposed edges as Main.
    for (const panel of panels) {
      if (
        visible(panel) &&
        panel.dataset.variant === "attached" &&
        panel.dataset.presentation === "replace-main"
      ) {
        projected.set(panel, projected.get(main) ?? new Set());
      }
    }
  }
  for (const element of [...panels, ...(main ? [main] : [])]) {
    for (const flag of flags) {
      const enabled = projected.get(element)?.has(flag) ?? false;
      if (element.hasAttribute(flag) !== enabled)
        element.toggleAttribute(flag, enabled);
    }
  }
}

/** Observe only structural changes; derived attributes never trigger the observer. */
export function observeAttachedSurfaces(composition: HTMLElement): () => void {
  let frame: number | undefined;
  const sync = () => {
    frame = undefined;
    syncAttachedSurfaces(composition);
  };
  const observer = new MutationObserver((records) => {
    if (
      records.some(
        (record) =>
          record.target === composition ||
          record.target.parentNode === composition,
      )
    ) {
      frame ??= requestAnimationFrame(sync);
    }
  });
  observer.observe(composition, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "hidden",
      "data-state",
      "data-presentation",
      "data-variant",
      "data-previewed",
    ],
  });
  sync();
  return () => {
    observer.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
  };
}
