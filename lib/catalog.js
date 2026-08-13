/**
 * Known search-MCP server presets.
 *
 * Each preset supplies the defaults a server entry inherits when the user
 * leaves a field empty in Settings → Plugins → search-mcp:
 *   - transport: how to connect ("http" streamable-http, "stdio" child process)
 *   - url / command+args: the hosted endpoint or the stdio launcher
 *   - authStyle + authParam: where the API key goes (query parameter or
 *     header for http; for stdio the param name doubles as the env var name)
 *   - toolName: the MCP tool that performs a web search
 *   - countArg: the tool argument controlling how many results are returned
 *   - needsKey: whether a search without a key can succeed
 */
export const SEARCH_MCP_CATALOG = {
  tavily: {
    transport: 'http',
    url: 'https://mcp.tavily.com/mcp/',
    authStyle: 'query',
    authParam: 'tavilyApiKey',
    toolName: 'tavily_search',
    countArg: 'max_results',
    needsKey: true,
  },
  brave: {
    transport: 'http',
    url: 'https://mcp.brave.com/mcp/',
    authStyle: 'query',
    authParam: 'braveApiKey',
    toolName: 'brave_web_search',
    countArg: 'count',
    needsKey: true,
  },
  exa: {
    transport: 'http',
    url: 'https://mcp.exa.ai/mcp',
    authStyle: 'header',
    authParam: 'x-api-key',
    toolName: 'web_search_exa',
    countArg: 'numResults',
    needsKey: true,
  },
  perplexity: {
    transport: 'http',
    url: 'https://mcp.perplexity.ai/mcp/',
    authStyle: 'query',
    authParam: 'pplx_api_key',
    toolName: 'pplx_search',
    countArg: 'max_results',
    needsKey: true,
  },
  duckduckgo: {
    transport: 'stdio',
    command: 'npx',
    args: ['-y', 'duckduckgo-mcp-server'],
    toolName: 'ddg_web_search',
    countArg: '',
    needsKey: false,
  },
  custom: {
    transport: 'http',
    url: '',
    authStyle: 'query',
    authParam: '',
    toolName: '',
    countArg: '',
    needsKey: false,
  },
};

/** The kind ids a user may select in the settings form. */
export const KNOWN_KINDS = Object.keys(SEARCH_MCP_CATALOG);

/**
 * Resolve one configured server entry against its kind's preset defaults.
 *
 * @param server - a raw `servers[]` entry from config/settings.
 * @returns the entry with every runtime-relevant field defaulted.
 */
export function resolveServer(server) {
  const preset = SEARCH_MCP_CATALOG[server.kind] ?? SEARCH_MCP_CATALOG.custom;
  const args = server.args && server.args.length > 0 ? server.args : preset.args ?? [];
  return {
    ...server,
    transport: server.transport || preset.transport || 'http',
    url: server.url || preset.url || '',
    command: server.command || preset.command || '',
    args,
    authStyle: server.authStyle || preset.authStyle || 'query',
    authParam: server.authParam || preset.authParam || '',
    toolName: server.toolName || preset.toolName || '',
    countArg: preset.countArg || '',
    needsKey: preset.needsKey ?? false,
  };
}
