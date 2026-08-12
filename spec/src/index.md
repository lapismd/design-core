# Introduction

This book is the canonical behavioral and governance contract for `@lapismd/design-core`. It baselines existing behavior; it does not redesign components.

## Public surface coverage

| Surface                 | Public boundary | Requirement |
| ----------------------- | --------------- | ----------- |
| Canonical specification | Governance      | DC-ARCH-001 |

## DC-ARCH-001 — Canonical specification

**Requirement.** Design Core MUST treat the Markdown under `spec/src` as the canonical statement of public behavior and verification intent.

### Acceptance details

- Repository guidance, generated documentation, and discovery tools must point back to these source files.
- When prose elsewhere conflicts with this specification, the specification governs unless a higher-level workspace rule applies.
