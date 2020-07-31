---
title: react-redux实现原理
link: code_react_redux
date: 2018-03-14
categories: study
tags: [react, redux, code]
warn: 
---

易知，`react-redux`是将`react`组与redux关联的类库。

> Provider是顶层组件，将store作为上下文提供给全局共享，而Connect组件是局部组件，将某个react组件包装起来，传递指定的state和props给该组件访问

基本代码如下：

```jsx
<Provider store={store}>
    <YourApp/>
</Provider>
```

在`<YourApp/>`或后面的组件中，会通过`connect`方法从store中抽取部分状态（一般为该组件需要的最小状态集），注入到该组件的`props`，代码如下

```javascript
class YourApp extends Compoenent {
    render(){return ...}
}
function mapStateToProps(state) {
    return {
        xxx: state.xxx
    }
}
export default connect(mapStateToProps, ...actions)(YourApp)
```

所以，我比较好奇以下几点：

1. Provider如何提供全局store
2. 如何通过connect向props注入属性


## context

在React中，有一种隐藏的神奇东西，名为`context`，参见[文档](https://reactjs.org/docs/context.html#how-to-use-context)，其作用便是：假若最外层的组件（一般为根节点）实现了`getChildContext`和`childContextTypes`，后续的组件都能通过`context`获得`getChildContext`中声明并返回的属性，官方示例：

- 父组件实现`getChildContext`，并返回`color`属性

```jsx
class MessageList extends React.Component {
  getChildContext() {
    return {color: "purple"}; // 
  }

  render() {
    const children = this.props.messages.map((message) =>
      <Message text={message.text} />
    );
    return <div>{children}</div>;
  }
}

MessageList.childContextTypes = {
  color: PropTypes.string
};
```
- 所有子组件均能读取`this.context.color`的值
```jsx
class Button extends React.Component {
  render() {
    return (
      <button style={{background: this.context.color}}>
        {this.props.children}
      </button>
    );
  }
}
```

其中`color`作为`MessageList.childContextTypes`定义的属性，通过`getChildContext`被返回去了；只要Button被包含在MessageList内（无视depth层级），都能通过`this.context.color`获得`purple`的颜色。

## Provider

`Provider`只需实现`context`基本接口，即可随心所欲地暴露内部的属性。源码如下：

```javascript
export function createProvider(storeKey = 'store', subKey) {
    const subscriptionKey = subKey || `${storeKey}Subscription`
    class Provider extends Component {
        getChildContext() {
            return { [storeKey]: this[storeKey], [subscriptionKey]: null }
        }

        constructor(props, context) {
            super(props, context)
            this[storeKey] = props.store;
        }

        render() {
            return Children.only(this.props.children)
        }
    }
    Provider.propTypes = {
        store: storeShape.isRequired,
        children: PropTypes.element.isRequired,
    }
    Provider.childContextTypes = {
        [storeKey]: storeShape.isRequired,
        [subscriptionKey]: subscriptionShape,
    }

    return Provider
}
```

Provide通过实现`getChildContext`将`store`作为`context`传递给所有子孙组件。

注：

- 虽然日常开发中用到context的地方不多，但几个常用的api是可以获得context的，如：`constructor(props，context)`、`componentWillReceiveProps(nextProps, nextContext)`、`shouldCompoentUpdate(nextProps, nextState, nextContext)`、`componentWillUpdate(nextProps, ,nextState, nextContent)`
- React组件中，假若`state`或`props`没有改变，`shouldComponentUpdate`会终止子组件的更新。也就是说，只要`state`或`props`没有变更，即使`context`变更了，后续子组件也不会重新渲染。因此，`context`并不具备实时性和一致性。**context应作为只读属性传递**。（观点源自：[文档](https://zhuanlan.zhihu.com/p/28037267)）

## HOC高阶组件

`connect`这个方法有什么用？既然能在任何的地方访问到`Provider`的`store`，为什么要声明在`mapToProps`中，又是如何绑定到`props上`的？

为此，不得不提`高阶组件`这个概念，参考[文档](https://reactjs.org/docs/higher-order-components.html)。高阶组件是FB推荐的一种组件形式，我暂将它归类于`装饰者模式`<small>（后续：ES7的`注解`会简化这一定义）</small>。通过传入不同的参数，返回相似的组件。好处是，<strong>以非继承的方式获得并增强原组件的能力，又不修改原组件的内部属性</strong>。与面向对象中的重载或重写不同，FB就高阶组件给出了一下几种建议或约定：

1. 不改变原有属性
2. 传递不相关的props
3. 最大化使用组合
4. 命名上应区分高阶组件和一般组件

注意事项：

1. 不要在`render`中调用
2. 拷贝静态方法
3. `refs`属性不能传递

我认为，FB给出这些建议或约定，原因在于：高阶组件作为原组件的拓展，应尽可能不影响原组件，类似于纯函数。

### 向组件注入props

因`Provider`的存在，只需把`mapStateToProps`中声明的字段，通过`context`传递给`ChildComponent`，并返回该`高阶组件`，即可达到同样的效果，推断代码如下：

```javascript
export default function connect(mapStateToProps， ChildCompnent) {
	const otherProps = mapStateToProps(this.context)
	return <ChildComponent {...otherProps}/>
}
```

那这样的实现方式有什么弊端？在Provider小节中，已经提及，因`shouldComponent`的关系，不能保证`context`的实时性。也即是说，假如如此实现高阶组件，并不能保证组件状态的实时更新。如何来保证context和props或state一样，具备实时性呢？

## connect

还记得`reducer`吗？

一个reducer为一个纯函数，传入旧的state和action，生成新的state。

redux的[官方例子](https://cn.redux.js.org/)：

```javascript
function counter(state = 0, action) {
  switch (action.type) {
  case 'INCREMENT':
    return state + 1;
  case 'DECREMENT':
    return state - 1;
  default:
    return state;
  }
}

// 创建 Redux store 来存放应用的状态。
// API 是 { subscribe, dispatch, getState }。
let store = createStore(counter);

// 可以手动订阅更新，也可以事件绑定到视图层。
store.subscribe(() =>
  console.log(store.getState())
);

// 改变内部 state 惟一方法是 dispatch 一个 action。
// action 可以被序列化，用日记记录和储存下来，后期还可以以回放的方式执行
store.dispatch({ type: 'INCREMENT' }); // 1
store.dispatch({ type: 'INCREMENT' }); // 2
store.dispatch({ type: 'DECREMENT' }); // 1
```

>  在redux中，通过disptach分发 action。这是触发 state 变化的唯一途径



官方图解如下：

![redux流程](https://sfault-image.b0.upaiyun.com/205/583/2055834352-59daefda643b8_articlex)

`component->action->reducer->store`的过程是`订阅-分发`设计模式的具体应用，可参考[文章（含源码实现）](https://www.cnblogs.com/lovesong/p/5272752.html)。在此不再展开。

组件的`shouldUpdate`不仅仅依赖于`props`和`state`，也依赖于上述设计模式中分发的`context`。在React原有基础上，通过分发来保证在store中声明的`context`的实时性，并触发更新。（具体代码可参考：`connect.js`以及`connectAdavance.js`）



## 后续（2018.07.10）

基于这篇文章：[react-redux源码分析](https://zhuanlan.zhihu.com/p/39289157)

大致的实现原理和我的论（yi）述（yin）相差不大，但是包含了很多细节。交代了触发subscribe后，通过`forceUpdate`和`setState`触发重绘，以及子孙容器的重绘机制是基于父HOC重绘机制listener优化方式。