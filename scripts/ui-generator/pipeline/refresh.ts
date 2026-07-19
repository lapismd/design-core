import { EXIT, GeneratorError } from "../errors.js";

export async function runRefresh() {
  throw new GeneratorError(
    "ui:refresh is deferred until provenance three-way merge lands",
    EXIT.invalidRequest,
    "Use ui:add <component> --overwrite for the Button PoC conversion path.",
  );
}
