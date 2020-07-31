---
title: Web拓展：Node插件
link: node_addons
date: 2019-02-25
categories: study
tags: [node, cpp]
---

<div class="error">文章施工中，臭不要脸的博主，直接发布大纲，稍后补充内容...</div>

## 前言

换了一个工作环境，点技能树时，点成了`主Win辅Mac`，常常在两台电脑上作人肉切换<small>（从Win键盘切换到Mac键盘，从Win鼠标切换到Mac触摸板）</small>，非常不便，因此萌生了“写一个工具来共享鼠标键盘”的错误想法。<small>路人甲：那直接用`synergy`且不是....（闭嘴，就你话多）</small>
​ 
在为数不多略懂略懂的语言中<small>（其实只有Java、JS）</small>选择一种语言，实在是一个难题。在犹豫不决之时，突然想起自己是个穷逼没钱买服务器，所以….我爱NPM，我爱JavaScript。
​ 
其基本思路就是：
​    

1. 通过[iohook](https://github.com/wilix-team/iohook)进行全局监听，获取鼠标键盘信息
2. 通过[robotjs](https://github.com/octalmage/robotjs)在另一台电脑上模拟触发

基于这种幼稚的想法，开始了漫长的填坑之路。

## 漫漫填坑路

### 传递数据

**Node的UDP数据传输：**

监听：

```javascript
const server = dgram.createSocket('udp4');
server.on('message', (msg, rinfo) => {
	console.log(msg)
}
```

发送：

```javascript
const client = dgram.createSocket('udp4');
client.send(message, port, ip, (err) => {   
    client.close();
});
```

### 自己的全局命令

发布：

创建一个项目：`cmd\bin\myCMD.js`;

```shell
mkdir cmd && cd cmd && npm init
mkdir bin && cd bin && to ./myCMD.js
```

写一个命令：`./bin/sharmk.js`

```json
"bin": {
	"sharemk": "bin/sharemk.js"
}
```

使用[commander](https://github.com/tj/commander.js)：

```javascript
#!/usr/bin/env node

const program = require('commander');
const server = require('../src/app/server');
const client = require('../src/app/client');

program.version('0.0.1').description(`
sharemk: share your mouse & keyboard between different system 
------------------------------------------------------
[warning: only win & mac on current verison]
`)
.option('-s, --server', 'for server (warning: only windows current)')
.option('-c, --client', 'for client (warning: only macos current)');

program.parse(process.argv);

if (program.server) {
	server.init();
} else if (program.client) {
	client.init();
}
```

### 写一个Node Addons

虽已经实现跨系统的文本复制粘贴，但I Have a Dream！支持跨系统的文件的`Ctrl + C`、`Ctrl + V`！

遇到的问题是：`Ctrl + C`暂无法获取文件路径。gayhub一下，没有对应的开源库，只能自动动手下海撸C++。

构建C++环境

- Mac：`XCode`

- Win环境：安装`VS studio`或`npm install windows-build-tools`

配置`binging.gpy`：

- `'type': 'executable'`：会变成一个可执行文件
- `conditions`：在不同平台编译不同cpp文件
- 旧时代的`nan` & 新时代的`napi`

```json
{
  'targets': [
    {
      'target_name': 'clipboard',
      'sources': [],
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ],
      'conditions': [
        ['OS == "linux"', {
          'sources': [
             'clipboard/cpb_linux.cc',
          ]
        }],
        ['OS == "mac"', {
          'sources': [
             'clipboard/cpb_mac.cc',
          ]
        }],
        ['OS == "win"', {
          'sources': [
             'clipboard/cpb_win.cc',
          ],
        }],
      ],
    },
  ],
}
```

执行命令：

```shell
node-gyp configure
node-gyp build
```

## 其他

BUG巨多，持续修复中：[<<成果>>](https://github.com/edeity/syncMouse)

## 参考

- [Node Addons数据转换](https://nodeaddons.com/)
- [粘贴板](https://segmentfault.com/a/1190000013826937)
- [GYP](https://gyp.gsrc.io/docs/UserDocumentation.md)
- [Node编译历史](https://ruby-china.org/topics/33378)
- [Node8.0 之 Napi 探秘](https://juejin.im/post/593fa75dda2f6000673b4109)
- [ Nodejs 制作命令行工具 ](https://segmentfault.com/a/1190000002918295)