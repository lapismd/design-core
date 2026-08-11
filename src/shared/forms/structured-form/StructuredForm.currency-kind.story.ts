import type { FormFieldKindDefinition } from "@lapismd/design-core/forms/core";

declare module "@lapismd/design-core/forms/core" {
  interface FormFieldKindMap {
    currency: FormFieldKindDefinition<number, { currency: string }>;
  }
}

export {};
