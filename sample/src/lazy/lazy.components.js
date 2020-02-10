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
export const lazyCSS = createLoadable(prefetchable(() => import('./lazy.style.css')));
