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
  fail(
    `expected zero findings; received ${entries.length} affected package(s): ${entries
      .map(([name]) => name)
      .join(
        ", ",
      )}. Full audit evidence: .release/production-consumer-audit.json.`,
  );
}
