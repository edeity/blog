---
title: throttle细节小记
link: detail_of_throttle
date: 2020-03-11
categories: work
tags: [throttle]
---

说起来也惭愧，我一个工作三年有余的人，竟然hold不住只有二三十行的`throttle`函数。自从工程用了我写的throttle后，遇到的几个坑或bug，自挂东南，自以警示世人。

先说定义，`throttle`，译**节流**，基本用法 :

```javascript
let throttleFunc = throttle(func, 60);
```

无论调用多少次`throttleFunc`，`func`在规定的时间（60ms）内只执行一次。常见的用法有，前端页面动效等变更，一般情况下，保证60FPS即可，即`let throttleRender = throttle(render, 1000 / 60)`。

废话不多讲，看坑。

## Round 1：throttle是立即返回

此标题有两层含义

1. 假如函数有返回值，throttle修饰后的函数也应有返回值
2. throttle修饰后的函数，假如满足了调用间隔，应**立即**执行此函数

为啥？因为throttle自带缓存功能！<del>有些人</del>我有时会忘记利用`throttle`有缓存的能力，而直接在函数内赋值给全局变量，再读取全局变量，这样函数就不是纯函数，不优雅。

```js
let foo = 0;
function longTimeToCalc() {
  ++foo;
  return foo;
}
let throttleCalc = throttle(longTimeToCalc, 100);

let a = throttleCalc(); // a = 1
setTimeout(function() {
  let b = throttleCalc(); // b = 1; 即第一次执行的缓存结果
}, 50);
```

至于立即执行，则容易理解，最基础，我们总是希望得到较新值嘛。

```js
let foo = 0;
function longTimeToCalc() {
  ++foo;
  return foo;
}
let throttleCalc = throttle(longTimeToCalc, 100);

let a = throttleCalc(); // a = 1
setTimeout(function() {
  // b = 2; 满足100ms间隔后，应立即执行并返回较新值
  let b = throttleCalc();
}, 110);
```

## Round 2： trailing用法

<del>某些人</del>我不知道，throttle可以设置运行细节，其中一个参数是trailing，默认值为`true`，其作用是：最小时间间隔Xms内假如发生多次调用，是否在最后一次主动调用后，再执行一次该方法。看例子：

```js
let i = 0；
let func = function() { ++i }
let throttleFunc = throttle(func, 100);

throttleFunc();
throttleFunc();

// 在第一次调用后，未满足100ms间隔再次调用时，会在第一次调用后，再调用一次
console.log(i); // 1
setTimeout(function() {
	console.log(i); // 1
}, 50);
setTimeout(function() {
	console.log(i); // 2
}, 110);
```

值得注意，假如没有发生**多次调用**，不会“多”执行的。

```js
let i = 0；
let func = function() { ++i }
let throttleFunc = throttle(func, 100);

throttleFunc();

console.log(i); // 1
setTimeout(function() {
	console.log(i); // 1，因为没有多次调用
}, 110);
```



假如值为false，结果如下：

```js
let i = 0；
let func = function() { ++i }
let throttleFunc = throttle(func, 100, {trailing: false});

throttleFunc();
throttleFunc();

console.log(i); // 1
setTimeout(function() {
	console.log(i); // 1
}, 50);
setTimeout(function() {
	console.log(i); // 1，最后一次调用被取消了
}, 110);
```

<del>非常简单，我明白了。</del>

为什么`traling`要默认为true，因为最后一次调用得到的值，往往是我们最想要的(参考Round 1)。但某些场景下，traling不能为true。比如鼠标区选文字时<small>（按照常规逻辑，应在鼠标按下时进入选区模式，拖拽时选择字符，鼠标松开时结束）</small>：

```js
function onStart() { console.log('start') }
function onMove() { console.log('move') }
function onEnd() { console.log('end') }

// move触发非常频繁，加个限流
const onThrottleMove = throttle(onMove, 1000 / 60);

window.addEventlistener('mousedown', onStart);
window.addEventListener('mousemove', onThrottleMove);
window.addEventListener('mouseup', onEnd);
```

看起来木有什么问题，但是，因为`throttle`触发频繁时往往不是立即调用，会有一定的延后性。所以你可能会看到这样的输出：

```js
start
move
move
move
end // 松开鼠标，且不再移动
move // 多了一个move
```

移动选词时鼠标都松开了，还会多执行一次move选词，不符合常理。因此，那些需要保证**严格执行顺序**的方法，最好`trailing`设置为false。即：

