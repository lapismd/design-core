import { EXIT, GeneratorError } from "../errors.js";

export function upstreamDocsUrl(component: string): string {
  return `https://shadcn-svelte.com/docs/components/${component}.md`;
}

/**
 * Fetch the published LLM markdown for a shadcn-svelte component page.
 */
export async function fetchUpstreamDocsMarkdown(
  component: string,
  options: { fetchImpl?: typeof fetch } = {},
): Promise<{ url: string; markdown: string }> {
  const url = upstreamDocsUrl(component);
  const fetchImpl = options.fetchImpl ?? fetch;
  let response: Response;
  try {
    response = await fetchImpl(url, {
      headers: { Accept: "text/markdown, text/plain;q=0.9, */*;q=0.8" },
    });
  } catch (error) {
    throw new GeneratorError(
      `Failed to fetch upstream docs for ${component}`,
      EXIT.intake,
      error instanceof Error ? error.message : String(error),
    );
  }
  if (response.status === 404) {
    throw new GeneratorError(
      `Upstream docs not found for ${component}`,
      EXIT.intake,
      url,
    );
  }
  if (!response.ok) {
    throw new GeneratorError(
      `Upstream docs fetch failed for ${component} (${response.status})`,
      EXIT.intake,
      url,
    );
  }
  const markdown = await response.text();
  if (!markdown.trim().startsWith("#")) {
    throw new GeneratorError(
      `Upstream docs for ${component} did not look like markdown`,
      EXIT.intake,
      url,
    );
  }
  return { url, markdown };
}
