class ManifestInlinePlugin {
  constructor(placeholder) {
    this.placeholder = placeholder || '$MANIFESTPATH$'
  }

  apply(compiler) {
    const [HtmlWebpackPlugin] = compiler.options.plugins.filter(
      (plugin) => plugin.constructor.name === 'HtmlWebpackPlugin');

    compiler.hooks.emit.tap('ManifestInlinePlugin', compilation => {
      compiler.hooks.webpackManifestPluginAfterEmit.tap('ManifestInlinePlugin', (manifest, outputPath) => {
        let originHtmlAsset = compilation.assets[HtmlWebpackPlugin.options.filename];
        let htmlContent = originHtmlAsset.source();
        htmlContent = htmlContent.replace(this.placeholder, outputPath);

        compilation.assets[HtmlWebpackPlugin.options.filename] = {
          source: function () {
            return htmlContent;
          },
          size: function () {
            return htmlContent.length;
          }
        };
      });
    })
  }
}

module.exports = ManifestInlinePlugin;
