import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Prefetcher } from "webpack-prefetcher";
import App from "./components/App";

Prefetcher.loadManifest(fetch(window.manifestPath)
  .then(res => res.json()));

ReactDOM.render(<App/>, document.getElementById('root'));
