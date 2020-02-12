// The inspiration is come from
// https://github.com/sebastian-software/babel-plugin-smart-webpack-import

const {basename, dirname, resolve, sep} = require("path");
const fs = require('fs');
const t = require('babel-types');

function collectImportCallPaths(startPath) {
  const imports = [];
  startPath.traverse({
    Import: function Import(importPath) {
      imports.push(importPath)
    }
  });

  return imports
}

function getImportArgPath(path) {
  return path.parentPath.get("arguments")[0]
}

const visited = Symbol("visited");

function processImport(path, state, callPath) {
  if (path[visited]) {
    return
  }
  path[visited] = true;

  const importArg = getImportArgPath(path);
  const importArgNode = importArg.node;
  const {leadingComments = []} = importArgNode;

  const request = importArgNode.value;

  function getChunkName(chunkNameComment) {
    return chunkNameComment.value.replace('webpackChunkName:', '')
      .replace(/'/g, '').trim()
  }

  // There exists the possibility of non usable value. Typically only
  // when the user has import() statements with other complex data, but
  // not a plain string or template string. We handle this gracefully by ignoring.
  if (request == null) {
    return
  }
  const currentFolder = dirname(state.file.opts.filename);
  let filePath = resolve(currentFolder, request)
    .split(sep)
    .join("/");
  if (!fs.existsSync(filePath)) {
    let actualFilePath = filePath + '.js';

    // Look at path.js
    if (!fs.existsSync(actualFilePath)) {
      // Look at path/index.js
      actualFilePath = filePath + '/index.js';
      if (!fs.existsSync(actualFilePath)) {
        return
      }
    }
    filePath = actualFilePath
  }

  let dotPosition = filePath.lastIndexOf('.');
  let chunkExtension = dotPosition > -1 ? filePath.substr(dotPosition) : '';
  let chunkNameComment = leadingComments.find(x => x.value.trim().startsWith("webpackChunkName:"));
  let chunkName = `${basename(filePath, chunkExtension)}`;
  // This is not a prefetch import and also don't have chunk name
  if (!chunkNameComment) {
    // Set a chunk name for it
    importArg.addComment('leading', `webpackChunkName: '${chunkName}'`)
  } else {
    // Get the chunk name
    chunkName = getChunkName(chunkNameComment);
  }

  // Add the chunkName to the prefetchable function call
  callPath.node.arguments.push(t.stringLiteral(chunkName));
  if (chunkExtension) {
    callPath.node.arguments.push(t.stringLiteral(chunkExtension));
  }
}

module.exports = function webpackImportPrefetch() {
  return {
    name: "webpack-import-prefetch",
    visitor: {
      CallExpression(path, state) {
        if (path.node.callee.name === 'prefetchable') {
          const imports = collectImportCallPaths(path);
          imports.forEach((importCall) => processImport(importCall, state, path))
        }
      }
    }
  }
};
