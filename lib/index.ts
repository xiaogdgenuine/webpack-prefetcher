type LinkRel = 'preload' | 'prefetch'

export interface Prefetchable<T> {
  load: () => Promise<T>,
  prefetch: (as?: string) => void,
  preload: (as?: string) => void
}

export type Manifest = { [p in string]: string }

let manifest: Manifest | Promise<Manifest> = {}

function getManifest(): Promise<Manifest> {
  if (typeof manifest.then === 'function') {
    return manifest as Promise<Manifest>
  } else {
    return Promise.resolve(manifest)
  }
}

function appendLink(chunkId: string, chunkExtension = '.js', rel: LinkRel, as = 'script') {
  getManifest().then(manifest => {
    const link = document.createElement('link')
    link.rel = rel
    link.as = as
    link.href = manifest[chunkId + chunkExtension]
    document.head.appendChild(link)
  })
}

export class Prefetcher {
  static loadManifest(data: Manifest | Promise<Manifest>) {
    manifest = data
  }

  static prefetch(chunkId: string, as?: string, chunkExtension?: string) {
    appendLink(chunkId, chunkExtension, 'prefetch', as)
  }

  static preload(chunkId: string, as?: string, chunkExtension?: string) {
    appendLink(chunkId, chunkExtension, 'preload', as)
  }
}

export function prefetchable<T>(importFunc: () => Promise<T>, chunkId?: string, chunkExtension?: string): Prefetchable<T> {
  return {
    load: importFunc,
    prefetch: (as?: string) => Prefetcher.prefetch(chunkId!, as, chunkExtension),
    preload: (as?: string) => Prefetcher.preload(chunkId!, as, chunkExtension)
  }
}
