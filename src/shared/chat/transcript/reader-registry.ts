import type { TranscriptCommentAnchor } from "./model.js";
type Reader = (anchor: TranscriptCommentAnchor, scroll?: boolean) => void;
const registrations = new WeakMap<Map<string, Reader>, Map<string, Reader[]>>();

/** Last-mounted reader receives navigation; teardown restores a live predecessor. */
export function registerReader(
  readers: Map<string, Reader>,
  id: string,
  reader: Reader,
) {
  let groups = registrations.get(readers);
  if (!groups) {
    groups = new Map();
    registrations.set(readers, groups);
  }
  const owners = groups.get(id) ?? [];
  groups.set(id, owners);
  owners.push(reader);
  readers.set(id, reader);
  let mounted = true;
  return () => {
    if (!mounted) return;
    mounted = false;
    owners.splice(owners.indexOf(reader), 1);
    if (readers.get(id) === reader) {
      const previous = owners.at(-1);
      if (previous) readers.set(id, previous);
      else readers.delete(id);
    }
    if (!owners.length) groups.delete(id);
    if (!groups.size) registrations.delete(readers);
  };
}
