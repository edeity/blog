---
title: Css小技巧：模糊图片边界
link: gradient_for_img
date: 2016-01-14
categories: study
tag: [css3, gradient]
---



## 场景

- 图片和背景颜色存在明显边界，如图所示

  ![图片与边界-处理前](http://7xp0ez.com1.z0.glb.clouddn.com/before-gradient.png)

突然想到了一个模糊边界的简单办法：利用css3的[gradient](http://caniuse.com/#search=gradients)（IE10+）在图片处覆盖一层div，令背景色从白色（透明）向背景色（需要取色）过渡：

关键代码`background: linear-gradient(top, rgba(255, 255, 255, 0), rgba(26, 22, 20, 1));`

例子代码：

```html
<div class="gradient">
    <img src="./img/coffee.jpg">
</div>
<div class="coffee-describe"></div>
```

```css
.coffee-describe {	background-color: #1B1715;	}
.gradient {	position: relative;	}
.gradient-img img {
    width: 100%;
    /*修复由于baseline导致的图片底部空白*/
    vertical-align: bottom;
}
.gradient-img:after {
    display: block;
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 200px;
    content: '';
    background: linear-gradient(top, rgba(255, 255, 255, 0), rgba(26, 22, 20, 1));
    background: -webkit-linear-gradient(top, rgba(255, 255, 255, 0), rgba(26, 22, 20, 1));
}
```

即可达到如下效果：

![图片与边界-处理后](http://7xp0ez.com1.z0.glb.clouddn.com/after-gradient.png)

## 其他

- img不支持:after（因为img不是block元素）
- 由于[baseline基线问题](http://www.zhihu.com/question/21558138)，img底部存在一行空白，应用`verical-align:bottom`；