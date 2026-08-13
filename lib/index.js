/**
 * dsh-search-mcp — replace dsh's built-in web search with search MCP servers.
 *
 * A Cordis plugin that
 *   - registers a `ctx.web` search provider under the id `search-mcp`, and
 *   - installs a Settings section (`search-mcp`) where the user manages the
 *     search MCP server list (kind, endpoint/command, API key or key env
 *     reference, tool name) plus `defaultServer` / `maxResults` /
 *     `searchTimeoutMs` from the web Settings → Plugins page.
 *
 * The package's `cordis.patch.yml` (bundle layer) switches
 * `web.searchProvider` to `search-mcp` and disables the built-in
 * `web-search-deepseek` provider, so while this plugin is enabled the
 * built-in search is unavailable and every `web_search` call runs through
 * the configured MCP server(s). Removing the package restores the built-in.
 */
import z from '@deepseek-ai/schemastery';
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings';
import { credentialRef } from '@deepseek-ai/dsh-credentials';
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment';
import { SearchMCPProvider, SEARCH_MCP_PROVIDER_ID } from './provider.js';

/** Cordis plugin name used by loader diagnostics. */
export const name = 'search-mcp';

/** The web seam this provider registers into. */
export const inject = ['web'];

const serverSchema = z.object({
  id: z.string(),
  kind: z.string().default('custom'),
  transport: z.string().default('http'),
  url: z.string().default(''),
  command: z.string().default(''),
  args: z.array(z.string()).default([]),
  apiKey: z.string().role('secret').default(''),
  apiKeyEnv: z.string().role('credential-ref').default(''),
  authStyle: z.string().default(''),
  authParam: z.string().default(''),
  toolName: z.string().default(''),
  // Note: this schemastery fork has no `.optional()`; object fields are
  // optional unless `.required()` is applied, so absence is already allowed.
  maxResults: z.number().step(1).min(1).max(50),
});

export const Config = z.object({
  defaultServer: z.string().default(''),
  maxResults: z.number().step(1).min(1).max(50).default(8),
  searchTimeoutMs: z.number().step(1).min(1000).default(30000),
  servers: z.array(serverSchema).default([]),
});

/** Settings namespace owning this plugin's section (Settings → Plugins card). */
export const SEARCH_MCP_SETTINGS_NAMESPACE = settingsNamespace('search-mcp');

/** Register the search provider and the live settings section. */
export function apply(ctx, config) {
  let current = () => config;
  installSettingsSection(ctx, SEARCH_MCP_SETTINGS_NAMESPACE, Config, config, {
    setSource: (source) => {
      current = source;
    },
    onChange: () => {},
  });
  // `registerSearchProvider` owns its cleanup via ctx.effect (HMR/dispose safe).
  ctx.web.registerSearchProvider(new SearchMCPProvider(() => resolveOptions(ctx, current())));
}

/**
 * Project the authoritative config into per-search options. The section
 * returned by `setSource` (settings.yaml `search-mcp:` block) replaces the
 * row config entirely, matching how every other settings section behaves.
 *
 * @param ctx - plugin context supplying the credential and environment planes.
 * @param config - the currently authoritative section.
 * @returns options for one search.
 */
function resolveOptions(ctx, config) {
  return {
    servers: config.servers ?? [],
    defaultServer: config.defaultServer ?? '',
    maxResults: config.maxResults ?? 8,
    searchTimeoutMs: config.searchTimeoutMs ?? 30000,
    resolveKey: async (server) => {
      if (server.apiKey !== undefined && server.apiKey.length > 0) return server.apiKey;
      const envName = server.apiKeyEnv ?? '';
      if (envName.length === 0) return undefined;
      const credentials = ctx.get('credentials');
      if (credentials !== undefined) {
        try {
          const resolved = await credentials.resolve(credentialRef(envName));
          if (resolved !== undefined && resolved.value !== undefined && resolved.value.length > 0) {
            return resolved.value;
          }
        } catch {
          /* fall through to the launch environment */
        }
      }
      const ambient = launchEnvironmentOf(ctx).get(envName);
      return ambient !== undefined && ambient.value.length > 0 ? ambient.value : undefined;
    },
  };
}
