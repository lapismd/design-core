export const EXIT = {
  unexpected: 1,
  invalidRequest: 2,
  preflight: 3,
  intake: 4,
  unsupported: 5,
  tailwind: 6,
  generation: 7,
  storybook: 8,
  parity: 9,
  existingVisual: 10,
  integration: 11,
  snapshotIntegrity: 12,
  patchApply: 13,
} as const;

export class GeneratorError extends Error {
  readonly exitCode: number;
  readonly details?: string;

  constructor(message: string, exitCode: number, details?: string) {
    super(message);
    this.name = "GeneratorError";
    this.exitCode = exitCode;
    this.details = details;
  }
}
