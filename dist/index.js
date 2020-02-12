"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var manifest = {};
var manifestAPIs;
var typeMapping = {
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
};
var cssExtensions = ['.css', '.less', '.scss', '.sass', '.styl'];
function getManifest() {
    if (typeof manifest.then === 'function') {
        return manifest;
    }
    else {
        return Promise.resolve(manifest);
    }
}
function insertLink(rel, as, href) {
    if (href) {
        if (!as) {
            var extension = href.substr(href.lastIndexOf('.') + 1).toLowerCase();
            as = typeMapping[extension] || 'object';
        }
        var link = document.createElement('link');
        link.rel = rel;
        link.as = as;
        link.href = href;
        document.head.appendChild(link);
    }
    else {
        console.warn("Can't " + rel + " resources without valid path");
    }
}
function appendLink(chunkId, chunkExtension, rel, as) {
    if (chunkExtension === void 0) { chunkExtension = '.js'; }
    if (as === void 0) { as = 'script'; }
    chunkExtension = chunkExtension.toLowerCase();
    if (cssExtensions.indexOf(chunkExtension) !== -1) {
        chunkExtension = '.css';
    }
    if (manifestAPIs) {
        if (chunkExtension === '.js') {
            insertLink(rel, as, manifestAPIs.jsSrc(chunkId));
        }
        else if (chunkExtension === '.css') {
            // mini-css-extract-plugin will generate two chunks
            // One for js, one for actual css
            appendLink(chunkId, '.js', rel);
            insertLink(rel, as, manifestAPIs.cssSrc(chunkId));
        }
    }
    else {
        getManifest().then(function (manifest) {
            insertLink(rel, as, manifest[chunkId + chunkExtension]);
        });
    }
}
var Prefetcher = /** @class */ (function () {
    function Prefetcher() {
    }
    Prefetcher.loadManifest = function (data) {
        manifest = data;
    };
    Prefetcher.loadManifestFromWebPack = function (apis) {
        manifestAPIs = {
            jsSrc: apis.jsSrc || (function () { return null; }),
            cssSrc: apis.cssSrc || (function () { return null; })
        };
    };
    Prefetcher.prefetch = function (chunkId, as, chunkExtension) {
        appendLink(chunkId, chunkExtension, 'prefetch', as);
    };
    Prefetcher.preload = function (chunkId, as, chunkExtension) {
        appendLink(chunkId, chunkExtension, 'preload', as);
    };
    Prefetcher.prefetchFile = function (fileUrl, as) {
        insertLink('prefetch', as, fileUrl);
    };
    Prefetcher.preloadFile = function (fileUrl, as) {
        insertLink('preload', as, fileUrl);
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
