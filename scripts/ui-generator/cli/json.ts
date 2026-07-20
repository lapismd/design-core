export type JsonOk = {
  ok: true;
  command: string;
  message?: string;
  data?: unknown;
};

export type JsonErr = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
};

export function jsonOk(
  command: string,
  data?: unknown,
  message?: string,
): JsonOk {
  const payload: JsonOk = { ok: true, command };
  if (message !== undefined) payload.message = message;
  if (data !== undefined) payload.data = data;
  return payload;
}

export function jsonErr(
  code: string,
  message: string,
  details?: string,
): JsonErr {
  const error: JsonErr["error"] = { code, message };
  if (details !== undefined) error.details = details;
  return { ok: false, error };
}

export function printJson(payload: JsonOk | JsonErr): void {
  const stream = payload.ok ? process.stdout : process.stderr;
  stream.write(`${JSON.stringify(payload, null, 2)}\n`);
}
