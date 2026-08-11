<script lang="ts">
  import "./CodeEditor.css";
  import { linter, lintGutter } from "@codemirror/lint";
  import type { Extension } from "@codemirror/state";
  import { MiraCodeEditor } from "@lapismd/mira";

  import { createCodeEditorLanguageExtension } from "./code-editor-language";
  import { parserDiagnostics } from "./code-editor-syntax";

  let {
    value = $bindable(""),
    language = "ts",
    placeholder = "Add Code",
    minHeight = "10rem",
    ariaLabel = "Code editor",
    syntaxDiagnostics = true,
    extensions = [],
    onChange,
  }: {
    value?: string;
    language?: string;
    placeholder?: string;
    minHeight?: string;
    ariaLabel?: string;
    /** Highlight parser-detected syntax errors without executing the code. */
    syntaxDiagnostics?: boolean;
    /** Optional host-provided CodeMirror extensions, such as IntelliSense. */
    extensions?: Extension;
    onChange?: (value: string) => void;
  } = $props();

  const syntaxDiagnosticsExtension: Extension = [
    lintGutter(),
    linter((view) => parserDiagnostics(view.state), { delay: 450 }),
  ];

  const editorExtensions = $derived.by<Extension>(() => [
    createCodeEditorLanguageExtension(language),
    syntaxDiagnostics ? syntaxDiagnosticsExtension : [],
    extensions,
  ]);
</script>

<div
  class="cvstudio-code-editor"
  data-ui-component="code-editor"
  data-ui-part="code-editor"
>
  <MiraCodeEditor
    bind:value
    extensions={editorExtensions}
    {placeholder}
    {minHeight}
    {ariaLabel}
    variant="code"
    surface="framed"
    height="content"
    onChange={(nextValue) => onChange?.(nextValue)}
  />
</div>
