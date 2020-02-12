export interface Prefetchable<T> {
    load: () => Promise<T>;
    prefetch: (as?: string) => void;
    preload: (as?: string) => void;
}
export declare type Manifest = {
    [p in string]: string;
};
export declare type WebpackManifestAPI = {
    jsSrc: (chunkId: string) => string;
    cssSrc: (chunkId: string) => string;
};
export declare class Prefetcher {
    static loadManifest(data: Manifest | Promise<Manifest>): void;
    static loadManifestFromWebPack(apis: WebpackManifestAPI): void;
    static prefetch(chunkId: string, as?: string, chunkExtension?: string): void;
    static preload(chunkId: string, as?: string, chunkExtension?: string): void;
    static prefetchFile(fileUrl: string, as?: string): void;
    static preloadFile(fileUrl: string, as?: string): void;
}
export declare function prefetchable<T>(importFunc: () => Promise<T>, chunkId?: string, chunkExtension?: string): Prefetchable<T>;
