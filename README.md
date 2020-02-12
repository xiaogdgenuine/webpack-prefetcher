# webpack-prefetcher
A babel plugin to let u take over prefetch control from webpack

## Purpose of this plugin
Webpack is awesome for splitting chunks, but it's chunk prefetch/preload strategy is not ideal, if your chunk load other chunk in some conditions like this:

```
function renderSearch() {
    if (isMobile) {
      // Tiny, 4KB, fast rendering
      import('./mobile.search.js').then(render)
    } else {
      // Huge, 40KB, slow rendering
      import('./desktop.search.js').then(render)
    }
}
showSearchBtn.onclick = () => renderSearch()
``` 

Now u want to prefetch search chunks when user hover the button, u may do this:
```
showSearchBtn.onmouseover = () => {
    if (isMobile) {
      // Tiny, 4KB, fast rendering
      import(/* webpackPrefetch: true */ './mobile.search.js')
    } else {
      // Huge, 40KB, slow rendering
      import(/* webpackPrefetch: true */ './desktop.search.js')
    }
}
```

But this won't works, it will prefetch both desktop & mobile search chunks at same time, u actually don't have the control of this...

See the issue here:
https://github.com/webpack/webpack/issues/8470 

## Requirements:
Currently this plugin only support webpack 4, maybe works in webpack 2 or 3, but I didn't got time to test it out.

## Usage

First:

``npm install webpack-prefetcher``

Then add this plugin into your .babelrc file:

```
"plugins": [
  "webpack-prefetcher/lib/babel-plugin"
]
```

Then in the begin of your app code, add this to load manifest data:

```
import { Prefetcher } from "webpack-prefetcher";

// window.manifestPath is the url of your manifest file
Prefetcher.loadManifest(
  fetch(window.manifestPath)
    .then(res => res.json())
);

// Or pass the data directly
const manifest = {'lazy-chunk': 'lazy-chunk.hash.js'}
Prefetcher.loadManifest(manifest);
```

Finally, declare your lazy load component like this:

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

### Method A - Generate it your-self 
For most of project, I would recommend the [webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin/) plugin.

But [webpack-manifest-plugin](https://github.com/danethurber/webpack-manifest-plugin/) can't generate a manifest file with hash file name, since we want to control the prefetch in client side, we need to send down the manifest to browser every time, so this limitation is a drawback because we can't cache the manifest file even it's content never changed.

In short, we want to generate something like ``manifest.[hash].json``, not `manifest.json`

So I copy & modify this plugin, create my own version of `WebpackManifestPlugin`, u can use it like this:

```
const WebpackManifestPlugin = require('webpack-prefetcher/lib/webpack-manifest-plugin');
```

It will generate `manifest.[hash].json` in your build output folder.

Then put the manifest path into html, u have to write your own webpack plugin to do so
 
The `WebpackManifestPlugin` I created will emit an event to a webpack hook call `webpackManifestPluginAfterEmit`, which will work like this:

```
compiler.hooks.webpackManifestPluginAfterEmit.tap('ManifestInlinePlugin', (manifest, outputPath) => {
  // outputPath is where the manifest file go.
  // U can check "sample/src/manifest.inline.plugin.js" for how to implement the below function
  replaceManifestPathInHTML(outputPath)
});
```

Then in your `index.html`
```
<html>
  <body>
    <div id="root"></div>
    <script>
      window.manifestPath = '$MANIFESTPATH$'
    </script>
  </body>
</html>
```

### Method B - Expose webpack manifest APIs

`Note: this is an really hacky method and may broken in many cases`

The easiest way to get manifest data is get it from webpack, webpack knows everything about chunks so it can help u them.

Webpack 4 contains such data in a function call `jsonpScriptSrc`:
```
// script path function
function jsonpScriptSrc(chunkId) {
    /******/
    return __webpack_require__.p + "" + ({
      "lazy-chunk": "lazy-chunk",
      "lazy-css-file-chunk": "lazy-css-file-chunk",
      "lazy-scss-file-chunk": "lazy-scss-file-chunk",
      "lazy.2-chunk": "lazy.2-chunk"
    }[chunkId] || chunkId) + "-" + {
      "lazy-chunk": "86ef26e3221877d60d43",
      "lazy-css-file-chunk": "5f0e6cf30483ee380632",
      "lazy-scss-file-chunk": "814341c216b82b0a5b6e",
      "lazy.2-chunk": "e0d63e2f3d8d35544af5"
    }[chunkId] + ".js"
    /******/
  }
```

But webpack 4 doesn't expose this as an api, so we can't get the manifest data from it.

Luckily it's easy to hack in, I created another hacky webpack plugin to modify this function's declaration from:

```
function jsonpScriptSrc(chunkId) {
 ...
}
```

to: 

```
window.jsonpScriptSrc = function(chunkId) {
 ...
}
```
U can get this plugin from `webpack-prefetcher/lib/webpack-manifest-api-expose-plugin`, put it into webpack's plugin list, then pass these apis to `Prefetcher`:
```
Prefetcher.loadManifestFromWebPack({
   jsSrc: window.jsonpScriptSrc,
   cssSrc: window.cssSrc
});
```

↑↑ you have to enable `namedChunks` in webpack to make this method works ↑↑

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



## Exactly, how this plugin works?
[Prefetch - Take control from webpack](https://medium.com/@migcoder/prefetch-preload-take-control-from-webpack-26d1e0f2c3)
