import { test } from "vitest";
import assert from "node:assert/strict";
import {
  bytesUnits,
  quantitySliderSteps,
  millisecondsUnits,
  secondsUnits,
  displayNumericValue,
  canonicalNumericValue,
  quantityError,
} from "./quantity.js";

test("numeric units preserve exact time and byte values", () => {
  assert.equal(canonicalNumericValue("2.5", millisecondsUnits[1]), "2500");
  assert.equal(canonicalNumericValue("1500", secondsUnits[1]), "NaN");
  assert.equal(canonicalNumericValue("1.5", bytesUnits[1]), "1536");
  for (const unit of [...millisecondsUnits, ...bytesUnits]) {
    for (const value of ["1", "1000", "1048575", "268435456"]) {
      const display = displayNumericValue(value, unit);
      if (!display.approximate)
        assert.equal(canonicalNumericValue(display.text, unit), value);
    }
  }
  assert.equal(displayNumericValue("1", secondsUnits[2]).approximate, true);
});

test("numeric validation rejects empty, fractional, unsafe and out-of-range values without rounding", () => {
  for (const value of [
    "",
    "NaN",
    "0.5",
    "1.00000000000000000001",
    "1e-80",
    "9007199254740993",
    "-1",
    "301",
  ]) {
    assert.ok(quantityError(value, 0, 300, "sec"), value);
  }
  for (const value of ["0", "1", "300", "1e2"])
    assert.equal(quantityError(value, 0, 300, "sec"), "");
  assert.equal(canonicalNumericValue("", bytesUnits[1]), "");
  assert.equal(canonicalNumericValue("1e99999", bytesUnits[1]), "NaN");
  assert.ok(
    quantityError(
      canonicalNumericValue("1e-80", bytesUnits[1]),
      0,
      1048576,
      "bytes",
    ),
  );
  assert.equal(
    quantityError(
      canonicalNumericValue("0.1", bytesUnits[1]),
      1,
      1048576,
      "bytes",
    ),
    "Enter a whole number of bytes.",
  );
});

test("invalid display unit ratios never divide by zero or throw", () => {
  for (const numerator of [0, -1, NaN, Infinity, 0.5]) {
    const unit = { id: "bad", label: "bad", numerator };
    assert.equal(canonicalNumericValue("1", unit), "NaN");
    assert.deepEqual(displayNumericValue("1", unit), {
      text: "1",
      approximate: false,
    });
  }
});

test("huge slider ranges retain typed values with bounded allocation", () => {
  const steps = quantitySliderSteps(0, Number.MAX_SAFE_INTEGER, 1048576);
  assert.ok(steps.length <= 1002);
  assert.ok(steps.includes(1048576));
  assert.equal(steps.at(-1), Number.MAX_SAFE_INTEGER);
});
