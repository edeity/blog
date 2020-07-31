---
title: React基础再复习
link: review_react
date: 2017-08-12
categories: 学习
tags: [react, js]
---

因工作中用的框架不是react，所以0.14版本后，React很多基础或新特性都比较模糊。刚好IUAP在分享React基础，去旁听了一下，记录于此。在此基础上作一个拓展复习，以加深印象。



## 创建组件方式

-  React.Component || createReactClass

  最常用的组件，前者为ES6的写法，后者为ES5的写法；

- Stateless Compoennt

  ```javascript
  const HelloWorld = ({name}) => (
   <div>{`Hi ${name}`}</div>
  );
  ```

  基本上等同于模板，没有`compoenentWillReveiveProps`，`shouldComponentUpdate`，`componentWillUpdate`，`componentDidUpdate`等生命周期，对性能是极大的提升

- React.pureComponent

  ```javascript
  class HelloWorld extends React.PureComponent {}
  ```

  不同于Component，PureComponent在`diff`两个state或props时，采用的是浅比较，代码类似于`newState !== oldState && update()  `；除了使用PureComponent外，不少地方都提到可以用[Immutable.js](http://facebook.github.io/immutable-js/docs/#/)可持久化数据集来减少`shouldComponentUpdate`的消耗；

- HOC高阶组件：[1](https://reactjs.org/docs/higher-order-components.html)，[2](https://segmentfault.com/a/1190000009386662)、[3](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e)

  将组件创建过程函数话。应该归属于一种设计模式。文章2中提出，HOC能够于`代码重用`，`渲染劫持`，`抽象state`，`控制props`，具体应用还需进一步实践。

-  web组件：[1](https://reactjs.org/docs/web-components.html)

   一般地，用于嵌入第三方web组件

-  createPortal（并不是创建组件的方式）：[1](https://reactjs.org/docs/portals.html)

   创建存在于其他DOM结构的子组件，而生命周期和状态仍属于其挂在的组件中；类似于Context

   ​

## PropTypes

Link: [1](https://reactjs.org/docs/typechecking-with-proptypes.html)

一般作用于接口定义，定义后会进行基本的类型检测，对于不通过的类型会给予warn或error的提示：

```javascript
import propTypes from 'prop-types';
class HelloWorld extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.name}</h1>
    );
  }
}
HelloWorld.propTypes = {
  name: PropTypes.string
};
```

- 类型
  - 支持检测的类型有：数组`array`，布尔`bool`，方法`func`，数值`number`，对象`object`，字符串`string`，属性键`symbol`
  - 突然想到了JS的基本类型，基本类型应不存在包含状态；故为 `Number`， `Boolean`， `String`， `Synmbol`， `Null`， `Undefined`

## fiber算法

- 痛点：虚拟DOM变更过多而导致页面卡顿的情况；
- 解决思路：将变更的虚拟DOM分解为更小的粒度（这些粒度可被暂停，弃用，重用，更新等），以通过延迟渲染方式来避免丢帧；
- 复习一下diff算法；[1](https://reactjs.org/docs/reconciliation.html)，[2](https://reactjs.org/docs/optimizing-performance.html)
- 拓展的[fiber](https://github.com/acdlite/react-fiber-architecture)算法