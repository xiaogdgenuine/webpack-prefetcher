# webpack-prefetcher
A babel plugin to let u take over prefetch control from webpack


## Usage

First:

``npm install webpack-prefetcher``

Then add this into ur .babelrc file:

```
"plugins": [
  "webpack-prefetcher/lib/babel-plugin"
]
```

Then in the begin of ur app code, add this to load manifest data:

```
import { Prefetcher } from "webpack-prefetcher";

// window.manifestPath is the url of ur manifest file
Prefetcher.loadManifest(
  fetch(window.manifestPath)
    .then(res => res.json())
);

// Or pass the data directly
const manifest = {'lazy-chunk': 'lazy-chunk.hash.js'}
Prefetcher.loadManifest(manifest);
```

Finally, declare ur lazy load component like this:

```
import { prefetchable } from "webpack-prefetcher";
import Loadable from 'react-loadable';

function createLoadable(prefetchable) {
  return {
    load: prefetchable.load,
    preload: prefetchable.preload,
    prefetch: prefetchable.prefetch,
    component: Loadable({
      loader: prefetchable.load,
      loading: () => null
    })
  }
}


export const lazyJS = createLoadable(prefetchable(() => import('./lazy')));
```
Now u can control the prefetch/preload by yourself!

```
<button
  onMouseOver={() => lazyJS.prefetch()}
  onClick={() => lazyJS.load()}>
    Load lazyJS
</button>
```


## How to generate manifest?
For most of project, I would recommend the [webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin/) plugin.

But this plugin is design for reading manifest data in server side, it can't generate a manifest file with hash file name, but if we want to control the prefetch in client side, we need to send down the manifest every time, so this limitation is a drawback because we can't cache the manifest file even it's content never changed.

In short, we want generate something like ``manifest.[hash].json``, not `manifest.json`

So I copy & modify this plugin, create my own version of `ManifestPlugin`, u can use it like this:

```
const ManifestPlugin = require('webpack-prefetcher/lib/manifest-plugin');
```

It will generate `manifest.[hash].json` in ur build output folder.

## How I put the manifest path into html?
U have to write ur own webpack plugin to do so, the `ManifestPlugin` I created will emit an event to a webpack hook call `webpackManifestPluginAfterEmit`, which will work like this:

```
compiler.hooks.webpackManifestPluginAfterEmit.tap('ManifestInlinePlugin', (manifest, outputPath) => {
  // outputPath is where the manifest file go.
  // U can check "sample/src/manifest.inline.js" for how to implement the below function
  replaceManifestPathInHTML(outputPath)
});
```

Then in your `index.html`
```
<html>
  <head>
    <title>Your title</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      manifestPath = '$MANIFESTPATH$'
    </script>
  </body>
</html>
```
