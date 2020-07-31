---
title: MVVM
link: learn mvvm
date: 2018-03-16
categories: 学习
tags: [study]
---

我对其最基本的了解是：

一`input`（视图代表），一`data`（数据代表）：

1. 变更`data`时，`input`值变更
2. 触发`input`变更事件时，`data`变更

对于第二点，非常好实现，一般在语法Compile（eg：data-*），绑定onChange和数据

但对于第一点，因为在ES5之前，对data的更改没有触发某种机制，从而更新视图。

因此，一般并不是直接更改data，而是通过类似`setValue(key, value)`来来代表data的更改，在setValue时，触发视图的变更。如老一点的框架`knockout`，是通过`observe()`返回一个函数，通过调用`返回函数`来达到data变更时触发视图变更；

```javascript
let a = ko.observe(1)
a(2) // 触发视图变更
```

a不是`data`，而应作为viewModel存在的。在我的理解中，viewModel的存在是因为原始数据（eg：data）和视图（eg：input）不能、也不必要产生双向绑定，而产生的代理机制层。(至于它们之间是双箭头，或者两个单向箭头，并不重要)

基于以上解决，来阐述以下框架是否为MVVM：

### React

```
class Test extends Component {
    static = { test: ""}
    render() {return <input defaultValue={this.state.test}></input>}
}
```

data：state、view：render方法渲染后jsx

基于`data->view`，容易得出，虚拟DOM以及其diff算法，可作为变更的中间代理

求逆过程，`view->data`：然而，view的变更，如input输入字符，只会产生onChange事件，只有在onChange事件中显式调用setState，才会变更data，而这个动作不是自动完成的。即`view->data`不成立。

结论：React非MVVM

### Vue

data: view中的data，view：vue语法渲染后的视图

因为ES5中关于[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)的存在，可以轻松通过`getter`和`setter`获得data的读和写的回调，自然而然可以实现`data`和`view`的双向关联，data.key，不再是一个简单的对象，而作为了viewModel的存在

结论：Vue属于MVVM

### Ag

在你没用过ag的前提下去判断一个框架是否属于Mvvm是不可能的，我只能运用了拾人牙慧之方法。参见[Change Detectior - 1](https://segmentfault.com/a/1190000008747225)；ag2通过zone重写了以下方法：`setInterval、clearInterval、setTimeout、clearTimeout；alert、prompt、confirm；requestAnimationFrame、cancelAnimationFrame；addEventListener、removeEventListener`，在以上方法内，Ag会检测数据模型的变更，进而触发视图的变更。基于这点，暂得出结论：Ag属于MVVM