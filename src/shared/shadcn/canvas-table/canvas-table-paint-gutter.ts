/** Copy the existing gutter paint into a fixed layer above scrolling rich cells. */
export function paintFrozenGutter(
  source: HTMLCanvasElement,
  target: HTMLCanvasElement | null,
  gutter: number,
  scale: number,
) {
  if (!target) return;
  const width = Math.min(gutter, Number.parseFloat(source.style.width) || 0);
  target.style.width = width + "px";
  target.style.height = source.style.height;
  const pixels = Math.round(width * scale);
  if (target.width !== pixels) target.width = pixels;
  if (target.height !== source.height) target.height = source.height;
  const context = target.getContext("2d");
  if (!context || !pixels) return;
  context.clearRect(0, 0, pixels, target.height);
  context.drawImage(
    source,
    0,
    0,
    pixels,
    source.height,
    0,
    0,
    pixels,
    target.height,
  );
}
