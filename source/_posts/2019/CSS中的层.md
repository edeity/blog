---
title: css中的“层”
link: css_of_index
date: 2019-01-16
categories: study
tags: [css]
---

## 前言

自从大四读了一本《CSS权威指南》后，便再也没有系统地学过CSS。无非是在日常工作、练手项目、阅读理解中，看到一些有意思的技巧，便调试观察一下如何实现。有些东西已经略知一二，而有些东西哪怕用了上百次，也未必想清楚。比如：

- 省略号：`overflow: hidden; white-space: no-wrap; text-overflow: ellipsis;`
- BFC清除浮动：`overflow: hidden; _zoom: 1;`
- 万能动效：`transform: all .2s linear;`

我很可能忘记`ellipsis`这个单词，或者分不清是`text-overflow`还是`font-overflow`；相比活蹦乱掉的JS，CSS显然更加地沉稳。虽可以在一些动效上作文章，但大都在时间与产出的较量中，或在性能的瓶颈上，沉寂了。

当然，改变也是有的，比如从`rem`到`viewport`，从`传统的盒子模型`到`flex`或`grid`，或者`postcss`。不久的将来，`css houdini`也可能大放异彩。但我觉得，CSS最为出色的就是其内涵的[哲学思想](http://cncuckoo.github.io/cssthesis/)，令原本很枯燥晦涩难懂的布局或样式，从逻辑代码中剥离出来，以一种描述的方式展开。当然，但凡涉及**哲学**一词，我想表达的就是：虽然我不懂，但我觉得很牛逼。

我依旧相信，深入理解CSS描述背后的基础逻辑，是很有必要的。而在最近的工作中，我遇到了一些奇怪的表现，至少在不同的现代浏览器（Safari 12.0.2、Chrome 7.x）上，具有不同的表现形式，我将其核心的关键字抽取出来，在此一探究竟。这几个主角是：`overflow`、`position`、 `z-index`、`opacity`；

##  代码及表现

### 代码

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=<device-width>, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <style>
        body { margin: 0; }
        * { box-sizing: border-box; }
        #a {
            position: absolute;
            display: inline-block;
            width: 20vw;
            height: 100vh;
            overflow: hidden;
            background: skyblue;
            z-index: 2;
        }
        #b {
            position: fixed;
            top: 10vh;
            left: 30vw;
            background: skyblue;
            z-index: 3;
        }
        #c {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #333;
            opacity: .7;
            z-index: 1;
        }
    </style>
</head>
<body>
    <div id="a">
        <div id="b">
            <ul>
                <li>Chrome: visible & clickable</li>
                <li>Safari: invisible but clickable</li>
            </ul>
        </div>
        <div id="c"></div>
    </div>
    <script>
         var b = document.getElementById('b');
            b.addEventListener('click', function() {
            console.log('test');
        });
    </script>
</body>
</html>
```



### 表现

关于`#b`元素，在各浏览器下的表现为：

- Chrome：可见、 可点击
- Safari：不可见、可点击

## 寻求解析

W3C上关于`Overflow`的描述：

>  This property specifies whether content of a block container element is clipped when it overflows the element's box. It affects the clipping of all of the element's content except any descendant elements (and their respective content and descendants) whose containing block is the viewport or an ancestor of the element. 
>
> 谷歌翻译：此属性指定块容器元素的内容在溢出元素框时是否被剪切。它影响所有元素内容的剪切，除了任何后代元素（及其各自的内容和后代），其包含块是视口或元素的祖先。

从这个描述而言，无论后代设置了何种样式，都应被`overflow:hidden`影响（Safari中的表现），从而不可见。但是，真正构成`#c`不可见的原因，还包括`#a`被设置成了`z-index: 2`；

在我的理解中，`z-index`仅用于同级别的比较；只要父元素A<B（指`z-index`），A的子节点的显示层级均会被B所覆盖。但事实会略有不同。

同样，W3C在`z-index`中有一句说明：

>The stack level of the generated box in the current stacking context is 0. If the box has 'position: fixed' or if it is the root, it also establishes a new stacking context.
>
>谷歌翻译：当前层叠上下文中生成的框的堆栈级别为0.如果框具有“position：fixed”或者如果它是根，则它还会建立新的层叠上下文。

可见，当元素设置了属性`position: fixed`，则会被单独提取出来，形成新的层叠上下文。（Chrome或IE11中的表现）。

在每个层叠上下文中，其排列的顺序时：

>1. the background and borders of the element forming the stacking context.
>2. the child stacking contexts with negative stack levels (most negative first).
>3. the in-flow, non-inline-level, non-positioned descendants.
>4. the non-positioned floats.
>5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
>6. the child stacking contexts with stack level 0 and the positioned descendants with stack level 0.
>7. the child stacking contexts with positive stack levels (least positive first).

大致翻译为：

背景或边界 < 负层级 < 一般元素（非inline） < 浮动元素 < 一般元素(inline) < 一般元素的后代 < 高层级



所以矛盾点应在于：

safari认为`overflow`会影响所有子元素，无论层叠上下文是什么情况；

而Chrome则认为，`position:fixed`后，形成新的层叠上下文，不再受父类的`overflow`影响

### opacity

> If an element with opacity less than 1 is not positioned, then it is painted on the same layer, within its parent stacking context, as positioned elements with stack level 0.If an element with opacity less than 1 is positioned, the ‘`z-index`’ property applies as described in [[CSS21\]](https://www.w3.org/TR/css-color-3/#ref-CSS21),

对于static的元素，设置opacity会导致新的层叠上下文。

> New stacking contexts can be formed on an element in one of three ways:
>
> - When an element is the root element of a document (the `<html>` element)
> - When an element has a position value other than `static` and a z-index value other than `auto`
> - When an element has an opacity value less than `1`
>
> 谷歌翻译：可以通过以下三种方式之一在元素上形成新的堆叠上下文：
>
> - 当元素是文档的根元素（`<html>`元素）时
> - 当元素的位置值不是`static`和z-index值以外的值时`auto`
> - 当元素的不透明度值小于 `1`

## 总结

以下示例包含了opacity、z-index、position等要点，尝试理解它。

```html
<html>
<head>
    <title >层叠上下文</title>
    <style>
        html{padding:100px;}
        .dd{display:block;width:100px;height:100px;text-align:center;font-size:50px;line-height:100px;}
        #a{background:orange;position: relative;}
        #b{background:red; margin-left:10px;margin-top:-90px;opacity:.9;}
        #c{background:blue;margin-left:20px;margin-top:-90px;color:black;z-index:2;}
        #d{background:green;margin-left:30px;margin-top:-90px;color:white;}
        #e{background:darkblue;margin-left:40px;margin-top:-90px;}
        #f{background:deepskyblue;margin-left:50px;margin-top:-90px;}
        #g{background:yellow;margin-left:60px;margin-top:-90px;position:relative;}
    </style>
</head>
<body>
    <div class="dd" id="a"></div>
    <div>
        <div>
            <div>
                <div class="dd" id="b"></div>
                <div class="dd" id="c">C</div>
                <div class="dd" id="d">D</div>
            </div>
            <div class="dd" id="e"></div>
        </div>
        <div class="dd" id="f"></div>
    </div>
    <div class="dd" id="g"></div>
</body>
</html>
```

**假若你有时候搞不清楚其中的关系，不妨为一个元素加一个`position:relative`（手动狗头）**

## 参考

- [Accelerated Rendering in Chrome](https://www.html5rocks.com/zh/tutorials/speed/layers/)
- [What No One Told You About Z-Index](https://philipwalton.com/articles/what-no-one-told-you-about-z-index/)