import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { checkPackedAudit } from "./packed-audit-policy.mjs";

test("required source audit collects both raw graphs with exact explicit-user HIGH admissions", () => {
  const policy = JSON.parse(
    readFileSync(
      new URL("../.github/development-audit-policy.json", import.meta.url),
    ),
  );
  assert.equal(policy.schemaVersion, 2);
  assert.equal(policy.repository, "lapismd/design-core");
  assert.equal(policy.approvals.length, 2);
  for (const entry of policy.approvals) {
    assert.equal(entry.advisory, "GHSA-fc5q-39xc-vjpf");
    assert.equal(entry.package, "picomatch");
    assert.equal(entry.severity, "high");
    assert.equal(entry.scope, "development-only");
    assert.equal(entry.vulnerableRange, "<=4.0.7");
    assert.equal(entry.patchedRange, "<0.0.0");
    assert.equal(entry.sourceSha, "7d2b32dc1fa0e444bdef39276f9c6014cea328a4");
    assert.equal(
      entry.manifestSha256,
      "bb57b420e4d8d45c0e47ac60d20573a512deb424d194111cc3ff934e75e0343b",
    );
    assert.equal(
      entry.lockSha256,
      "41d8405f554d352444bcce704a1d997787712367f29c34bcce17baa803534703",
    );
    assert.equal(entry.approvedAt, "2026-11-18T13:30:52.633Z");
    assert.equal(entry.expiresAt, "2026-11-19T00:00:00.000Z");
    assert.equal(entry.authority, "explicit-user");
    assert.equal(
      entry.record,
      "spec/records/2026-11-18-development-high-decision.md",
    );
  }
  assert.deepEqual(
    policy.approvals.map(({ version, path }) => ({ version, path })),
    [
      {
        version: "4.0.7",
        path: ".>@changesets/cli>@changesets/config>picomatch",
      },
      {
        version: "2.3.2",
        path: ".>@tailwindcss/cli>@parcel/watcher>micromatch>picomatch",
      },
    ],
  );
  const workflow = readFileSync(
    new URL("../.github/workflows/ci.yml", import.meta.url),
    "utf8",
  );
  const audit = workflow.split("\n  audit:\n")[1].split("\n  validate:\n")[0];
  assert.match(audit, /fetch-depth: 0/);
  assert.match(
    audit,
    /uses: lapismd\/lapis-ci\/actions\/check-development-audit@63e64958e9b271d36feba06a162ee02b079a3206/,
  );
  assert.match(audit, /policy-file: \.github\/development-audit-policy\.json/);
  assert.match(audit, /report-directory: \.release\/development-audit/);
  assert.match(audit, /if: always\(\)/);
  assert.match(audit, /uses: actions\/upload-artifact@v7/);
  assert.match(audit, /if-no-files-found: error/);
  assert.doesNotMatch(audit, /continue-on-error|audit-level|ignoreGhsas/);
  assert.match(workflow.split("\n  validate:\n")[1], /- audit/);
  const release = readFileSync(
    new URL("../.github/workflows/release.yml", import.meta.url),
    "utf8",
  );
  assert.match(release, /production-consumer-audit\.json/);
});

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

test("rejects the former KaTeX exception and its complete propagation chain", () => {
  for (const version of ["0.2.0", "0.3.0"]) {
    assert.throws(
      () => checkPackedAudit(result(report()), version),
      /zero findings/,
    );
  }
});

test("rejects the former KaTeX finding across subsequent package releases", () => {
  for (const version of ["0.2.1", "0.3.1", "0.4.0", undefined]) {
    assert.throws(
      () => checkPackedAudit(result(report()), version),
      /zero findings/,
    );
  }
});

test("rejects other advisories at every severity alongside the former finding", () => {
  for (const severity of ["info", "low", "moderate", "high", "critical"]) {
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
      /zero findings|severity/,
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
    assert.throws(
      () => checkPackedAudit(result(value), "0.3.0"),
      /zero findings/,
    );
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

test("clean audits pass only when the audit command succeeds", () => {
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
