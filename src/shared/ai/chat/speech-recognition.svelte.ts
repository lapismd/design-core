import type {
  DictationOptions,
  SpeechRecognitionConstructor,
  SpeechRecognitionController,
  SpeechRecognitionOptions,
  SpeechRecognitionResultEvent,
} from "./types.js";

type BrowserWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function browserRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const browserWindow = window as BrowserWindow;
  return (
    browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition ??
    null
  );
}

function defaultGetUserMedia(
  constraints: MediaStreamConstraints,
): Promise<MediaStream> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return Promise.reject(new Error("Media capture is unavailable"));
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}

function defaultAudioContext(): AudioContext {
  return new AudioContext();
}

function defaultRaf(callback: FrameRequestCallback): number {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(callback);
  }
  return setTimeout(() => callback(Date.now()), 16) as unknown as number;
}

function defaultCaf(id: number): void {
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

function normalizeBands(data: Uint8Array, count: number): number[] {
  if (data.length === 0) return Array.from({ length: count }, () => 0);
  const width = Math.max(1, Math.floor(data.length / count));
  return Array.from({ length: count }, (_, index) => {
    const start = index * width;
    const end =
      index === count - 1 ? data.length : Math.min(data.length, start + width);
    let sum = 0;
    for (let cursor = start; cursor < end; cursor += 1) {
      sum += data[cursor] ?? 0;
    }
    return Math.min(1, sum / Math.max(1, end - start) / 255);
  });
}

/**
 * Progressive Web Speech/Web Audio controller. All browser resources are
 * capability-detected and released by `cleanup`.
 */
export function createSpeechRecognition(
  options: SpeechRecognitionOptions = {},
): SpeechRecognitionController {
  const Recognition =
    options.recognitionConstructor === undefined
      ? browserRecognitionConstructor()
      : options.recognitionConstructor;
  const getUserMedia =
    options.getUserMedia === undefined
      ? defaultGetUserMedia
      : options.getUserMedia;
  const createAudioContext =
    options.createAudioContext === undefined
      ? defaultAudioContext
      : options.createAudioContext;
  const raf = options.requestAnimationFrame ?? defaultRaf;
  const caf = options.cancelAnimationFrame ?? defaultCaf;

  let recognition: InstanceType<SpeechRecognitionConstructor> | null = null;
  let stream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let animationFrame = 0;
  let starting: Promise<void> | null = null;

  let isListening = $state(false);
  let isSpeaking = $state(false);
  let volume = $state(0);
  let bands = $state<number[]>([0, 0, 0, 0, 0]);
  let rawBands = $state<number[]>([0, 0, 0, 0, 0]);
  let interimTranscript = $state("");

  const transform = options.transformTranscript ?? ((value: string) => value);

  function stopMeter(): void {
    if (animationFrame) {
      caf(animationFrame);
      animationFrame = 0;
    }
    analyser?.disconnect();
    analyser = null;
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }
    audioContext = null;
    volume = 0;
    bands = [0, 0, 0, 0, 0];
    rawBands = [0, 0, 0, 0, 0];
  }

  async function startMeter(): Promise<void> {
    if (!getUserMedia || !createAudioContext) return;
    try {
      stream = await getUserMedia({ audio: true });
      audioContext = createAudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.72;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const sample = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(data);
        rawBands = normalizeBands(data, 5);
        bands = rawBands.map((value, index) =>
          Math.min(1, value * (1.1 + index * 0.08)),
        );
        volume =
          rawBands.reduce((sum, value) => sum + value, 0) / rawBands.length;
        animationFrame = raf(sample);
      };
      animationFrame = raf(sample);
    } catch {
      // Speech recognition remains useful when microphone metering is blocked.
      stopMeter();
    }
  }

  function handleResults(event: SpeechRecognitionResultEvent): void {
    let interim = "";
    let final = "";
    for (
      let index = event.resultIndex;
      index < event.results.length;
      index += 1
    ) {
      const result = event.results[index];
      const transcript = result?.[0]?.transcript ?? "";
      if (result?.isFinal) final += transcript;
      else interim += transcript;
    }

    interimTranscript = transform(interim);
    if (interimTranscript) {
      options.onTranscript?.(interimTranscript, false);
    }
    if (final) {
      const transformed = transform(final);
      interimTranscript = "";
      options.onTranscript?.(transformed, true);
      options.onResult?.(transformed);
    }
  }

  function ensureRecognition() {
    if (!Recognition) return null;
    if (recognition) return recognition;
    recognition = new Recognition();
    recognition.lang = options.lang ?? "en-US";
    recognition.continuous = options.continuous ?? true;
    recognition.interimResults = options.interimResults ?? true;
    recognition.onstart = () => {
      isListening = true;
      options.onStart?.();
    };
    recognition.onend = () => {
      isListening = false;
      isSpeaking = false;
      stopMeter();
      options.onEnd?.();
    };
    recognition.onspeechstart = () => {
      isSpeaking = true;
    };
    recognition.onspeechend = () => {
      isSpeaking = false;
    };
    recognition.onresult = handleResults;
    recognition.onerror = (error) => {
      isListening = false;
      isSpeaking = false;
      stopMeter();
      options.onError?.(error);
    };
    recognition.onnomatch = () => {
      interimTranscript = "";
    };
    return recognition;
  }

  async function start(): Promise<void> {
    const instance = ensureRecognition();
    if (!instance || isListening) return;
    if (starting) return starting;
    starting = (async () => {
      await startMeter();
      try {
        instance.start();
      } catch (error) {
        stopMeter();
        options.onError?.({
          error: "start-failed",
          message: error instanceof Error ? error.message : String(error),
        });
      } finally {
        starting = null;
      }
    })();
    return starting;
  }

  function stop(): void {
    recognition?.stop();
  }

  function abort(): void {
    recognition?.abort();
    isListening = false;
    isSpeaking = false;
    interimTranscript = "";
    stopMeter();
  }

  function cleanup(): void {
    if (recognition) {
      recognition.onstart = null;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onspeechstart = null;
      recognition.onspeechend = null;
      recognition.onerror = null;
      recognition.onnomatch = null;
      recognition.abort();
      recognition = null;
    }
    isListening = false;
    isSpeaking = false;
    interimTranscript = "";
    stopMeter();
  }

  return {
    get isSupported() {
      return Recognition != null;
    },
    get isListening() {
      return isListening;
    },
    get isSpeaking() {
      return isSpeaking;
    },
    get volume() {
      return volume;
    },
    get bands() {
      return bands;
    },
    get rawBands() {
      return rawBands;
    },
    get interimTranscript() {
      return interimTranscript;
    },
    start,
    stop,
    abort,
    async toggle() {
      if (isListening) stop();
      else await start();
    },
    cleanup,
  };
}

/**
 * Composer-aware speech controller. Final transcripts are inserted through the
 * imperative input handle; consumers still receive every callback.
 */
export function createDictation(
  options: DictationOptions = {},
): SpeechRecognitionController {
  const {
    input,
    transformFinalTranscript = (value) => value,
    onTranscript,
    onResult,
    ...speechOptions
  } = options;

  return createSpeechRecognition({
    ...speechOptions,
    onTranscript(transcript, isFinal) {
      onTranscript?.(transcript, isFinal);
      if (isFinal) {
        const value = transformFinalTranscript(transcript);
        input?.insertText(value.endsWith(" ") ? value : `${value} `);
      }
    },
    onResult(transcript) {
      onResult?.(transcript);
    },
  });
}
