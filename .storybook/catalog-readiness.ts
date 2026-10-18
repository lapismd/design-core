import type { Plugin } from "vite";

export const CATALOG_READINESS_PATH = "/__lapis_catalog_ready";
const CLIENT_ENTRIES = [
  "/.storybook/preview.ts",
  "/src/storybook.css",
  "/src/shared/shadcn/dialog/index.ts",
  "/src/shared/shadcn/button/button.svelte",
  "/src/shared/workspace/plugins/notifications/NotificationToasts.svelte",
  "/src/shared/workspace/app-shell/index.ts",
];

/** Probe the client compiler, not just the already-generated story index. */
export function catalogReadinessPlugin(): Plugin {
  return {
    name: "lapis-catalog-client-readiness",
    apply: "serve",
    configureServer(server) {
      let preparation: Promise<void> | undefined;
      server.middlewares.use(
        CATALOG_READINESS_PATH,
        async (_request, response) => {
          try {
            preparation ??= (async () => {
              for (const entry of CLIENT_ENTRIES) {
                server.config.logger.info(`[catalog-ready] compiling ${entry}`);
                if (!(await server.transformRequest(entry))) {
                  throw new Error(
                    `Catalog client entry could not be compiled: ${entry}`,
                  );
                }
              }
              server.config.logger.info(
                "[catalog-ready] settling static imports",
              );
              await server.waitForRequestsIdle();
            })();
            await preparation;
            response.statusCode = 200;
            response.end("Catalog client ready");
          } catch (error) {
            preparation = undefined;
            server.config.logger.error(String(error));
            response.statusCode = 503;
            response.end("Catalog client preparation failed");
          }
        },
      );
    },
  };
}
