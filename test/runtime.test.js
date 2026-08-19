import test from 'node:test';
import assert from 'node:assert/strict';
import { SEARCH_MCP_CATALOG, resolveServer } from '../lib/catalog.js';
import { extractSearchResult } from '../lib/extract.js';

test('catalog exposes every supported provider preset', () => {
  assert.deepEqual(Object.keys(SEARCH_MCP_CATALOG), [
    'tavily',
    'brave',
    'exa',
    'perplexity',
    'duckduckgo',
    'custom',
  ]);
});

test('resolveServer fills preset defaults without overriding explicit values', () => {
  const tavily = resolveServer({ id: 'primary', kind: 'tavily' });
  assert.equal(tavily.transport, 'http');
  assert.equal(tavily.toolName, 'tavily_search');
  assert.equal(tavily.countArg, 'max_results');
  assert.equal(tavily.needsKey, true);

  const custom = resolveServer({
    id: 'custom',
    kind: 'tavily',
    url: 'https://example.test/mcp',
    toolName: 'search',
  });
  assert.equal(custom.url, 'https://example.test/mcp');
  assert.equal(custom.toolName, 'search');
});

test('extractSearchResult normalizes, deduplicates, and rejects invalid URLs', () => {
  const result = extractSearchResult({
    structuredContent: {
      answer: 'Summary',
      results: [
        { url: 'https://example.com/a', title: 'A', content: 'alpha', published_date: '2026-08-18' },
        { url: 'https://example.com/a', title: 'Duplicate' },
        { url: 'ftp://example.com/ignored', title: 'Ignored' },
      ],
      nested: { url: 'http://example.com/b', description: 'beta' },
    },
  });

  assert.deepEqual(result, {
    sources: [
      {
        url: 'https://example.com/a',
        title: 'A',
        snippet: 'alpha',
        publishedAt: '2026-08-18',
      },
      { url: 'http://example.com/b', snippet: 'beta' },
    ],
    truncated: false,
    content: 'Summary',
  });
});

test('extractSearchResult accepts JSON and plain text MCP blocks', () => {
  const json = extractSearchResult({
    content: [{ type: 'text', text: '{"results":[{"url":"https://example.com"}]}' }],
  });
  assert.equal(json.sources.length, 1);

  const text = extractSearchResult({ content: [{ type: 'text', text: 'Direct answer' }] });
  assert.deepEqual(text, { sources: [], truncated: false, content: 'Direct answer' });
});
