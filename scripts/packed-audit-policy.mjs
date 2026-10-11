// User accepted this known advisory across releases on 2026-10-11.
// Keep the finding visible; remove once upstream math ranges are patched.
const advisoryId = "GHSA-238p-pmpm-9mq7";
const advisoryUrl = `https://github.com/advisories/${advisoryId}`;

function fail(message) {
  throw new Error(`Packed production dependency audit failed: ${message}`);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function checkPackedAudit(result) {
  if (result.error || result.signal || ![0, 1].includes(result.status)) {
    fail(
      `audit command failed: ${result.error || result.stderr || result.status}`,
    );
  }
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    fail("invalid audit JSON");
  }
  const counts = report?.metadata?.vulnerabilities;
  if (
    report?.error ||
    report?.auditReportVersion !== 2 ||
    !isObject(report.vulnerabilities) ||
    !isObject(counts)
  ) {
    fail("invalid or incomplete npm audit report");
  }
  const entries = Object.entries(report.vulnerabilities);
  for (const severity of ["info", "low", "moderate", "high", "critical"]) {
    if (
      !Number.isInteger(counts[severity]) ||
      counts[severity] < 0 ||
      counts[severity] !==
        entries.filter(([, entry]) => entry?.severity === severity).length
    ) {
      fail("inconsistent vulnerability counts");
    }
  }
  if (counts.total !== entries.length) fail("inconsistent vulnerability total");
  if (entries.length === 0) {
    if (result.status !== 0) fail("audit failed without reported advisories");
    return "Packed production audit passed with zero findings.";
  }
  if (result.status !== 1 || counts.low !== entries.length) {
    fail("unexpected audit exit status or severity");
  }

  // Every propagated npm row must terminate in the accepted advisory.
  const checked = new Set();
  function visit(name, ancestors = new Set()) {
    if (checked.has(name)) return;
    if (ancestors.has(name)) fail(`cyclic advisory chain: ${name}`);
    const entry = report.vulnerabilities[name];
    if (
      !isObject(entry) ||
      entry.name !== name ||
      entry.severity !== "low" ||
      !Array.isArray(entry.via) ||
      entry.via.length === 0
    ) {
      fail(`invalid advisory chain: ${name}`);
    }
    const next = new Set([...ancestors, name]);
    for (const via of entry.via) {
      if (typeof via === "string") {
        visit(via, next);
      } else if (
        !isObject(via) ||
        via.url !== advisoryUrl ||
        via.name !== "katex" ||
        via.dependency !== "katex" ||
        name !== "katex" ||
        via.severity !== "low" ||
        via.range !== ">=0.11.0 <0.18.2"
      ) {
        fail(`unaccepted advisory: ${via?.url ?? name}`);
      }
    }
    checked.add(name);
  }
  for (const [name] of entries) visit(name);
  return `Accepted release exception: ${advisoryId} (low, KaTeX; ${entries.length} affected packages); user-approved across releases until upstream math dependencies are patched. The vulnerability remains present. Full audit evidence: .release/production-consumer-audit.json.`;
}
