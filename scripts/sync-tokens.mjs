import { readFile, writeFile } from 'node:fs/promises';
import { collectionNames, compile, fileKey } from './build-tokens.mjs';

// Import first, validate completely, then replace the reviewed snapshot.
try {
  const input = process.argv[2];
  let data;
  if (input === '--rest') {
    if (!process.env.FIGMA_ACCESS_TOKEN)
      throw Error('Set FIGMA_ACCESS_TOKEN (file_variables:read); do not commit it');
    const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/variables/local`, {
      headers: { 'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN },
    });
    if (!response.ok)
      throw Error(
        `Figma export failed (${response.status}); check scope/account access, or use the file exporter`,
      );
    const result = await response.json();
    const collections = Object.values(result.meta.variableCollections).filter(
      (c) => !c.remote && collectionNames.includes(c.name),
    );
    data = {
      schemaVersion: 1,
      fileKey,
      collections,
      variables: Object.values(result.meta.variables).filter((v) =>
        collections.some((c) => c.id === v.variableCollectionId),
      ),
    };
  } else {
    if (!input) throw Error('Usage: npm run tokens:sync -- /path/to/figma-export.json (or --rest)');
    data = JSON.parse(await readFile(input, 'utf8'));
  }
  const collections = data.collections
    .map((c) => ({
      id: c.id,
      name: c.name,
      defaultModeId: c.defaultModeId,
      modes: c.modes
        .map((m) => ({ modeId: m.modeId, name: m.name }))
        .sort((a, b) => a.modeId.localeCompare(b.modeId)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const variables = data.variables
    .map((v) => ({
      id: v.id,
      name: v.name,
      variableCollectionId: v.variableCollectionId,
      resolvedType: v.resolvedType,
      valuesByMode: v.valuesByMode,
      description: v.description ?? '',
      codeSyntax: v.codeSyntax ?? {},
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const snapshot = {
    schemaVersion: data.schemaVersion,
    fileKey: data.fileKey,
    collections,
    variables,
  };
  compile(snapshot);
  const previous = JSON.parse(
    await readFile(new URL('../tokens/figma.snapshot.json', import.meta.url), 'utf8'),
  );
  const old = new Map(previous.variables.map((v) => [v.id, v]));
  const current = new Map(variables.map((v) => [v.id, v]));
  const removed = previous.variables.filter((v) => !current.has(v.id)).map((v) => v.name);
  const renamed = variables
    .filter(
      (v) =>
        old.has(v.id) &&
        (old.get(v.id).name !== v.name || old.get(v.id).codeSyntax?.WEB !== v.codeSyntax?.WEB),
    )
    .map((v) => `${old.get(v.id).name} → ${v.name} (name or CSS API changed)`);
  console.log(
    JSON.stringify(
      { added: variables.filter((v) => !old.has(v.id)).map((v) => v.name), removed, renamed },
      null,
      2,
    ),
  );
  if ((removed.length || renamed.length) && !process.argv.includes('--allow-breaking'))
    throw Error('Breaking token change: review migration, then rerun with --allow-breaking');
  await writeFile(
    new URL('../tokens/figma.snapshot.json', import.meta.url),
    JSON.stringify(snapshot, null, 2) + '\n',
  );
  console.log('Snapshot updated. Run npm run tokens:build, review the diff and open a PR.');
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
