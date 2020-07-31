---
title: MAC之前端常用APP 和 技巧
link: fe_app_with_mac
date: 2017-09-04
categories: study
tags: [mac, app, front-end]
---

![mac](https://edeity.oss-cn-shenzhen.aliyuncs.com/2017/macbookpro.png)

<div class="img-desc">
图片来源网络
</div>

## 推荐应用

### 前置

- Xcode【必须】(推荐晚上人少时下载）
- [brew](https://brew.sh/)（程序猿的App Store，需先安装Xcode）
- [iterm2](http://www.iterm2.com/)【强烈推荐】（取代原生终端）

### 前端编辑器

-  轻量级：  [Visual Studio Code](https://code.visualstudio.com/)。<small>Vim&Emacs大佬，小弟先跪为敬</small>
-  重量级：[Webstorm](http://www.jetbrains.com/webstorm/)
-  Markdown：[Typora](https://www.typora.io/)【强烈推荐】
   -  <del>blog免费图床可考虑`ipic` + `ipicMover`</del>
   -  图床可考虑阿里云OSS（支持Https、收费但有免费额度）

### 前端相关

- ↓适用于只有图片，没有属性的UI稿：
  - <del>MarkMan</del>、[PxCook](http://www.fancynode.com.cn/pxcook)（属性测量）
  - [Sip](http://sipapp.io/)（屏幕取色）
- [Dash2](https://kapeli.com/dash)（API文档）


- chrome插件
  - [adblock](https://chrome.google.com/webstore/detail/adblock-plus/cfhdojbkjhnklbpkdaibdccddilifddb?utm_campaign=en&utm_source=en-et-na-us-oc-webstrapp&utm_medium=et)：广告杀手
  - [octotree](https://chrome.google.com/webstore/detail/octotree/bkhaagjahfmjljalopjnoealnfndnagc?utm_campaign=en&utm_source=en-et-na-us-oc-webstrhm&utm_medium=et)：显示github目录结构

### 其他

  - [TeamViewer](https://www.teamviewer.com/zhCN/)（远程工具）
  - [DbVisualizer](http://www.dbvis.com/)（数据库连接工具）
  - [licecap](https://www.cockos.com/licecap/)（gif制作工具）
  - [ImageOption](https://imageoptim.com/mac)（图片压缩工具，含gif压缩）
  - [Moom](http://www.sdifen.com/moom325.html)【强烈推荐】（快速窗口化工具）
  - 某款翻墙软件，免费的有[蓝灯](https://www.getlantern.org/en_US/)，<del>收费的有[红杏SS](https://www.hxss.biz/)等</del>；
  
  - 推荐看看[《鸟哥的linux私房菜》](http://download.csdn.net/download/niuyafeng1990/9411053)



## 技巧

2019年，Mac升级系统`Catilina`，默认shell从`bash`更改为了`zsh`，配置有差异。[详见](https://support.apple.com/zh-cn/HT208050)

### 显色

原配置文件

- `.bash_profile` -> `.zprofile`
- `.bashrc` -> `.zshrc`

不再打算自定义，[拿来主义](https://github.com/robbyrussell/oh-my-zsh)：

- 安装

``` bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

- 修改`.zshrc`配置文件，并修改`ZSH_THEME`选项，具体的样式[参考](https://github.com/robbyrussell/oh-my-zsh/wiki/Themes)。我比较喜欢`awesomepanda`样式

### 整合shell命令

常用到`touch`（创建文件）、`open`（打开文件）的命令。

比如，准备写markdown，就得`touch xxx.md && open xxx.md`。因为懒，我希望可以`to xxx.md`。因`alias`不能传递参数，只能写shell函数，如下：

```bash
to(){
  touch $1 && open $2
}
```

解析：

- `to(){…}`为函数、`$1`为参数

### Tab补全时忽略大小写 

```bash
# 在~/.inputrc中修改
set completion-ignore-case On
```

### 强制终止进程

```bash
# linux
ps -ef | grep stone 
kill -9 pid

# window 需在power shell进行
netstat -ano | findstr 8080
kill pid
```

## 旧的配置（bash版本）

- 所有更改，应写到`~/.bash_profile`配置文件中
- `source ~/.bash_profile`：配置对当前用户立即生效
- 配置优先级<small>（由上往下，优先级依次降低）</small>：
  - `/etc/bashrc`：系统级配置
  - `~/.bash_profile`：用户级配置
  - `~/.bashrc`：用户bash级

## 显色

原因：原控制台只有黑白色，无法找到命令行分割点。

```bash
export PS1='\[\e[36;1m\]\u@:\w> \[\e[0m\]'
```

解析：

- `\[\e36;1m\]`和`\[\e[0m\]`为一对颜色标签，比如：原谅绿：`\[\e32;1m]`和`\[\e[0m\]`
- `\u`为当前账号名称，`\w`为工作目录
- `@:>`文字，无特殊含义

结果：

<div class="shell ">
  <span class="prefix">edeity@:~></span>
</div>

### ls显色

用于区分**普通文件**和**文件夹**：

```bash
alias ls='ls --color-auto' # linux
alias ls='ls -G' # macOX
```

