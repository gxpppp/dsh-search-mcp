/**
 * MCP transport layer for one search.
 *
 * A fresh `Client` + transport is created per search (the SDK keeps no
 * state we need across calls) and always closed in a `finally`. The caller's
 * abort signal (plus the configured timeout) races every protocol step.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { WebError } from '@deepseek-ai/dsh-web';

/**
 * Run one search through a resolved server entry.
 *
 * @param server - a server entry fully defaulted by {@link resolveServer}.
 * @param key - the resolved API key (may be undefined for keyless servers).
 * @param args - `{ query, maxResults }` model-facing search arguments.
 * @param signal - combined caller/timeout abort signal.
 * @returns the raw MCP `CallToolResult`.
 */
export async function callMcpSearch(server, key, args, signal) {
  if (!server.toolName) {
    throw new WebError(
      `search-mcp server "${server.id}": no MCP tool name (set "toolName" or pick a known kind)`,
      'WEB_PROVIDER_ERROR',
    );
  }
  const transport =
    server.transport === 'stdio' ? stdioTransport(server, key) : httpTransport(server, key, signal);
  const client = new Client({ name: 'dsh-search-mcp', version: '0.1.0' }, { capabilities: {} });
  try {
    await race(client.connect(transport), signal, `connect to "${server.id}"`);
    const callArgs = { query: args.query };
    if (server.countArg.length > 0 && args.maxResults !== undefined) {
      callArgs[server.countArg] = args.maxResults;
    }
    const result = await race(
      client.callTool({ name: server.toolName, arguments: callArgs }),
      signal,
      `call "${server.id}" tool "${server.toolName}"`,
    );
    if (result.isError) {
      throw new WebError(
        `search-mcp: MCP server "${server.id}" tool "${server.toolName}" reported an error`,
        'WEB_PROVIDER_ERROR',
      );
    }
    return result;
  } catch (error) {
    if (error instanceof WebError) throw error;
    throw new WebError(`search-mcp: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error });
  } finally {
    try {
      await client.close();
    } catch {
      /* the connection is already gone; nothing to recover */
    }
  }
}

/** Build a streamable-http transport, injecting the key per auth style. */
function httpTransport(server, key, signal) {
  const url = new URL(server.url);
  const headers = {};
  if (key !== undefined && key.length > 0 && server.authParam.length > 0) {
    if (server.authStyle === 'query') url.searchParams.set(server.authParam, key);
    else if (server.authStyle === 'header') headers[server.authParam] = key;
  }
  return new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers,
      ...(signal !== undefined ? { signal } : {}),
    },
  });
}

/** Build a stdio transport; the authParam name doubles as the env var name. */
function stdioTransport(server, key) {
  const env = { ...process.env };
  if (key !== undefined && key.length > 0 && server.authParam.length > 0) {
    env[server.authParam] = key;
  }
  return new StdioClientTransport({
    command: server.command,
    args: server.args ?? [],
    env,
  });
}

/**
 * Race `promise` against an abort signal; a settled abort wins with a
 * `WEB_ABORTED` error. Without a signal the promise passes through.
 */
function race(promise, signal, stage) {
  if (signal === undefined) return promise;
  if (signal.aborted) throw aborted(stage);
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(aborted(stage));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

function aborted(stage) {
  return new WebError(`search-mcp: aborted while trying to ${stage}`, 'WEB_ABORTED');
}