```js
// ...
const onThrottleMove = throttle(onMove, 1000 / 60, { trailing: false });
```



## Round 3： throttle不能绑定多个同源函数

假如使用throttle不优雅，也会产生bug，参考代码：

```js
// 统一的事件入口
function onEvent() {
  switch(event.type) {
    case 'mousemove': {
      // 这里触发一个自定义的‘MOVE’事件
      const selEvent = docuemnt.createEvent('MOVE');
      selEvent.initCustomEvent(type);
      window.dispatchEvent(selEvent);
      break;
    }
    case 'MOVE': {
      console.log('MOVE');
      break;
    }
  }
}

const onThrottleEvent = throttle(onEvent, 30);

window.addEventListener('mousemove', onThrottleEvent);
window.addEventListener('MOVE', onThrottleEvent);
```

初步理解，频繁移动鼠标时，只要保证调用时间间隔满足30ms，便会不断输出`MOVE`。

然而并没有！！`MOVE`触发的次数少得可怜，甚至几秒也不会触发一次。

为什么？因为throttle绑定的是onEvent，以上写法只保证**onEvent触发时间间隔满足30ms**。当频繁移动鼠标时，事件可能进入了`case 'mousemove'`这个逻辑分支，从而霸占了`case 'MOVE'`的生存空间了。所以说，同源函数最好绑定多个函数。

```js
// ...onEvent

const onThrottleEvent = throttle(onEvent, 30);
window.addEventListener('mousemove', onThrottleEvent);

// 不要那么小气，多绑定一次又不会怀孕
const onThrottleMouseMove = throttle(onEvent, 30);
window.addEventListener('MOVE', onThrottleMouseMove);
```

## Round4: Lodash以及Underscore的细小差异

某次发现，lodash的单元测试用例，underscore是有一定概率不满足的：

```js
// 以下是lodash的测试用例
it('subsequent calls should return the result of the first call', (done) => {
    const identity = function(value) {
        return value;
    };
    let throttled = throttle(identity, 32);
    let results = [throttled('a'), throttled('b')];
  
    expect(results).to.eql(['a', 'a']);
    setTimeout(function() {
        let results = [throttled('c'), throttled('d')];
        // underscore: 有一定概率是["b", "b"]
        expect(results).to.eql(['c', 'c']); 
        done();
    }, 64);
});
```
这是不是说underscore不稳定？并不是，经过一番折腾，我发现以下测试用例，underscore符合，lodash则不满足的：
```js
it('[自定义]: 即使阻塞，两次调用间隔也大于最小调用间隔', () => {
    let callCount = 0;
    let timeout = false;
    let throttled = throttle(function () {
        callCount++;
    }, 100);
    throttled();
    throttled();
    setTimeout(function () {
        throttled();
        // lodash此时会是3，underscore是2
        expect(callCount).to.be.equal(2);
    }, 220);
  	
    // 通过循环300毫秒来阻塞js（浏览器将推迟调用↑setTimeout）
    let execTime = 300;
    let startTime = Date.now();
    for (let i = 0; timeout !== true; i++) {
        if (Date.now() - startTime > execTime) {
            timeout = true;
        }
    }
});
```

结论：`Lodash`以**调用时**作为基准，调用即重置计时器；而`underscore`会以**调用完成**作为基准，方法调用成功后才重置。

不懂？但我<del>也不是很懂</del>懒得说了，大伙看源码去吧。这个差异会导致一个问题。

```js
function longTimeToExec() {
  // 假设这里的代码耗时200毫秒
}

let lodashThrottleExec = lodash.throttle(longTimeToExec, 100);
let underscoreThrottleExec = _.throttle(longTimeToExec, 100);

lodashThrottleExec();
underscoreThrottleExec();

setTimeout(function() {
  lodashThrottleExec();
  underscoreThrottleExec();
}, 110);
```

在这种场景下，假如使用`lodashThrottleExec`，会有问题。110ms时，即使第一次执行**未完成**，但间隔已满足大于100ms，再次调用`longTimeToExec`会触发执行。当然，所有的throttle都采用了`requestAnimate`，并不会出现卡死现象，但可能浏览器将疲于执行`LongTimeToExec`，使其它方法响应不够及时。

这种差异其实是一种取舍，lodash更保守，调用更频繁，得到的数据也更准确，所以我<del>选择underscore</del>选择在完成时重置计时器，毕竟性能使我头大。

## 结论

也许还有更多的坑没有发现。但经此一役，那些看起来简单的方法，也可能蕴含众多细节。程序猿嘛，就要对代码保持敬畏之心。