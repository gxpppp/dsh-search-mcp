import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');

test('package exports resolve and RC7 dependencies stay pinned', async () => {
  const pkg = JSON.parse(await read('package.json'));
  assert.equal(pkg.exports['.'], './lib/index.js');
  assert.equal(pkg.exports['./client'], './lib/client.browser.js');
  assert.equal(pkg.engines.node, '>=20');

  for (const name of [
    '@deepseek-ai/dsh-credentials',
    '@deepseek-ai/dsh-launch-environment',
    '@deepseek-ai/dsh-settings',
    '@deepseek-ai/dsh-web',
  ]) {
    assert.equal(pkg.dependencies[name], '0.1.0-rc.7');
  }
});

test('RC7 browser bundle uses keyed settings slot and credential migration', async () => {
  const client = await read('lib/client.browser.js');
  assert.match(client, /name: "settings\.plugin\.item",\s+key: NS,/);
  assert.doesNotMatch(client, /name: "settings\.plugin\.item",\s+id:/);
  assert.match(client, /api\.settings\.describe\(\{\}\)/);
  assert.match(client, /api\.credentials\.set\(\{ ref, value:/);
  assert.match(client, /legacyKeyBlocked/);
  assert.match(client, /deepEqualJson\(current\[field\], value\)/);
});

test('bundle completely replaces built-in search and preserves tool-web fields', async () => {
  const patch = await read('cordis.patch.yml');
  assert.match(patch, /searchProvider: search-mcp/);
  assert.match(patch, /- id: web-search-deepseek\s+disabled: true/);
  assert.match(patch, /- id: tool-web\s+disabled: false/);
  assert.match(patch, /fetch: false/);
  assert.match(patch, /searchMaxResults: 50/);
});
