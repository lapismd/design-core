<script lang="ts">
  import { java } from "@codemirror/lang-java";
  import { javascript } from "@codemirror/lang-javascript";
  import { python } from "@codemirror/lang-python";
  import {
    HighlightStyle,
    StreamLanguage,
    syntaxHighlighting,
  } from "@codemirror/language";
  import { kotlin } from "@codemirror/legacy-modes/mode/clike";
  import { linter, lintGutter } from "@codemirror/lint";
  import { Compartment, type Extension } from "@codemirror/state";
  import {
    EditorView,
    placeholder as placeholderExtension,
  } from "@codemirror/view";
  import { tags } from "@lezer/highlight";
  import { basicSetup } from "codemirror";
  import { mermaid } from "codemirror-lang-mermaid";
  import { onMount } from "svelte";

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

  let host: HTMLDivElement;
  let editor: EditorView | null = null;
  const languageCompartment = new Compartment();
  const themeCompartment = new Compartment();
  const placeholderCompartment = new Compartment();
  const diagnosticsCompartment = new Compartment();
  const extensionsCompartment = new Compartment();
  const ariaLabelCompartment = new Compartment();

  const syntaxDiagnosticsExtension = [
    lintGutter(),
    linter((view) => parserDiagnostics(view.state), { delay: 450 }),
  ];

  function normalizedLanguage(value: string) {
    return value.trim().toLowerCase();
  }

  function languageExtension(): Extension {
    const lang = normalizedLanguage(language);
    if (lang === "mermaid") return mermaid();
    if (["js", "javascript", "mjs", "cjs"].includes(lang)) return javascript();
    if (["jsx"].includes(lang)) return javascript({ jsx: true });
    if (["ts", "typescript"].includes(lang))
      return javascript({ typescript: true });
    if (["tsx"].includes(lang))
      return javascript({ jsx: true, typescript: true });
    if (["python", "py"].includes(lang)) return python();
    if (["java"].includes(lang)) return java();
    if (["kotlin", "kt", "kts"].includes(lang))
      return StreamLanguage.define(kotlin);
    return [];
  }

  function editorTheme() {
    return [
      EditorView.theme({
        "&": {
          minHeight,
          color: "var(--ui-form-foreground)",
          backgroundColor:
            "var(--ui-form-code-background)",
        },
        "&.cm-focused": {
          outline: "0",
        },
        ".cm-scroller": {
          minHeight,
          fontFamily:
            "var(--studio-font-mono, var(--font-mono, 'Source Code Pro Variable', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace))",
          backgroundColor: "transparent",
        },
        ".cm-content": {
          minHeight,
          fontSize: "0.82rem",
          lineHeight: "1.55",
          padding: "0.7rem 0.8rem",
        },
        ".cm-line": {
          paddingInline: "0",
        },
        ".cm-gutters": {
          color:
            "var(--ui-form-muted)",
          backgroundColor:
            "var(--ui-form-code-gutter)",
          borderRightColor:
            "var(--ui-form-border)",
        },
        ".cm-activeLine, .cm-activeLineGutter": {
          backgroundColor:
            "var(--ui-form-active-line)",
        },
        ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
          backgroundColor:
            "var(--ui-form-selection-strong)",
        },
        ".cm-cursor": {
          borderLeftColor: "var(--ui-form-foreground)",
        },
        ".cm-placeholder": {
          color:
            "var(--ui-form-muted)",
        },
        ".cm-tooltip, .cm-tooltip *": {
          fontFamily:
            "var(--studio-font-mono, var(--font-mono, 'Source Code Pro Variable', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace))",
        },
        ".cm-tooltip": {
          border:
            "1px solid var(--ui-form-border)",
          borderRadius: "calc(var(--radius, 0.625rem) - 0.125rem)",
          backgroundColor:
            "var(--ui-form-popover)",
          color:
            "var(--ui-form-foreground)",
          boxShadow:
            "0 12px 24px color-mix(in srgb, var(--foreground) 16%, transparent)",
          fontSize: "0.75rem",
          lineHeight: "1.45",
          overflow: "hidden",
        },
        ".cm-tooltip-autocomplete > ul": {
          backgroundColor: "transparent",
          color:
            "var(--ui-form-foreground)",
          fontSize: "0.75rem",
          lineHeight: "1.4",
        },
        ".cm-tooltip-autocomplete > ul > li": {
          padding: "0.25rem 0.45rem",
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
          backgroundColor:
            "var(--ui-form-active-line)",
          color:
            "var(--ui-form-foreground)",
        },
        ".cm-completionDetail": {
          color:
            "var(--ui-form-muted)",
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail":
          {
            color: "inherit",
          },
        ".cm-completionMatchedText": {
          color: "var(--ui-form-accent)",
          fontWeight: "700",
        },
        ".cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionMatchedText":
          {
            color: "inherit",
          },
      }),
      syntaxHighlighting(
        HighlightStyle.define([
          {
            tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword],
            color: "var(--cv-code-keyword, #5b21b6)",
            fontWeight: "600",
          },
          {
            tag: [tags.atom, tags.bool, tags.number],
            color: "var(--cv-code-constant, #0f766e)",
          },
          {
            tag: [tags.string, tags.special(tags.string)],
            color: "var(--cv-code-string, #92400e)",
          },
          {
            tag: [
              tags.function(tags.variableName),
              tags.function(tags.propertyName),
            ],
            color: "var(--cv-code-function, #075985)",
          },
          {
            tag: [tags.className, tags.typeName],
            color: "var(--cv-code-type, #6b21a8)",
          },
          {
            tag: [tags.propertyName, tags.attributeName],
            color: "var(--cv-code-property, #1d4ed8)",
          },
          {
            tag: tags.comment,
            color:
              "var(--ui-form-muted)",
            fontStyle: "italic",
          },
          {
            tag: tags.invalid,
            color: "var(--destructive, #dc2626)",
          },
        ]),
      ),
    ];
  }

  onMount(() => {
    editor = new EditorView({
      doc: value,
      parent: host,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        languageCompartment.of(languageExtension()),
        placeholderCompartment.of(placeholderExtension(placeholder)),
        diagnosticsCompartment.of(
          syntaxDiagnostics ? syntaxDiagnosticsExtension : [],
        ),
        extensionsCompartment.of(extensions),
        themeCompartment.of(editorTheme()),
        ariaLabelCompartment.of(
          EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
        ),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          value = update.state.doc.toString();
          onChange?.(value);
        }),
      ],
    });
    editor.dom
      .querySelector(".cm-gutters")
      ?.setAttribute("aria-hidden", "true");

    return () => editor?.destroy();
  });

  $effect(() => {
    if (!editor) return;
    const current = editor.state.doc.toString();
    if (value !== current) {
      editor.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: extensionsCompartment.reconfigure(extensions),
    });
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: diagnosticsCompartment.reconfigure(
        syntaxDiagnostics ? syntaxDiagnosticsExtension : [],
      ),
    });
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: languageCompartment.reconfigure(languageExtension()),
    });
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: placeholderCompartment.reconfigure(
        placeholderExtension(placeholder),
      ),
    });
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: themeCompartment.reconfigure(editorTheme()),
    });
  });

  $effect(() => {
    if (!editor) return;
    editor.dispatch({
      effects: ariaLabelCompartment.reconfigure(
        EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      ),
    });
  });
</script>

<div bind:this={host} class="cvstudio-code-editor" aria-label={ariaLabel}></div>

<style>
  .cvstudio-code-editor {
    min-width: 0;
    margin: 2px;
    overflow: hidden;
    border: 1px solid var(--ui-form-border);
    border-radius: 0.4rem;
    background: var(--ui-form-code-background);
  }

  :global(.cvstudio-code-editor .cm-editor) {
    height: auto;
  }
</style>
