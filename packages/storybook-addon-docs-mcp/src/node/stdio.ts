import type { StorybookContext } from "@storybook/mcp";
import { StdioTransport } from "@tmcp/transport-stdio";
import { createDocsMcpServer } from "../mcp-server.js";
import { createDocsService } from "../service.js";
import type { DocsMcpConfig } from "../types.js";

export async function startDocsMcpStdio(options: {
  root: string;
  config: DocsMcpConfig;
  noCache?: boolean;
}): Promise<void> {
  const service = createDocsService({
    root: options.root,
    config: options.config,
    noCache: options.noCache,
  });
  const server = await createDocsMcpServer(service);
  const transport = new StdioTransport<StorybookContext>(server);
  transport.listen({ manifestProvider: service.manifestProvider });
}
