import { wrapLines } from "./canvas-table-text.js";

export function paintText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  wrap = false,
  center = false,
) {
  if (width <= 1 || height <= 1) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.textAlign = center ? "center" : "left";
  ctx.textBaseline = wrap ? "top" : "middle";
  const lines = wrap
    ? wrapLines(
        text,
        width - 16,
        (value) => ctx.measureText(value).width,
      ).slice(0, 4)
    : [text];
  lines.forEach((line, index) =>
    ctx.fillText(
      line,
      x + (center ? width / 2 : 8),
      y + (wrap ? 6 + index * 16 : height / 2),
    ),
  );
  ctx.restore();
}

export function clip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  paint: () => void,
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, Math.max(0, width), Math.max(0, height));
  ctx.clip();
  paint();
  ctx.restore();
}

export function fill(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}
