---
title: 某WEB APP前端性能优化简述
link: optimize_docs
date: 2019-08-13
categories: work
tags: [web, optimize, throttle]
---

**以下为概述，具体不展开**

结论：两板斧下来，无论是首屏加载还是渲染，都有25%以上的提高。
<small>小声BB：可能还是原来的代码太菜</small>

## 方向

- 首屏打开速度

- 高频操作（eg：输入）优化

## 文字的三大步骤

- `文字排版`：输入后，计算布局排版结果<small>（类似于浏览器的重排）</small>
- `排版渲染`：得到排版结果，文档前端绘制<small>（类似于浏览器的重绘）</small>
- `视图更新`：GCP变化触发一系列React组件更新

一般地，执行的流程是：`文字排版` -> `排版渲染` -> `视图更新`

## 测量工具

- `Dev Performance` & <del>`React Tools`</del>

## 首屏优化

分析首页加载的步骤

- 按业务分阶段加载组件：

  - 首屏渲染阶段（KPI生命线）
  - 首屏渲染后（加载一些必要的组件，避免断网影响）
  - 其他辅助功能（用到时才加载）。

- 网络层面优化：
  - preload服务端渲染
  - 提取公共库以及业务核心库（eg：React，polyfill），并移除某些polyfill（减少约10%代码量）
  - 语法层面采用更规范的`ES6 modules`，移除babel默认的Commonjs（会引入副作用导致webpack无法Tree Shake）（减少约7%代码量）
  - 缓存：cdn缓存（更新频繁时，命中率周期变化）、pwa缓存（这个作用不好评估，会加大init的时间）、入口文件prefetch文件，或组件相互唤起（未参与，不知优化效果）
  - 请求方式：提前加载，串行转并行（code split后不注意会导致串行），在preload中并行加载核心资源（首次加载，网速较慢时，约提高20%加载速度）<small>（未来可考察[server push](https://zhuanlan.zhihu.com/p/26757514)）</small>

  

## 高频操作优化

每个周期耗时，**期望小于16ms**（60FPS-流畅），**不高于32ms**（30FPS-平稳）的操作。

**基本方法：**

1. 对高消耗的**实时**函数调用，进行代码优化，使**每次耗时**缩短
2. 对高消耗的**非实时**函数调用，进行限流防抖，使**总体耗时**缩短

### 例子

- 限制操作频率（最简单粗暴且有效）
- 限制更新频率：
  - 触发更新事件应放置在`requestAnimate`中<small>（eg：SelectionChanged）</small>
  - `setState`触发React diff，会占用1~2ms的时间（无论是否变化），一个周期切记不能多次调用
  - 缓存触发重绘的高频属性（如`clientWidth`、`scrollTop`等）（`throttle`也自带缓存机制）
- 用ES5的接口替代部分JS实现，如：
	- `Object.assign`取代`copy`
	- 避免过频使用`RegExep`等<small>（第一次向Chromium提[bug](https://bugs.chromium.org/p/chromium/issues/detail?id=992277)）</small>
- 渲染方面，svg较canvas，在放大缩小操作上有明显的性能优势。
  - svg结构松散时，可合并图层（离屏渲染、DocumentFragment）。
- 更优的数据结构，如红黑树、[区间树](https://lotabout.me/2018/segment-tree/)等<small>（考验硬实力，向C艹大佬低头）</small>
  - 数据巨大，遍历树时，仍是耗时操作，同样需要缓存高频属性

## 参考

- [使用 RAIL 模型评估性能](https://developers.google.com/web/fundamentals/performance/rail#goals-and-guidelines)

- [Get Started With Analyzing Runtime Performance](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/)
- [详谈层合成（composite）](https://juejin.im/entry/59dc9aedf265da43200232f9)

- [缩小样式计算的范围并降低其复杂性](https://developers.google.com/web/fundamentals/performance/rendering/reduce-the-scope-and-complexity-of-style-calculations)