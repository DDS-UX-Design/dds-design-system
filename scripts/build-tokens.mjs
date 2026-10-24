import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const fileKey = 'u0lpCPrGMj68e9RMIRuYxL';
export const collectionNames = ['Colour Primitives', 'Semantic Colours', 'Spacing', 'Radius'];
const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export function compile(snapshot) {
  if (snapshot.schemaVersion !== 1 || snapshot.fileKey !== fileKey)
    throw Error('Invalid DDS snapshot version or file key');
  const collections = new Map();
  const names = new Set();
  for (const c of snapshot.collections) {
    if (collections.has(c.id) || names.has(c.name)) throw Error('Duplicate collection');
    collections.set(c.id, c);
    names.add(c.name);
  }
  for (const name of collectionNames)
    if (!names.has(name)) throw Error(`Missing collection: ${name}`);
  const variables = new Map();
  const cssNames = new Set();
  const nameById = new Map();
  for (const v of snapshot.variables) {
    const c = collections.get(v.variableCollectionId);
    if (!c || !collectionNames.includes(c.name) || variables.has(v.id))
      throw Error(`Invalid variable: ${v.name}`);
    if (
      v.resolvedType !==
      (['Colour Primitives', 'Semantic Colours'].includes(c.name) ? 'COLOR' : 'FLOAT')
    )
      throw Error(`Unexpected token type: ${v.name}`);
    if (!Object.keys(v.valuesByMode).length) throw Error(`No values: ${v.name}`);
    let css;
    if (c.name === 'Semantic Colours') {
      const match = /^var\((--[a-z0-9-]+)\)$/.exec(v.codeSyntax?.WEB ?? '');
      if (!match) throw Error(`Missing or invalid CSS syntax: ${v.name}`);
      css = match[1];
    } else if (c.name === 'Colour Primitives') css = `--dds-primitive-${slug(v.name)}`;
    else css = `--${slug(v.name.replace(/^raduis-/, 'radius-'))}`;
    if (cssNames.has(css)) throw Error(`Duplicate CSS name: ${css}`);
    cssNames.add(css);
    nameById.set(v.id, css);
    variables.set(v.id, v);
  }
  const semantic = [...collections.values()].find((c) => c.name === 'Semantic Colours');
  for (const mode of ['Light', 'Dark'])
    if (!semantic.modes.some((m) => m.name === mode)) throw Error(`Missing ${mode} mode`);
  function value(v, theme) {
    const c = collections.get(v.variableCollectionId);
    const mode =
      c.name === 'Semantic Colours'
        ? c.modes.find((m) => m.name === theme)?.modeId
        : c.defaultModeId;
    if (mode === undefined || !(mode in v.valuesByMode))
      throw Error(`Missing ${theme} value: ${v.name}`);
    return v.valuesByMode[mode];
  }
  function resolve(v, theme, seen = new Set()) {
    if (seen.has(v.id)) throw Error(`Alias cycle: ${v.name}`);
    const next = new Set(seen).add(v.id);
    function raw(x) {
      if (x?.type === 'VARIABLE_ALIAS') {
        const target = variables.get(x.id);
        if (!target || target.resolvedType !== v.resolvedType)
          throw Error(`Missing or wrong-type alias: ${v.name}`);
        return resolve(target, theme, next);
      }
      if (x?.color) {
        const color = raw(x.color);
        if (typeof x.opacity !== 'number' || x.opacity < 0 || x.opacity > 100)
          throw Error(`Invalid composed opacity: ${v.name}`);
        return { ...color, a: ((color.a ?? 1) * x.opacity) / 100 };
      }
      if (v.resolvedType === 'COLOR') {
        if (
          !x ||
          !['r', 'g', 'b'].every((k) => Number.isFinite(x[k]) && x[k] >= 0 && x[k] <= 1) ||
          (x.a !== undefined && (!Number.isFinite(x.a) || x.a < 0 || x.a > 1))
        )
          throw Error(`Invalid color: ${v.name}`);
        return { ...x, a: x.a ?? 1 };
      }
      if (v.resolvedType !== 'FLOAT' || !Number.isFinite(x) || x < 0)
        throw Error(`Invalid dimension: ${v.name}`);
      return x;
    }
    return raw(value(v, theme));
  }
  const list = [...variables.values()].sort((a, b) =>
    nameById.get(a.id).localeCompare(nameById.get(b.id), 'en'),
  );
  const format = (x) =>
    typeof x === 'number'
      ? `${x}px`
      : `rgb(${['r', 'g', 'b'].map((k) => Math.round(x[k] * 255)).join(' ')} / ${Number(x.a.toFixed(6))})`;
  function declaration(v, theme) {
    const resolved = resolve(v, theme); // Validate even when retaining the reference.
    const x = value(v, theme);
    if (x?.type === 'VARIABLE_ALIAS') return `var(${nameById.get(x.id)})`;
    return format(resolved);
  }
  const base = list.filter((v) => v.variableCollectionId !== semantic.id);
  const themed = list.filter((v) => v.variableCollectionId === semantic.id);
  let css = '/* Generated from tokens/figma.snapshot.json. Do not edit. */\n';
  css += `:root {\n${base.map((v) => `  ${nameById.get(v.id)}: ${declaration(v, 'Light')};`).join('\n')}\n}\n`;
  for (const theme of ['Light', 'Dark'])
    css += `\n${theme === 'Light' ? ':root,\n' : ''}[data-theme="${theme.toLowerCase()}"] {\n${themed.map((v) => `  ${nameById.get(v.id)}: ${declaration(v, theme)};`).join('\n')}\n}\n`;
  const manifest = {
    source: { fileKey, schemaVersion: 1 },
    tokens: list.map((v) => ({
      name: v.name,
      css: nameById.get(v.id),
      collection: collections.get(v.variableCollectionId).name,
      type: v.resolvedType,
      description: v.description ?? '',
      light: resolve(v, 'Light'),
      dark: resolve(v, 'Dark'),
    })),
  };
  return { css, manifest };
}
export async function build(root, check = false) {
  const source = JSON.parse(await readFile(path.join(root, 'tokens/figma.snapshot.json'), 'utf8'));
  const { css, manifest } = compile(source);
  const outputs = {
    'src/tokens/generated/figma.tokens.css': css,
    'src/tokens/generated/figma.tokens.json': JSON.stringify(manifest, null, 2) + '\n',
  };
  for (const [name, content] of Object.entries(outputs)) {
    if (check) {
      if ((await readFile(path.join(root, name), 'utf8').catch(() => null)) !== content)
        throw Error(`Generated tokens stale: ${name}. Run npm run tokens:build`);
    } else {
      await mkdir(path.dirname(path.join(root, name)), { recursive: true });
      await writeFile(path.join(root, name), content);
    }
  }
  return manifest.tokens.length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(
      `Validated ${await build(path.resolve(fileURLToPath(new URL('..', import.meta.url))), process.argv.includes('--check'))} DDS tokens`,
    );
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}
