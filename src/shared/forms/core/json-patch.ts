export type JsonPatchOperation =
  | { op: "add" | "replace"; path: string; value: unknown }
  | { op: "remove"; path: string };

export function decodePointerSegment(segment: string) {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}

export function pointerParts(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`Patch path must be a JSON Pointer: ${path}`);
  }
  return path.split("/").slice(1).map(decodePointerSegment);
}

export function cloneJson<T>(source: T): T {
  return JSON.parse(JSON.stringify(source)) as T;
}

export function pointerValue(root: unknown, path: string) {
  const parts = pointerParts(path);
  let target = root;
  for (const part of parts) {
    if (Array.isArray(target)) {
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= target.length) {
        return undefined;
      }
      target = target[index];
    } else if (target && typeof target === "object") {
      target = (target as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return target;
}

function targetFor(root: unknown, path: string, requiredRoot?: string) {
  const parts = pointerParts(path);
  if (requiredRoot && parts[0] !== requiredRoot) {
    throw new Error(`Patch path must target /${requiredRoot}: ${path}`);
  }
  if (parts.length === 0) throw new Error("Patch path cannot be empty.");
  let target = root as Record<string, unknown> | unknown[];
  for (const part of parts.slice(0, -1)) {
    if (Array.isArray(target)) {
      const index = Number(part);
      if (!Number.isInteger(index) || index < 0 || index >= target.length) {
        throw new Error(`Invalid array index in patch path: ${path}`);
      }
      target = target[index] as Record<string, unknown> | unknown[];
    } else if (target && typeof target === "object") {
      if (!(part in target))
        throw new Error(`Patch path does not exist: ${path}`);
      target = (target as Record<string, unknown>)[part] as
        | Record<string, unknown>
        | unknown[];
    } else {
      throw new Error(`Patch path cannot be resolved: ${path}`);
    }
  }
  return { target, key: parts.at(-1) ?? "" };
}

function applyOperation(
  source: unknown,
  operation: JsonPatchOperation,
  requiredRoot?: string,
) {
  const { target, key } = targetFor(source, operation.path, requiredRoot);
  if (Array.isArray(target)) {
    if (operation.op === "add" && key === "-") {
      target.push(operation.value);
      return;
    }
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index > target.length) {
      throw new Error(`Invalid array index in patch path: ${operation.path}`);
    }
    if (operation.op === "add") {
      target.splice(index, 0, operation.value);
      return;
    }
    if (index >= target.length) {
      throw new Error(`Patch path does not exist: ${operation.path}`);
    }
    if (operation.op === "replace") {
      target[index] = operation.value;
      return;
    }
    target.splice(index, 1);
    return;
  }

  if (!target || typeof target !== "object") {
    throw new Error(`Patch path cannot be resolved: ${operation.path}`);
  }
  const object = target as Record<string, unknown>;
  if (operation.op === "remove") {
    if (!(key in object)) {
      throw new Error(`Patch path does not exist: ${operation.path}`);
    }
    delete object[key];
    return;
  }
  if (operation.op === "replace" && !(key in object)) {
    throw new Error(`Patch path does not exist: ${operation.path}`);
  }
  object[key] = operation.value;
}

export function applyJsonPatch<T>(
  source: T,
  operations: JsonPatchOperation[],
  requiredRoot?: string,
) {
  const patched = cloneJson(source);
  for (const operation of operations) {
    if (!["add", "replace", "remove"].includes(operation.op)) {
      throw new Error(
        `Unsupported patch operation: ${(operation as { op?: string }).op}`,
      );
    }
    applyOperation(patched, operation, requiredRoot);
  }
  return patched;
}
