---
title: Git小记
link: about_git
date: 2018-06-01
categories: 学习
tags: [git]
---

- ssh -T git@github.com

### 通过代理更改Git

生活总存在形形式式的墙。

- 编辑`~/.ssh/config`（shadow socket默认socket5的接口为1086）

```vim
Host github.com
  HostName github.com
  User git
  ProxyCommand nc -v -x 127.0.0.1:1086 %h %p
```

- 假如还存在以下问题：

```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
```

把`~/.ssh/known_hosts`文件删除即可

