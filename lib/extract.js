/**
 * Generic normalization of an MCP `tools/call` result into the
 * `web_search` provider shape `{ sources, truncated, content? }`.
 *
 * Different search MCP servers return wildly different payloads (Tavily
 * `results[]`, Brave `web.results[]`, Exa `results[]`, Perplexity text +
 * citations, DuckDuckGo `results[]`...). Instead of mapping each vendor, we
 * recursively walk the returned JSON and collect every object that carries a
 * string `url` as a source, taking title / snippet / date from the common
 * field names. A top-level `answer` (or non-JSON text blocks) becomes the
 * `content` answer.
 */

const TITLE_KEYS = ['title', 'name', 'headline'];
const SNIPPET_KEYS = ['snippet', 'content', 'description', 'text', 'excerpt', 'summary'];
const DATE_KEYS = [
  'published_date',
  'publishedDate',
  'published_at',
  'publish_date',
  'publishedAt',
  'page_age',
  'age',
  'date',
];

/** Cap a snippet so a single source cannot blow up the context window. */
const MAX_SNIPPET_CHARS = 600;
/** Cap the answer text block. */
const MAX_CONTENT_CHARS = 4000;

/**
 * Project one MCP `tools/call` result into `{ sources, truncated, content? }`.
 *
 * @param result - the raw `CallToolResult` from the MCP SDK.
 * @returns the normalized provider result; `truncated` is always false
 *   because the `ctx.web` seam owns the final `maxResults` cap.
 */
export function extractSearchResult(result) {
  const bucket = {
    sources: [],
    seen: new Set(),
    content: '',
  };
  if (result !== null && typeof result === 'object') {
    if (result.structuredContent !== undefined) collect(result.structuredContent, bucket);
    const blocks = Array.isArray(result.content) ? result.content : [];
    for (const block of blocks) {
      if (block === null || typeof block !== 'object') continue;
      if (block.type === 'json' && block.json !== undefined) {
        collect(block.json, bucket);
      } else if (block.type === 'text' && typeof block.text === 'string') {
        const parsed = tryParseJson(block.text);
        if (parsed !== undefined) collect(parsed, bucket);
        else if (bucket.content.length === 0 && block.text.trim().length > 0) {
          bucket.content = block.text.trim().slice(0, MAX_CONTENT_CHARS);
        }
      }
    }
  }
  return {
    sources: bucket.sources,
    truncated: false,
    ...(bucket.content.length > 0 ? { content: bucket.content } : {}),
  };
}

/** Depth-first walk collecting source objects and the `answer` field. */
function collect(node, bucket) {
  if (Array.isArray(node)) {
    for (const item of node) collect(item, bucket);
    return;
  }
  if (node === null || typeof node !== 'object') return;
  if (typeof node.url === 'string' && /^https?:\/\//i.test(node.url)) {
    if (!bucket.seen.has(node.url)) {
      bucket.seen.add(node.url);
      const title = firstOf(node, TITLE_KEYS);
      const snippet = truncate(firstOf(node, SNIPPET_KEYS), MAX_SNIPPET_CHARS);
      const publishedAt = firstOf(node, DATE_KEYS);
      bucket.sources.push({
        url: node.url,
        ...(title !== undefined ? { title } : {}),
        ...(snippet !== undefined ? { snippet } : {}),
        ...(publishedAt !== undefined ? { publishedAt } : {}),
      });
    }
    return;
  }
  if (bucket.content.length === 0 && typeof node.answer === 'string' && node.answer.trim().length > 0) {
    bucket.content = node.answer.trim().slice(0, MAX_CONTENT_CHARS);
  }
  for (const value of Object.values(node)) collect(value, bucket);
}

/** First non-empty string among the candidate keys, else undefined. */
function firstOf(node, keys) {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

function truncate(value, max) {
  if (value === undefined) return undefined;
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Parse a JSON text block; returns undefined when it is not JSON. */
function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
