"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var manifest = {};
function getManifest() {
    if (typeof manifest.then === 'function') {
        return manifest;
    }
    else {
        return Promise.resolve(manifest);
    }
}
function appendLink(chunkId, chunkExtension, rel, as) {
    if (chunkExtension === void 0) { chunkExtension = '.js'; }
    if (as === void 0) { as = 'script'; }
    getManifest().then(function (manifest) {
        var link = document.createElement('link');
        link.rel = rel;
        link.as = as;
        link.href = manifest[chunkId + chunkExtension];
        document.head.appendChild(link);
    });
}
var Prefetcher = /** @class */ (function () {
    function Prefetcher() {
    }
    Prefetcher.loadManifest = function (data) {
        manifest = data;
    };
    Prefetcher.prefetch = function (chunkId, as, chunkExtension) {
        appendLink(chunkId, chunkExtension, 'prefetch', as);
    };
    Prefetcher.preload = function (chunkId, as, chunkExtension) {
        appendLink(chunkId, chunkExtension, 'preload', as);
    };
    return Prefetcher;
}());
exports.Prefetcher = Prefetcher;
function prefetchable(importFunc, chunkId, chunkExtension) {
    return {
        load: importFunc,
        prefetch: function (as) { return Prefetcher.prefetch(chunkId, as, chunkExtension); },
        preload: function (as) { return Prefetcher.preload(chunkId, as, chunkExtension); }
    };
}
exports.prefetchable = prefetchable;
