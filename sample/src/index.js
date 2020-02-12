import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Prefetcher } from "webpack-prefetcher";
import App from "./components/App";

// Method 1: Generate manifest and load it here
Prefetcher.loadManifest(fetch(window.manifestPath)
  .then(res => res.json()));

// Method 2: Expose webpack manifest api and pass it here
// Prefetcher.loadManifestFromWebPack({
//   jsSrc: window.jsonpScriptSrc,
//   cssSrc: window.cssSrc
// });

ReactDOM.render(<App/>, document.getElementById('root'));

