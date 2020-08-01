importScripts('https://g.alicdn.com/kg/workbox/3.3.0/workbox-sw.js');
workbox.setConfig({
    modulePathPrefix: 'https://g.alicdn.com/kg/workbox/3.3.0/'
});

/**
 * networkFirst
 * staleWhileRevalidate
 * cacheFirst
 */

const HTML_FAIL_URL = '/public/html/offline.html';
const IMG_FAIL_URL = '/public/img/404.png';
const REGEX = {
    ROOT: /(localhost:4000|blog.edeity.me)\/?$/,
    HTML: /.*\.(?:html|php).*$/,
    LIB: /.*\.(?:js|css).*$/,
    IMG: /.*\.(?:png|jpg|jpeg|svg|gif).*$/,
    FONT: /.*\.(?:woff2|woff|eot|ttf|svg).*$/,

};

// HTML: 网络优先
var networkFirst = workbox.strategies.networkFirst({
    cacheName: 'outside-pages'
});
const offlineHandler = async (args) => {
    try {
        const response = await networkFirst.handle(args);
        return response || await caches.match(HTML_FAIL_URL);
    } catch (error) {
        return await caches.match(HTML_FAIL_URL);
    }
};
workbox.routing.registerRoute(
    REGEX.ROOT,
    offlineHandler
);
workbox.routing.registerRoute(
    REGEX.HTML,
    offlineHandler
);

// CSS/JS: 响应优先
workbox.routing.registerRoute(
    REGEX.LIB, workbox.strategies.networkFirst()
);

// 图片（缓存优先）
const imagesHandler = workbox.strategies.cacheFirst();
workbox.routing.registerRoute(
    REGEX.IMG, ({event}) => {
        return imagesHandler.handle({event})
            .catch(() => {
                return caches.match(IMG_FAIL_URL)
            });
    }
);

// 字体(缓存优先)
workbox.routing.registerRoute(
    REGEX.FONT, workbox.strategies.cacheFirst()
);