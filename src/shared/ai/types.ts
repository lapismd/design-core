import type { Snippet } from "svelte";

export type Density = "compact" | "balanced" | "spacious";
export type MessageSender = "user" | "assistant" | "system";
export type MessageBubbleVariant = "filled" | "ghost";
export type MessageBubbleGroup = "first" | "middle" | "last";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error";

export type ComposerStatus = {
  type: "error" | "warning";
  message?: string;
};

export type ComposerTokenBadge = {
  value: string;
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
};

export type ComposerTokenCustom = {
  value: string;
  label?: string;
  render: Snippet<[ComposerTokenCustom]>;
};

export type ComposerToken = ComposerTokenBadge | ComposerTokenCustom;

export type ComposerTriggerItem = {
  id: string;
  label: string;
  value?: string;
  description?: string;
  keywords?: string[];
  submitOnSelect?: boolean;
};

export type ComposerSearchSource = (
  query: string,
  signal: AbortSignal,
) => ComposerTriggerItem[] | Promise<ComposerTriggerItem[]>;

export type ComposerTrigger = {
  character: string;
  searchSource: ComposerSearchSource;
  onSelect: (item: ComposerTriggerItem) => string | ComposerToken;
  deserialize?: (value: string) => ComposerToken | null;
  emptySearchResultsText?: string;
  menuLabel?: string;
};

export type ComposerInputHandle = {
  focus: () => void;
  getValue: () => string;
  insertText: (text: string) => void;
  insertToken: (token: ComposerToken) => string | undefined;
  expandToken: (id: string) => void;
};

export type ToolCallStatus = "pending" | "running" | "complete" | "error";

export type ToolCallItem = {
  id?: string;
  name: string;
  status?: ToolCallStatus;
  target?: string;
  duration?: string;
  node?: string;
  additions?: number;
  deletions?: number;
  stats?: Snippet<[ToolCallItem]>;
  errorMessage?: string;
  data?: unknown;
  detail?: Snippet<[ToolCallItem]>;
};

export type SpeechRecognitionError = {
  error: string;
  message?: string;
};

export type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

export type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onerror: ((event: SpeechRecognitionError) => void) | null;
  onnomatch: (() => void) | null;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export type SpeechRecognitionOptions = {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  transformTranscript?: (text: string) => string;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onResult?: (transcript: string) => void;
  onError?: (error: SpeechRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
  recognitionConstructor?: SpeechRecognitionConstructor | null;
  getUserMedia?:
    | ((constraints: MediaStreamConstraints) => Promise<MediaStream>)
    | null;
  createAudioContext?: (() => AudioContext) | null;
  requestAnimationFrame?: typeof globalThis.requestAnimationFrame;
  cancelAnimationFrame?: typeof globalThis.cancelAnimationFrame;
};

export type SpeechRecognitionController = {
  readonly isSupported: boolean;
  readonly isListening: boolean;
  readonly isSpeaking: boolean;
  readonly volume: number;
  readonly bands: readonly number[];
  readonly rawBands: readonly number[];
  readonly interimTranscript: string;
  start: () => Promise<void>;
  stop: () => void;
  abort: () => void;
  toggle: () => Promise<void>;
  cleanup: () => void;
};

export type DictationOptions = SpeechRecognitionOptions & {
  input?: ComposerInputHandle | null;
  transformFinalTranscript?: (transcript: string) => string;
};
