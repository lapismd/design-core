export function autosizeTextarea(node: HTMLTextAreaElement, _value?: unknown) {
  let frame: number | null = null;

  function resize() {
    frame = null;
    node.style.height = "auto";
    node.style.height = `${node.scrollHeight}px`;
  }

  function scheduleResize() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(resize);
  }

  node.style.overflow = "hidden";
  node.style.resize = "none";
  node.addEventListener("input", scheduleResize);
  scheduleResize();

  return {
    update(_nextValue?: unknown) {
      scheduleResize();
    },
    destroy() {
      if (frame !== null) cancelAnimationFrame(frame);
      node.removeEventListener("input", scheduleResize);
    },
  };
}
