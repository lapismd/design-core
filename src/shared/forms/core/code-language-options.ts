export type SearchableChoiceOption = {
  value: string;
  label: string;
  keywords?: string[];
};

export function normalizeCodeLanguage(value: string) {
  return value.trim().toLowerCase();
}

export const CODE_LANGUAGE_OPTIONS: SearchableChoiceOption[] = [
  { value: "ts", label: "TypeScript", keywords: ["typescript"] },
  { value: "js", label: "JavaScript", keywords: ["javascript"] },
  { value: "tsx", label: "TSX", keywords: ["typescript react"] },
  { value: "jsx", label: "JSX", keywords: ["javascript react"] },
  { value: "mermaid", label: "Mermaid", keywords: ["diagram", "flowchart"] },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML", keywords: ["yml"] },
  { value: "bash", label: "Bash", keywords: ["shell", "sh"] },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python", keywords: ["py"] },
  { value: "rust", label: "Rust", keywords: ["rs"] },
  { value: "go", label: "Go", keywords: ["golang"] },
  { value: "markdown", label: "Markdown", keywords: ["md"] },
  { value: "text", label: "Plain Text", keywords: ["plaintext", "txt"] },
];
