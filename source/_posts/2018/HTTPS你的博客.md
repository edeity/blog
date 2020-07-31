---
title: Https你的博客
link: https_your_blog
date: 2018-01-25
categories: study
tags: [blog, github, https]
---

前不久想在自己的博客上尝试`PWA`（Progressive Web App）功能，而`PWA`的前置条件是`Https`。因本域名没有在国内备案，故寻找服务商花费了几天的时间，特将结果记录于此。大致可分为两步：

1. `域名Https`（含前端源文件，如HTML、CSS、JS等）
2. `多媒体Https`（含前端多媒体资源，如png、jpg、gif等，即图床）

## 域名Https化

[CloudFlare](https://www.cloudflare.com)提供了免费的Https服务，因为联合了百度CDN，即使在国内，也能提供不错的访问速度。

步骤如下：

1. 在[CloudFlare](https://www.cloudflare.com)中`Add New Website`，按照提示填写自己的域名，eg：`edeity.me`

2. 更改域名记录，将记录类型更改为`NS`类型，并指向CloudFlareDNS服务解析器，`anirban.ns.cloudflare.com`、`gail.ns.cloudflare.com`，配置如下：

   ![阿里云DNS配置](https://edeity.oss-cn-shenzhen.aliyuncs.com/domain_config.png)

3. CloudFlare添加成功后，等待片刻，即可通过Https访问网站。

   - 推荐总是启用Https，步骤：`域名面板`->`SSL`->`Always use HTTPS`->`ON`，后续访问Http时，也会跳转到Https上。

## 多媒体Https化

因七牛存储不再提供https二级域名，而自定义域名又需要繁琐的备案，只好放弃。

考虑博客流量不大，大方地使用了[OSS](https://oss.console.aliyun.com/)（阿里云旗下的服务，收费）。

不注重访问速度，或国外的用户可考虑Yahoo的[flickr](https://www.flickr.com/)，有1T的**免费**存储空间。

注：默认配置中，OSS的资源是是私有的（无法外网访问），需要在`基础设置`中，把`读写权限`更改为`公共读`。

## 其他：PWA！

假如没有定制化需求，建议使用Workbox3，参考：[Workbox3初探：让离线缓存变得简单](/learn_workbox.html)

____

**以下为原纪录（不推荐）：**

网站升级为Https后，尝试`PWA`的功能，在此仅列举一项功能：`离线缓存`。

参考google给出的[范文](https://developers.google.com/web/fundamentals/codelabs/your-first-pwapp/)。

1. 引入`Manifest.json`，用于描述你的PWA：

   ```html
   <link rel="manifest" href="/manifest.json">
   ```

2. 告知`PWA`配置文件名称，并启动：

   ```javascript
   if (navigator.serviceWorker != null) {
   	navigator.serviceWorker.register('/service-worker.js')
   		.then(function(registration) {
   			console.log('PWA regist success');
       });
   }
   ```

3. 在配置文件`service-worker.js`运行离线脚本

   ```javascript
   var filesToCace = ['在此书写需要缓存的资源，如/index.html']
   
   // 激活缓存
   self.addEventListener('activate', function(e) {
       e.waitUntil(
           caches.keys().then(function(keyList) {
           return Promise.all(keyList.map(function(key) {
               if (key !== cacheName) {
               	return caches.delete(key);
               }
           }));
           })
       );
       return self.clients.claim();
   });
   
   // 拦截，判断是否可从缓存中读取资源
   self.addEventListener('fetch', function(e) {
       e.respondWith(
           caches.match(e.request).then(function(response) {
           return response || fetch(e.request);
           })
       );
   });
   ```

4. 由于Hexo的Url路径均是动态生成的，将所有的url都写入`Service-worker.js`的`filesToCace`中是件苦力活，可采用[hexo-offline](https://github.com/JLHwung/hexo-offline)可以自动完成这份工作。

   - `yarn install hexo-offline --dev`


   - 由于不知名的缘故，采用`hexo-offline`后，文件的权限变更了。回顾`chown`的用法：

     ```bash
     # 755 for 文件夹、可执行文件
     # 644 fro 普通文件
     # 400 for 证书
     chmod 755 -R dir 
     # 更改目录所有者
     chown -R user
     ```