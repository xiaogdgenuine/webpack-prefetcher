import React, { Component } from 'react';
import { Prefetcher } from "../../../dist";
import { lazyCSS, lazyJS, lazySCSS } from "../lazy/lazy.components";
import logo from '../assets/images/logo.svg';
import '../assets/styles/style.sass';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Prefetcher</h1>
        </header>
        <div>
          <button onClick={() => lazyJS.prefetch()}>
            Prefetch JS
          </button>
          <button onClick={() => lazyJS.preload()}>
            Preload JS
          </button>
          <button onClick={() => lazyJS.load()}>
            Load JS
          </button>
          <button onClick={() => lazyCSS.prefetch()}>
            Prefetch CSS
          </button>
          <button onClick={() => lazyCSS.load()}>
            Load CSS
          </button>
          <button onClick={() => lazySCSS.prefetch()}>
            Prefetch SCSS
          </button>
          <button onClick={() => lazySCSS.load()}>
            Load SCSS
          </button>
          <button onClick={() => Prefetcher.prefetchFile(logo)}>
            Prefetch Logo Svg
          </button>
        </div>
      </div>
    );
  }
}

export default App;
