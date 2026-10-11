# Known packed KaTeX advisory acceptance

The user accepted the known KaTeX issue across subsequent releases on
2026-10-11 and requested that it stop failing builds. The former exception
accepted only Design Core 0.3.0 and its 0.2.0 preparation version, blocking the
next release despite the same accepted advisory. This slice removes that
release-version restriction under DC-PKG-009 and DC-TOOL-003.

The accepted finding remains exactly
[GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7),
low-severity KaTeX `>=0.11.0 <0.18.2`. Every npm propagation row must terminate
solely in that advisory. The vulnerable transitive graph remains present;
acceptance does not repair it. Published dependency manifests and the lockfile
remain unchanged. Workspace audits still run normally. Remove this policy when
upstream math dependencies admit a patched renderer.

## Regression evidence

`node --test scripts/packed-audit-policy.test.mjs` reproduced the recurrence
before the policy change: the new `known KaTeX acceptance persists across
subsequent package releases` test failed with the expired-version error
(**1 failed, 6 passed**). The same exact command now passes **7 tests, 0
failures**. Tests reject other advisories at every severity, escalated or changed
KaTeX findings, incomplete or cyclic propagation chains, malformed reports,
inconsistent counts, and failed commands; clean reports pass without using the
exception.

The packed-consumer gate continues to print the accepted advisory and retain
`.release/production-consumer-audit.json`. No global audit-ignore rule, consumer
override, dependency patch, fork, or copied dependency source is added.

## Repository and packed acceptance

- `pnpm checks` passed all nine nonvisual lanes: specification governance,
  formatting/types, **727 unit tests**, static Storybook and visual metadata,
  **683 interaction/accessibility stories**, Workspace (**15**), Shell (**11**),
  AI (**3**), and Shadcn (**56**, plus one existing skip) browser acceptance.
- `pnpm packages:pack` passed clean consumer types and cold public tarball
  startup/reactive editor acceptance. The packed audit retained **six low
  propagation findings** terminating solely in the accepted KaTeX advisory,
  and printed the version-independent acceptance.
- Full and production-only workspace audits recorded **zero findings**.
- The interaction run also logged **11 Composer Input/Composer Svelte identity
  warnings** caught during cleanup. This does not change the audit exception;
  the separate [runtime follow-up](2026-10-11-caught-runtime-diagnostics.md)
  records the guard and component cleanup repair.
