import {
  advanceFModeQuery,
  createFModeEntries,
  resolveFModeQuery,
  type FModeEntry,
} from "./hint-labels.js";
import type { FModeHintTarget, FModeSettings } from "./types.js";

export class FModeSession {
  active = $state(false);
  query = $state("");
  entries = $state<FModeEntry<FModeHintTarget>[]>([]);
  settings = $state<FModeSettings | null>(null);
  invalidSequence = $state(0);

  get visibleEntries(): FModeEntry<FModeHintTarget>[] {
    return resolveFModeQuery(this.entries, this.query).visible;
  }

  get exactEntry(): FModeEntry<FModeHintTarget> | undefined {
    return resolveFModeQuery(this.entries, this.query).exactMatch;
  }

  open(targets: FModeHintTarget[], settings: FModeSettings): void {
    this.close();
    this.settings = settings;
    this.entries = createFModeEntries(targets, settings.alphabet);
    this.active = true;
  }

  close(): void {
    this.active = false;
    this.query = "";
    this.entries = [];
    this.settings = null;
  }

  advance(key: string): {
    accepted: boolean;
    matchedTarget?: FModeHintTarget;
  } {
    const result = advanceFModeQuery(this.entries, this.query, key);
    if (!result.accepted) {
      this.invalidSequence += 1;
      return { accepted: false };
    }
    this.query = result.state.query;
    return {
      accepted: true,
      matchedTarget: result.state.exactMatch?.target,
    };
  }

  backspace(): void {
    if (this.query) this.query = this.query.slice(0, -1);
  }
}
