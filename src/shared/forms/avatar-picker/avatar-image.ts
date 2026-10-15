export const AVATAR_IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";
/** A local data preview is used only when the host has no upload callback. */
export function readAvatarImage(
  file: File,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const stop = () => {
      reader.abort();
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const clean = () => signal.removeEventListener("abort", stop);
    reader.onload = () => {
      clean();
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The image could not be read."));
    };
    reader.onerror = () => {
      clean();
      reject(new Error("The image could not be read."));
    };
    signal.addEventListener("abort", stop, { once: true });
    if (signal.aborted) stop();
    else reader.readAsDataURL(file);
  });
}
/** Preserve a portable string value for emoji/initial avatars, as in the source apps. */
export function avatarDataUrl(text: string, background: string): string {
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" data-avatar-text="${escape(text)}" viewBox="0 0 256 256"><rect width="256" height="256" fill="${escape(background)}"/><text x="128" y="162" font-family="system-ui,sans-serif" font-size="112" text-anchor="middle" fill="white">${escape(text)}</text></svg>`)}`;
}

/** Read only the glyph marker produced by this editor; arbitrary image values remain opaque. */
export function avatarGlyph(value: string): string {
  if (!value.startsWith("data:image/svg+xml,")) return "";
  try {
    const source = decodeURIComponent(
      value.slice("data:image/svg+xml,".length),
    );
    const text = /\bdata-avatar-text="([^"]*)"/u.exec(source)?.[1];
    return (
      text
        ?.replaceAll("&quot;", '"')
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&amp;", "&") ?? ""
    );
  } catch {
    return "";
  }
}
