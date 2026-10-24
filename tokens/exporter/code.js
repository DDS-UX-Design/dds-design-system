// Run as a local development plugin in the DDS file. Reads variables only.
(async () => {
  try {
    const fileKey = 'u0lpCPrGMj68e9RMIRuYxL';
    if (figma.fileKey && figma.fileKey !== fileKey)
      throw Error('Open the DDS design system file before exporting');
    const names = ['Colour Primitives', 'Semantic Colours', 'Spacing', 'Radius'];
    const collections = (await figma.variables.getLocalVariableCollectionsAsync()).filter((c) =>
      names.includes(c.name),
    );
    const variables = (await figma.variables.getLocalVariablesAsync()).filter((v) =>
      collections.some((c) => c.id === v.variableCollectionId),
    );
    const snapshot = {
      schemaVersion: 1,
      fileKey,
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        defaultModeId: c.defaultModeId,
        modes: c.modes,
      })),
      variables: variables.map((v) => ({
        id: v.id,
        name: v.name,
        variableCollectionId: v.variableCollectionId,
        resolvedType: v.resolvedType,
        valuesByMode: v.valuesByMode,
        description: v.description,
        codeSyntax: v.codeSyntax,
      })),
    };
    figma.showUI(
      '<button id="save">Download DDS token snapshot</button><p>Review the export in Git before releasing.</p><script>onmessage=e=>{const data=e.data.pluginMessage;document.getElementById("save").onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="dds-figma-export.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};};</script>',
      { width: 360, height: 120 },
    );
    figma.ui.postMessage(snapshot);
  } catch (e) {
    figma.closePlugin(e.message);
  }
})();
