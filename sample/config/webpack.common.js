const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const WebpackManifestPlugin = require('webpack-prefetcher/lib/webpack-manifest-plugin');
const ManifestInlinePlugin = require('../src/manifest.inline.plugin');
// const WebpackManifestAPIExposePlugin = require('webpack-prefetcher/lib/webpack-manifest-api-expose-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, "../src", "index.js"),
  },
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: "/"
  },
  devServer: {
    port: 3042,
    historyApiFallback: true,
    overlay: true,
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [/node_modules/],
        use: [{loader: "babel-loader"}]
      },
      {
        test: /.*\.(gif|png|jp(e*)g|svg)$/i,
        use: [
          {
            loader: "file-loader",
          }
        ]
      },
      // Vendor CSS loader
      // This is necessary to pack third party libraries like antd
      {
        test: /\.css$/,
        include: path.resolve(__dirname, '../node_modules'),
        use: [
          'style-loader',
          'css-loader'
        ],
      },
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, '../public', 'index.html')
    }),
    // Generate manifest.[hash].json
    new WebpackManifestPlugin({
      filter: file => !file.path.endsWith('.map')
    }),
    // Put manifest.[hash].json path into index.html
    new ManifestInlinePlugin(),

    // Expose webpack manifest api
    // new WebpackManifestAPIExposePlugin({
    //   jsSrc: 'jsonpScriptSrc',
    //   cssSrc: 'cssSrc'
    // })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
};
