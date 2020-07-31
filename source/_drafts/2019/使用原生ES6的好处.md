---
title: 使用原生ES6的好处
link: use_es6
date: 2019-12-10
categories: work
tags: [es6, optimize, webpack]
warn:
---

在早些时候，我在项目上移除了旧的CMD规范，改用ESM规范，如下：

- 在babel配置上`modules: false`（避免开启[loose](https://2ality.com/2015/12/babel6-loose-mode.html)模式，代码不可控），移除`module.exports`语法
  - 原因：babel的`commonjs`（默认）引入了副作用，导致涉及export的代码都被打包进项目
- 对枚举值和帮助函数，优先使用`export {} & import * as xxx`，而不是`export default {} & import xxx`
  - 原因：无法在代码分析阶段判断对象属性是否被引用，从而打包所有的对象属性

此举让我们的业务代码减少了至少**6%**的体积、首屏打开速度提高了**8%**。

但显然，这只是我小算盘中的一步。若观察`await`转ES5的代码，你会发现它长且丑。2020年使用ES6+，理论上将带来更快的速度和更精简的体积。但在此之前，我必须得先周全考虑ES6+能带来的好处。

- 使用Map而不是Object，能减少内存占用和GC时间（参见[WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)）
- 更精简的代码，尤其是`async/await`（[参考](https://v8.dev/blog/high-performance-es2015)），`for of`等

