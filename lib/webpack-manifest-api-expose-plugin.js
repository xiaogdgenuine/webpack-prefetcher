const MODULE_TYPE = 'css/mini-extract';
const pluginName = 'ManifestAPIExposePlugin';

class ManifestAPIExposePlugin {
  constructor(options = {}) {
    this.options = {
      jsSrc: 'jsonpScriptSrc',
      cssSrc: 'cssSrc',
      ...options
    }
  }

  getCssChunkObject(mainChunk) {
    const obj = {};
    for (const chunk of mainChunk.getAllAsyncChunks()) {
      for (const module of chunk.modulesIterable) {
        if (module.type === MODULE_TYPE) {
          obj[chunk.id] = 1;
          break;
        }
      }
    }
    return obj;
  }

  apply(compiler) {
    const [MiniCssExtractPlugin] = compiler.options.plugins.filter(
      (plugin) => plugin.constructor.name === 'MiniCssExtractPlugin');
    this.options = {...this.options, ...MiniCssExtractPlugin.options}

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const mainTemplate = compilation.mainTemplate
      mainTemplate.hooks.localVars.tap({
        name: pluginName,
        stage: 1,
      }, (source, chunk, hash) => {
        let newSource = source;

        // Expose get js path function
        newSource = newSource.replace("function jsonpScriptSrc", `var jsonpScriptSrc = window.${this.options.jsSrc} = function`);

        // Expose get css path function
        const chunkMap = this.getCssChunkObject(chunk);
        if (Object.keys(chunkMap).length > 0) {
          const chunkMaps = chunk.getChunkMaps();
          const linkHrefPath = mainTemplate.getAssetPath(JSON.stringify(this.options.chunkFilename), {
            hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
            hashWithLength: length => `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
            chunk: {
              id: '" + chunkId + "',
              hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
              hashWithLength(length) {
                const shortChunkHashMap = Object.create(null);
                for (const chunkId of Object.keys(chunkMaps.hash)) {
                  if (typeof chunkMaps.hash[chunkId] === 'string') {
                    shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substring(0, length);
                  }
                }
                return `" + ${JSON.stringify(shortChunkHashMap)}[chunkId] + "`;
              },
              contentHash: {
                [MODULE_TYPE]: `" + ${JSON.stringify(chunkMaps.contentHash[MODULE_TYPE])}[chunkId] + "`
              },
              contentHashWithLength: {
                [MODULE_TYPE]: length => {
                  const shortContentHashMap = {};
                  const contentHash = chunkMaps.contentHash[MODULE_TYPE];
                  for (const chunkId of Object.keys(contentHash)) {
                    if (typeof contentHash[chunkId] === 'string') {
                      shortContentHashMap[chunkId] = contentHash[chunkId].substring(0, length);
                    }
                  }
                  return `" + ${JSON.stringify(shortContentHashMap)}[chunkId] + "`;
                }
              },
              name: `" + (${JSON.stringify(chunkMaps.name)}[chunkId]||chunkId) + "`
            },
            contentHashType: MODULE_TYPE
          });
          newSource += `
// css path function
window.${this.options.cssSrc} = function(chunkId) {
  var href = ${linkHrefPath}
  var fullHref = ${mainTemplate.requireFn}.p + href

  return fullHref
}`;
        }
        return newSource;
      })
    })
  }
}

module.exports = ManifestAPIExposePlugin;
