import React, { Component } from 'react';
import logo from '../assets/images/logo.svg';
import { lazyCSS, lazyJS } from "../lazy/lazy.components";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to React</h1>
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
          <button onClick={() => lazyCSS.prefetch('css')}>
            Prefetch CSS
          </button>
          <button onClick={() => lazyCSS.load('css')}>
            Load CSS
          </button>
        </div>
      </div>
    );
  }
}

export default App;
