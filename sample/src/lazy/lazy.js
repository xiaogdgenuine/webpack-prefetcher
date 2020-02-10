import * as React from 'react';

export default class LazyComponent extends React.Component {
  render() {
    return `I'm lazy component`;
  }
}


console.warn(`If u saw this, then I'm executed!!!!!!`);
