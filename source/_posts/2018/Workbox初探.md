---
title: Workbox3初探：让离线缓存变得简单
link: learn_workbox
date: 2018-08-22
categories: study
tags: [workbox, pwa, offline]
---



我曾在[Https你的博客](/https_your_blog.html)中简单尝试了PWA的离线缓存。

因为水平有限，在书写`service-worker`过程中，给我留下了两点不好的印象：

1. 需要手写所有需要缓存的文件
2. 不严谨的代码逻辑，可能导致页面更新不及时（**！！包括HTML！！**）

随后知道了[sw-precache](https://github.com/GoogleChromeLabs/sw-precache)（可以自动生成缓存文件），功能虽然强大，配置却相对麻烦。故觉得PWA有点鸡肋<small>（好吧，我承认，是我智商不够）</small>。直到我遇上了**workbox3**。像是在库海茫茫中遇见了那个“它”，是那么的**简单**，那么的**粗暴**。



## 直接撸代码

启用最基本的Workbox3配置，仅需传入两个参数：

- 缓存的文件（正则表达式匹配）
- 采取的**缓存策略**

```javascript
// 缓存 *.js、*.css、*.html
workbox.routing.registerRoute(
    /.*\.(?:js|css|html).*$/,
    workbox.strategies.networkFirst()
);
```

只需寥寥几行代码，即能赋予站点`离线浏览`的能力。

### 什么是缓存策略

用正则匹配缓存文件，自不用多说。

而**缓存策略**则需要解析一下，Workbox3的缓存策略分为五类，分别是： `Stale While Revalidate`、`Network First`（网络优先）、`Cache First`（缓存优先）、`Network Only`（仅网络可用）、`Cache Only`（仅缓存可用）。本质就是获取资源，优先显示最新代码，还是缓存代码。

`Stale While Revalidate`略为特殊，它和`Cache First`接近，均优先从缓存中读取文件。不同之处在于，`Cache First`**一旦从缓存中获取文件，则不再从服务端请求最新代码**；而`Stale While Revalidate`，尝试从缓存获取代码并显示执行，但无论缓存命中与否，均**请求网络以更新缓存**。

故优点是：

- 响应及时（优先执行缓存代码，无需等待网络请求返回）
- 保证缓存较新（网络请求返回后，及时更新本地缓存，以备下次之需）。

**小打小闹的话，推荐使用`Stale While Revalidate；`**

## 拓展

### 错误处理

网络不畅时，希望提供比原生404错误更友好的页面。

[参考github上的讨论](https://github.com/GoogleChrome/workbox/issues/1517 )，仅需：

- 首次成功加载页面时，缓存离线资源（eg：`img_load_fail.png`，`offline.html`等）

- 后续网络不畅时，通过`catch`捕获workbox的网络错误，返回之前缓存的离线资源

如：

- 访问↓↓`未缓存的图片`↓↓<small>（在此通过不存在的图片进行模拟）</small>：![我是不存在的图片](/not_exist_img.png)

或：

- 访问未缓存的页面<small>（在此通过不存在的页面进行模拟）</small>：[我是不存在的页面](/not_exist.html)

在确保无网络后<small>（可在Chrome的Network中勾选offline）</small>，刷新本页面，查看图片或点击链接，将看到失效的图片或链接，展示为离线资源。

效果如下：

![离线访问图片](https://edeity.oss-cn-shenzhen.aliyuncs.com/2018/offline_img.png)

<div class="img-desc">访问图片：在线 Vs离线</div>

![离线访问未访问的网站](https://edeity.oss-cn-shenzhen.aliyuncs.com/2018/offline_site.png)

<div class="img-desc">访问网站：在线 VS 离线</div>
代码如下：

```javascript
// service-worker.js

// 离线访问未缓存的页面时，显示的页面
const HTML_FAIL_URL = '/public/html/offline.html'; 
// 离线访问未加载的图片
const IMG_FAIL_URL = '/public/img/img_load_fail.png'; 

// 处理为访问过的网页URL-HTML
let networkFirst = workbox.strategies.networkFirst({
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
    /.*\.(?:html|php).*$/,
    offlineHandler
);

// 访问不存在的图片-IMAGE
const imagesHandler = workbox.strategies.cacheFirst();
workbox.routing.registerRoute(
    /.*\.(?:png|jpg|jpeg|svg|gif).*$/,
    ({event}) => {
        return imagesHandler.handle({event})
            .catch(() => {
                return caches.match(IMG_FAIL_URL)
            });
    }
);
```

我博客`sw`的完整代码：[service-worker.js](https://github.com/edeity/blog/blob/master/themes/edeity/source/sw.v1.js)


## 其他

### 离线提示

通过监听网络状态，在用户离线瞬间，提示用户：`暂时无法连接网络`。

具体方法参考[在线和离线事件](https://developer.mozilla.org/zh-CN/docs/Web/API/NavigatorOnLine/Online_and_offline_events)。在此不展开。

### 犯下的小小错误

1. `service-worker.js`需放置在根目录下，否则不生效

### 参考文章

- [Workbox官方教程](https://developers.google.com/web/ilt/pwa/lab-workbox)
- [Workbox官方文档](https://developers.google.com/web/tools/workbox/)

