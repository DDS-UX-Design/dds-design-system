import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compile } from './build-tokens.mjs';
const source = JSON.parse(
  await readFile(new URL('../tokens/figma.snapshot.json', import.meta.url), 'utf8'),
);
const copy = () => structuredClone(source);
const semantic = (s) => s.variables.find((v) => v.name === 'color/bg/default');
test('current source generates both themes, semantic references and dimensions deterministically', () => {
  const out = compile(source);
  assert.equal(out.manifest.tokens.length, source.variables.length);
  assert.equal(out.css, compile(source).css);
  assert.match(out.css, /\[data-theme="dark"\]/);
  assert.match(out.css, /--color-bg-default: var\(--dds-primitive-/);
  assert.match(out.css, /--space-2: 8px/);
  assert.ok(out.manifest.tokens.find((v) => v.name === 'color/border/focus').light.a === 0.5);
});
test('broken alias, cycles, missing modes, wrong types and invalid syntax fail', () => {
  for (const mutate of [
    (s) => {
      semantic(s).valuesByMode['1888:0'] = { type: 'VARIABLE_ALIAS', id: 'missing' };
    },
    (s) => {
      semantic(s).valuesByMode['1888:0'] = { type: 'VARIABLE_ALIAS', id: semantic(s).id };
    },
    (s) => {
      delete semantic(s).valuesByMode['1888:1'];
    },
    (s) => {
      semantic(s).codeSyntax.WEB = '--bad';
    },
    (s) => {
      semantic(s).valuesByMode['1888:0'] = { r: 2, g: 0, b: 0 };
    },
    (s) => {
      semantic(s).valuesByMode['1888:0'] = {
        type: 'VARIABLE_ALIAS',
        id: s.variables.find((v) => v.name === 'space-2').id,
      };
    },
  ]) {
    const s = copy();
    mutate(s);
    assert.throws(() => compile(s));
  }
});
test('a source change reaches generated output and reverting restores it', () => {
  const s = copy(),
    before = compile(s).css;
  const primitive = s.variables.find((v) => v.name === 'Common/White');
  const mode = Object.keys(primitive.valuesByMode)[0];
  const old = primitive.valuesByMode[mode];
  primitive.valuesByMode[mode] = { r: 0.95, g: 0.95, b: 0.95, a: 1 };
  assert.notEqual(compile(s).css, before);
  primitive.valuesByMode[mode] = old;
  assert.equal(compile(s).css, before);
});

test('duplicate CSS names and wrong collection token types fail', () => {
  const duplicate = copy();
  const v = semantic(duplicate);
  duplicate.variables.push({ ...v, id: 'duplicate' });
  assert.throws(() => compile(duplicate), /Duplicate CSS name/);
  const wrong = copy();
  semantic(wrong).resolvedType = 'FLOAT';
  assert.throws(() => compile(wrong), /Unexpected token type/);
});

test('check detects stale output without rewriting it', async () => {
  const { mkdtemp, mkdir, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { build } = await import('./build-tokens.mjs');
  const root = await mkdtemp(join(tmpdir(), 'dds-tokens-'));
  try {
    await mkdir(join(root, 'tokens'));
    await writeFile(join(root, 'tokens/figma.snapshot.json'), JSON.stringify(source));
    await build(root);
    await writeFile(join(root, 'src/tokens/generated/figma.tokens.css'), 'stale');
    await assert.rejects(build(root, true), /stale/);
    assert.equal(
      await readFile(join(root, 'src/tokens/generated/figma.tokens.css'), 'utf8'),
      'stale',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
