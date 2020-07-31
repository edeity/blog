---
title: React初探：写一个“mou”
link: learn_react_by_code_a_mou
date: 2015-12-09
categories: study
tag: [js, react, markdown, app]
---



![mouer-preview](https://edeity.oss-cn-shenzhen.aliyuncs.com/2015/mou.jpg)

<div class="img-desc">
  简陋的Web Mou
</div>



## 初步

### react?

要用react， 得先了解react

facebook如此形容react

> We built **React** to solve one problem: *building large applications with data that changes over time*.

关键短语 :

- building large applications(大型的应用)
- data that changes over time(数据改变频繁)

表示看不懂，只好在心里默念

- mou， mou， mou

无视一切，继续前进

### mou界面

从mou官网盗图一张:

 ![mou](https://edeity.oss-cn-shenzhen.aliyuncs.com/2015/mou.png?x-oss-process=style/preview)

所以[布局]应该是

- StatePanle（上）：状态栏，负责显示状态
- InputPanel（左）：编辑框，负责用户输入
- RenderPanel（右）：显示框，负责渲染markdown文档

伪代码如下

```html
<Mou>
    <StatePanel/>
    <InputPanel/>
    <RenderPanel/>
</Mou>
```

用了大半年的`div`，html里面可没有`<InputPanel>`，`<RenderPanel>`啊？

这就是react的作用之一，无中生有，自定义一个伪html标签，以便以后想用就用，就像用html标签一样简单；具体的做法是：

```javascript
class Mou extends React.Component {
	render() {
		return (
			<div id="mou-app">
				<StatePanel/>
				<InputPanel/>
				<RenderPanel/>
			</div>
		)
	}
}
class StatePanel extends React.Component {
	render() {
		return (
			<div id="state-panel"></div>
		)
	}
}
class InputPanel extends React.Component {
	render() {
		return (
			<textarea id="input-panel"></textarea>
		)
	}
}
class RenderPanel extends React.Component {
	render() {
		return (
			<div id="render-panel"></div>
		)
	}
}
React.render(<Mou/>, document.getElementById('app'));
```

我又开始懵逼了：不是说前端js一统天下吗？`class`，`extends`又是什么东东？

其实，上面的“语言”可分为两部分：

1. 新鲜出炉的**EcmaScript2015**，俗称[ES6](http://es6.ruanyifeng.com/)，最新的javascript标准， 如：
   - `class StatePanel extends React.Component`；
2. react专用的模板（[jsx](http://reactjs.cn/react/docs/jsx-in-depth.html))，（web标准可不支持自定义标签，jsx的作用是编写jsx，通过解析，识别伪标签）：
   - `render(){return (<div id="render-panel"></div>)}`：

### css美化一下

css如下:

```css
/*布局Start*/
body {
    width: 984px;
    margin: 0 auto;
    padding: 30px;
}
#mou-app {
    width: 984px;
    height: 665px;
}
#state-panel {
    width: 984px;
    height: 23px;
    border-top: 1px solid #DADADA;
    border-bottom: 1px solid #C0C0C0;
}
#input-panel, #render-panel {
    float: left;
    width: 430px;
    height: 580px;
    padding: 30px;
}
#input-panel {
    border: none;
    border-right: 4px solid #f2f2f2;
}
/*布局End*/
/*样式START*/
body {
    background-color: #F5F5F5;
}
#mou-app {
    border-radius: 5px;
    box-shadow: 0 10px 20px 10px #919191;
    overflow: hidden;
}
#input-panel {   
    outline: none;
    resize: none;
    font-size: 1.1em;
}
#render-panel {
    background-color: white;
    
    overflow: scroll;
}
#state-panel {
    background: linear-gradient(#F5F5F5， #D4D4D4);
    background: -webkit-linear-gradient(#F5F5F5， #D4D4D4);
    color: #021000;
    text-align: center;
}
/*样式END*/
```

好了，一个没有灵魂的mou界面终于出厂了。

<iframe height="535" scrolling="no" src="//codepen.io/edeity/embed/dGOyNj/?height=535&theme-id=0&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="false" style="width: 100%;">See the Pen <a href="http://codepen.io/edeity/pen/dGOyNj/" target="_blank" rel="external">dGOyNj</a> by 李健乐 (<a href="http://codepen.io/edeity" target="_blank" rel="external">@edeity</a>) on <a href="http://codepen.io" target="_blank" rel="external">CodePen</a>.<br></iframe>
## 实时显示

> 单单是静态的页面可不行! 得让它动起来!  – 当年被忽悠学习javascript的言语

mou最基本的功能有什么？实时显示啊！

```javascript
class Mou extends React.Component {
	constructor() {
		super();
      	// 定义状态，content为需要显示的markdown
		this.state = {
			content: '',
		}
	}
  	// 当content改变时，更新状态(state)
	handleContentChange = (content) => {
		this.setState({content: content});
	}
	render() {
		return (
			<div id="mou-app">
        <StatePanel/>
				<InputPanel  content={this.state.content} 
          handleContentChange={this.handleContentChange}/>
				<RenderPanel content={this.state.content}/>
			</div>
		)
	}
}
class StatePanel extends React.Component {
	render() {
		return (
			<div id="state-panel"></div>
		)
	}
}
class InputPanel extends React.Component {
	onChange() {
		this.props.handleContentChange(this.refs.input.value);
	}
	render() {
		return (
			<textarea id="input-panel" ref='input' 
          onChange={this.onChange.bind(this)}></textarea>
		)
	}
}
class RenderPanel extends React.Component {
	render() {
		return (
          	// 显示框的内容和content绑定
			<div id="render-panel">{this.props.content}</div>
		)
	}
}

React.render(<Mou/>, document.getElementById('app'));
```

以上代码的意思是，`Mou`拥有一份content，当`InputPanel`的content改变（`onChange`）时，会相应的更改`Mou`的content（`this.props.handleContentChange`），进而修改`Mou`的state状态，从而触发react框架的默认行为：当state改变时，将触发所有与state绑定的props内容，即`RenderPanel`中的`this.props.content`；

此时，在`InputPanel`输入文字，便能在`RenderPanel`中同步显示；

<iframe height="535" scrolling="no" src="//codepen.io/edeity/embed/vLyYRP/?height=535&theme-id=0&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true" style="width: 100%;">See the Pen <a href="http://codepen.io/edeity/pen/vLyYRP/" target="_blank" rel="external">vLyYRP</a> by 李健乐 (<a href="http://codepen.io/edeity" target="_blank" rel="external">@edeity</a>) on <a href="http://codepen.io" target="_blank" rel="external">CodePen</a>.<br></iframe>
### Jquery?

```javascript
// 以上内容转换成jquery的写法是：
$('#input-panel').change(function() {
    var value = $(this).value();
    $('#render-panel').text(value);
})
```

WTF? 只需3句话？那我还用什么React，Jquery搞起！

别急，别急，这么想：当你的页面拥有div1，div2，div3，div4，div5等众多元素时，如

- 当div1.props1改变时，修改div2.props1
- 当div2.props2改变时，修改div3.props2
- 当div4.props3改变时，修改div3.props3和div5.props3
- 当div1.props4改变时，修改div2~div5的props4

于是你的jquery代码变成了

```javascript
$('.div1').change(function(){$('.div2')...})
$('.div2').change(function(){$('.div3')...})
$('.div4').change(function(){$('.div3')...$('.div5')...})
$('.div5').change(function(){$('.div2')...$('.div3')...$('.div4')...($('.div5'))})
...
```

假如还有div6，div7，div8…呢？选择多了，整个人就蒙圈了。可能在change事件中，多选了div6，少选了div8等。

而react的做法是，子div的属性与父div绑定，当子属性（props）变更时，通知父状态（state），然后由react来通知所有与该`state`绑定的`props`，并判断是否需要重新渲染。

打个比方是：古时，当匈奴入侵时，当地的县令不需要通知哪个邻县来救火，哪个军营来增兵，而是一发奏折交给朝廷，由朝廷按照之前制定的御敌规章（state与props的绑定关系），来通知对应的单位火速增援；这样一来，既防止被入侵的县令随心所欲调动资源，乱了朝纲（`$('错误的div')`），也保证处于同一防线的所有单位都能收到通知(`react会通知所有与state绑定的props`)。

当然，这样做的前提是：奏折得像QQ一样快，还不能过分影响效率；否则，县都被攻陷了，奏折还没有到达朝廷。所幸的是，react的diff算法满足了这一点。

恰如react所描述：react就是用来解决__状态多__，__变更快__的大型app。

> We built **React** to solve one problem: *building large applications with data that changes over time*.

### 组件化

然而react还有一个明显优点，当我们想在别的地方重用`<Mou>`这个markdown编辑器时，需要怎么做？仅需在其他class的`render`方法里，`function render(){return <Mou/>}`，信手沾来！这就是react组件化的魅力，无需套用js的其他设计模式，代码已经被完美地封装到了一个伪html标签里。拿来即用，挥之即去！

至此， 我以我简陋的理解， 解析了 :
为什么要用50行react代码， 做5行html+3行jquery代码就可以完成的事， 大概可分为

- 组件化， 便于重用（也有助于BUG定位）
- 状态管理， 面对众多状态变更时游刃有余

当然， react提供给我们的不止这些， 比如官网讲述的 `virtual dom`， `data flow`，这些，我都是不清楚的（手动滑稽）



## 其他功能

然而，我只希望应用更拉风一点 。
说好的markdown工具， markdown呢？ markdown呢？我特么的markdown呢？

### marked

好吧， 看似拉风的工具， 其实都是建立在巨人的肩膀上的；
所以我很厚脸皮地用到了markdown编译器: [marked](https://github.com/chjj/marked)， 它能够将诸如

```
# 博主你不要脸

```

转化为

```
<h1>博主你真的不要脸</h1>

```

-  将

```javascript
class RenderPanel extends React.Component {
	render() {
		return (
			<div id="render-panel">{this.props.content}</div>
		)
	}
}
```

更改为:

```javascript
class RenderPanel extends React.Component {
	markup(str) {
		return {__html: marked(str)}// 调用marked.js的marked方法
	}
	render() {
      	// 通过dangerouslySetInnerHTML，将渲染后的markdown文本赋值给RenderPanel
		return (
			<div id="render-panel" 
          dangerouslySetInnerHTML={this.markup(this.props.content)}></div>
		)
	}
}
```

注：出于安全考虑，React不允许随便渲染html文档，必须显式调用`dangerouslySetInnerHTML`

### markdown.css

虽不是github 代（tong）码（xing）托（jiao）管（you）平台的忠实粉丝， 没事逛（♂）逛（♂）github的习惯还是有的， 所以比较钟情于github markdown的css样式， 废话不多说， 偷! -> [剽窃地址](https://github.com/sindresorhus/github-markdown-css)

- 添加className

```javascript
// class RenderPanel
<div id="render-panel"  
dangerouslySetInnerHTML={this.markup(this.props.content)}></div>
```

更改为：

```javascript
// class RenderPanel， 添加class样式
<div id="render-panel" className="markdown-body" 
dangerouslySetInnerHTML={this.markup(this.props.content)}></div>
```

注意，因为`class`是js的关键字，所以在React jsx模板中，我们只能用`className`来替代`class`

### 同步滚动

至此， 我满怀喜悦地向我们班大神seal同学分享我的成果， 他也满怀喜悦地试了一下，发现不能同步滚动， 然后就没有然后了。T_T

其实实现同步滚动并不复杂，最简单的思路:

虽然`InputPanel`和`RenderPanel`两人高度不同，但百分比都是一样的啊（100%），所以滚动的百分比一样即可：

最后的js代码：

```javascript
class Mou extends React.Component {
	constructor() {
		super();
		// 新增核心资料： scrollRatio，高度系数
		this.state = {
			content: '',
			scrollRatio: 0
		}
	}
	handleContentChange = (content) => {
		this.setState({content: content});
	}
	//
	handleScroll = (scrollRatio) => {
		this.setState({scrollRatio: scrollRatio});
	}

	render() {
		return (
			<div id="mou-app">
				<StatePanel/>
				<InputPanel  content={this.state.content} 
				handleContentChange={this.handleContentChange} 
				handleScroll={this.handleScroll}/>
				<RenderPanel content={this.state.content} 
          		scrollRatio={this.state.scrollRatio}/>
			</div>
		)
	}
}
class StatePanel extends React.Component {
	render() {
		return (
			<div id="state-panel"></div>
		)
	}
}
class InputPanel extends React.Component {
	onChange() {
		this.props.handleContentChange(this.refs.input.value);
	}
	onScroll(event) {
		/* 通过参数event.nativeEvent.target获得真实的html对象， 即<textarea>；
		* 获取InputPanel此时的高度
		*/
		var target = event.nativeEvent.target;
		// 计算高度系数
		var scrollRatio 
        	= target.scrollTop / (target.scrollHeight - target.clientHeight);
		this.props.handleScroll(scrollRatio);
	}
	render() {
		return (
			<textarea id="input-panel" ref='input' 
          	onChange={this.onChange.bind(this)} 
  			onScroll={this.onScroll.bind(this)}></textarea>
		)
	}
} 
class RenderPanel extends React.Component {
	componentDidUpdate() {
		var render = this.refs.render;
		// 对应RenderPanel的高度系数
		render.scrollTop = this.props.scrollRatio * 
          (render.scrollHeight - render.clientHeight);
	}
	markup(str) {
        return {__html: marked(str)}
    }
	render() {
		return (
			<div id="render-panel" ref="render" className="markdown-body"
          		dangerouslySetInnerHTML={this.markup(this.props.content)}>
          </div>
		)
	}
}
React.render(<Mou/>, document.getElementById('app'));
```

## 最终的结果

<iframe height="535" scrolling="no" src="//codepen.io/edeity/embed/bEBGyw/?height=535&theme-id=0&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="false" style="width: 100%;">See the Pen <a href="http://codepen.io/edeity/pen/bEBGyw/" target="_blank" rel="external">bEBGyw</a> by 李健乐 (<a href="http://codepen.io/edeity" target="_blank" rel="external">@edeity</a>) on <a href="http://codepen.io" target="_blank" rel="external">CodePen</a>.<br></iframe>
## 尾声

很高兴你能在我的胡言乱语中坚持到了最后，末了，附上珍藏在我小抽屉的一句话，以此共勉：

> For me， I don’t want to get a job; I want to get invited to great jobs. I don’t want to go to work; I want to go to work with talented people. And I don’t want to be satisfied with knowing enough to do the work that needed to be done yesterday; I want to know how to do the work that will need to get done tomorrow.
>
> 对于我来说，我需要的不是工作，我想要的是被邀请去做一份牛逼的工作。我想要的不只是去干活而已，而是想和一群牛逼的人一起做牛逼的事。我不想仅仅满足于用已有的知识来完成现在的工作，而是希望掌握更多的知识来解决未来将会面对的问题。

### 其他

- 吃我一记大Vuejs：看看别人家聪明孩子是怎么用vuejs编写的[极简的 Markdown 编辑器](http://cn.vuejs.org/examples/)
- 更加友好的markdown编辑器[Typora](http://www.typora.io/)，在mac，window，linux下均有对应的安装包哦~强烈推荐