# webpack-prefetcher
A babel plugin to let u take over prefetch control from webpack

## Usage

First:

``npm install webpack-prefetcher``

Then add this plugin into ur .babelrc file:

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

But [webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin/) can't generate a manifest file with hash file name, since we want to control the prefetch in client side, we need to send down the manifest to browser every time, so this limitation is a drawback because we can't cache the manifest file even it's content never changed.

In short, we want to generate something like ``manifest.[hash].json``, not `manifest.json`

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

## One more thing about manifest
If u open the `manifest.[hash].json` file, it look like this:

```
{
  "lazy-chunk.js": "/lazy-chunk.7ef8e208d1617ed06120.js",
  "lazy.style-chunk.css": "/lazy.style-chunk.7ef8e208.css",
  "lazy.style-chunk.js": "/lazy.style-chunk.7ef8e208d1617ed06120.js",
  "main.js": "/main.7ef8e208d1617ed06120.js",
  "index.html": "/index.html"
}
```

Here, the key `lazy-chunk.js` & `lazy.style-chunk.js` is usually set by webpack magic comment `/* webpackChunkName: name */`, my `babel-plugin.js` set this magic comment automatically for u.

But the plugin never check for chunk name confliction, so if u got two js file with same name, things will mess-up.

In such case u have to set the chunk name yourself by `/* webpackChunkName: name */`, if u feel this is a verbose thing to do, consider use this babel-plugin to generate the chunk name with hash:

[babel-plugin-smart-webpack-import](https://github.com/sebastian-software/babel-plugin-smart-webpack-import)

Remember to put it before `webpack-prefetcher/lib/babel-plugin` in .babelrc

```
"plugins": [
  "babel-plugin-smart-webpack-import",
  "webpack-prefetcher/lib/babel-plugin"
]
```

## How webpack-prefetcher works?
[Prefetch - Take control from webpack](https://medium.com/@migcoder/prefetch-preload-take-control-from-webpack-26d1e0f2c3)
