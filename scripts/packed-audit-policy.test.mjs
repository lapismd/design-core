import assert from "node:assert/strict";
import test from "node:test";
import { checkPackedAudit } from "./packed-audit-policy.mjs";

function report() {
  return {
    auditReportVersion: 2,
    vulnerabilities: {
      "@lapismd/design-core": {
        name: "@lapismd/design-core",
        severity: "low",
        via: ["rehype-katex"],
      },
      "rehype-katex": { name: "rehype-katex", severity: "low", via: ["katex"] },
      katex: {
        name: "katex",
        severity: "low",
        via: [
          {
            name: "katex",
            dependency: "katex",
            severity: "low",
            url: "https://github.com/advisories/GHSA-238p-pmpm-9mq7",
            range: ">=0.11.0 <0.18.2",
          },
        ],
      },
    },
    metadata: {
      vulnerabilities: {
        info: 0,
        low: 3,
        moderate: 0,
        high: 0,
        critical: 0,
        total: 3,
      },
    },
  };
}
const result = (value, status = 1) => ({
  stdout: JSON.stringify(value),
  status,
});

test("accepts KaTeX and its complete propagation chain for preparation and release", () => {
  for (const version of ["0.2.0", "0.3.0"]) {
    assert.match(
      checkPackedAudit(result(report()), version),
      /Accepted release exception: GHSA-238p-pmpm-9mq7/,
    );
  }
});

test("exception expires for other versions", () => {
  for (const version of ["0.2.1", "0.3.1", "0.4.0", undefined]) {
    assert.throws(() => checkPackedAudit(result(report()), version), /expired/);
  }
});

test("rejects different low and high advisories alongside the accepted advisory", () => {
  for (const severity of ["low", "high"]) {
    const value = report();
    value.vulnerabilities.other = {
      name: "other",
      severity,
      via: [
        {
          ...value.vulnerabilities.katex.via[0],
          url: "https://github.com/advisories/GHSA-other",
          severity,
        },
      ],
    };
    value.metadata.vulnerabilities[severity] += 1;
    value.metadata.vulnerabilities.total += 1;
    assert.throws(
      () => checkPackedAudit(result(value), "0.3.0"),
      /unaccepted|severity/,
    );
  }
});

test("rejects escalated or changed direct advisory", () => {
  for (const [key, changed] of Object.entries({
    severity: "moderate",
    dependency: "other",
    name: "other",
    range: "*",
    url: "https://example.com",
  })) {
    const value = report();
    value.vulnerabilities.katex.via[0][key] = changed;
    assert.throws(() => checkPackedAudit(result(value), "0.3.0"), /unaccepted/);
  }
});

test("rejects incomplete, cyclic, and unrelated propagation chains", () => {
  for (const via of [[], ["missing"], ["@lapismd/design-core"], [null]]) {
    const value = report();
    value.vulnerabilities["rehype-katex"].via = via;
    assert.throws(() => checkPackedAudit(result(value), "0.3.0"));
  }
});

test("rejects failed commands, malformed responses, and inconsistent metadata", () => {
  for (const command of [
    { status: 2 },
    { status: null, error: new Error("timeout") },
    { status: 1, signal: "SIGTERM" },
    { status: 0 },
    { stdout: "not JSON" },
  ]) {
    assert.throws(() =>
      checkPackedAudit({ ...result(report()), ...command }, "0.3.0"),
    );
  }
  for (const value of [
    {},
    { ...report(), error: { message: "registry unavailable" } },
    { ...report(), auditReportVersion: 1 },
  ]) {
    assert.throws(() => checkPackedAudit(result(value), "0.3.0"));
  }
  const value = report();
  value.metadata.vulnerabilities.low = 0;
  assert.throws(() => checkPackedAudit(result(value), "0.3.0"), /counts/);
  value.metadata.vulnerabilities.low = 3;
  value.metadata.vulnerabilities.total = 0;
  assert.throws(() => checkPackedAudit(result(value), "0.3.0"), /total/);
});

test("clean audits pass beyond the exception's versions without using it", () => {
  const value = report();
  value.vulnerabilities = {};
  value.metadata.vulnerabilities.low = 0;
  value.metadata.vulnerabilities.total = 0;
  assert.match(checkPackedAudit(result(value, 0), "0.4.0"), /zero findings/);
  assert.throws(
    () => checkPackedAudit(result(value), "0.3.0"),
    /without reported/,
  );
});
