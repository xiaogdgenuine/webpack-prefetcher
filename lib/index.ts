type LinkRel = 'preload' | 'prefetch'

export interface Prefetchable<T> {
  load: () => Promise<T>,
  prefetch: (as?: string) => void,
  preload: (as?: string) => void
}

export type Manifest = { [p in string]: string }
export type WebpackManifestAPI = {
  jsSrc: (chunkId: string) => string,
  cssSrc: (chunkId: string) => string
}

let manifest: Manifest | Promise<Manifest> = {}
let manifestAPIs: WebpackManifestAPI
let typeMapping: { [p in string]: string } = {
  "js": 'script',
  "css": 'style',
  "ttf": 'font',
  "woff": 'font',
  "woff2": 'font',
  "otf": 'font',
  "jpg": 'image',
  "jpeg": 'image',
  "png": 'image',
  "gif": 'image',
  "svg": 'image',
  "webp": 'image',
  "mp4": 'video',
  "mp3": 'audio',
  "ogg": 'audio',
}

const cssExtensions = ['.css', '.less', '.scss', '.sass', '.styl']

function getManifest(): Promise<Manifest> {
  if (typeof manifest.then === 'function') {
    return manifest as Promise<Manifest>
  } else {
    return Promise.resolve(manifest)
  }
}

function insertLink(rel: LinkRel, as?: string, href?: string) {
  if (href) {
    if (!as) {
      const extension = href.substr(href.lastIndexOf('.') + 1).toLowerCase()
      as = typeMapping[extension] || 'object'
    }

    const link = document.createElement('link')
    link.rel = rel
    link.as = as
    link.href = href
    document.head.appendChild(link)
  } else {
    console.warn(`Can't ${rel} resources without valid path`)
  }
}

function appendLink(chunkId: string, chunkExtension = '.js', rel: LinkRel, as = 'script') {
  chunkExtension = chunkExtension.toLowerCase()

  if (cssExtensions.indexOf(chunkExtension) !== -1) {
    chunkExtension = '.css'
  }

  if (manifestAPIs) {
    if (chunkExtension === '.js') {
      insertLink(rel, as, manifestAPIs.jsSrc(chunkId))
    } else if (chunkExtension === '.css') {
      // mini-css-extract-plugin will generate two chunks
      // One for js, one for actual css
      appendLink(chunkId, '.js', rel)
      insertLink(rel, as, manifestAPIs.cssSrc(chunkId))
    }
  } else {
    getManifest().then(manifest => {
      insertLink(rel, as, manifest[chunkId + chunkExtension])
    })
  }
}

export class Prefetcher {
  static loadManifest(data: Manifest | Promise<Manifest>) {
    manifest = data
  }

  static loadManifestFromWebPack(apis: WebpackManifestAPI) {
    manifestAPIs = {
      jsSrc: apis.jsSrc || (() => null),
      cssSrc: apis.cssSrc || (() => null)
    }
  }

  static prefetch(chunkId: string, as?: string, chunkExtension?: string) {
    appendLink(chunkId, chunkExtension, 'prefetch', as)
  }

  static preload(chunkId: string, as?: string, chunkExtension?: string) {
    appendLink(chunkId, chunkExtension, 'preload', as)
  }

  static prefetchFile(fileUrl: string, as?: string) {
    insertLink('prefetch', as, fileUrl)
  }

  static preloadFile(fileUrl: string, as?: string) {
    insertLink('preload', as, fileUrl)
  }
}

export function prefetchable<T>(importFunc: () => Promise<T>, chunkId?: string, chunkExtension?: string): Prefetchable<T> {
  return {
    load: importFunc,
    prefetch: (as?: string) => Prefetcher.prefetch(chunkId!, as, chunkExtension),
    preload: (as?: string) => Prefetcher.preload(chunkId!, as, chunkExtension)
  }
}
