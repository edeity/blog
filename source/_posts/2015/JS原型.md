---
title: 理解Function和Object的原型关系
link: js_prototype
date: 2015-11-09
categories: study
tags: [js, prototype]
---



源于某道js笔试题

```javascript
//题目
var foo = {}
var F = function(){}
var f = new F()
Object.prototype.a = function(){}
Function.prototype.b = function(){}

//每次调用以下一个方法,哪些方法会报错
foo.a()
foo.b()
F.a()
F.b()
f.a()
f.b()
```

答案：

```javascript
// foo.a(), F.a(), F.b(), f.a()调用成功
// foo.b(), F.b()调用失败
foo.a()	//=> 
foo.b() //=> TypeError: foo.b is not a function
F.a() //=>
F.b() //=>
f.a() //=>
f.b() //=> TypeError: f.b is not a function

```

## 关于原型链的思考

JS中，一个 **变量** 或 **方法** 的搜索是基于原型链的，如：`a.b()`，其伪代码：

``` javascript
// 假设a自能调用自身方法，a.b()类似于
while(a !== null) {
  a.hasOwnProperty(b) ? a.b() : a = a.__proto__;
}
```

为此，有句调侃javascript的话

> 万物皆源于无（null）

## 解析

要理解这道题目，最基本的思路在于：**弄懂代码执行后，原型链的状态**

关键点又有两点

1. **执行前**的原型链状态
2. **new**关键字的作用

### 执行前的原型状态

es规范：请参考下面代码

```javascript
Object.__proto__ === Function.prototype; //=>true
Object.__proto__ === Function.__proto__; //=>true
Function.__proto__.__proto__ === Object.prototype; //=>true
Function.__proto__.__proto__.__proto__ === null; //=>true
```

### new关键字所起的作用

- 一般地:

  ```javascript
  var a = new A()

  //类似于
  var a = {}
  a.__proto__ = A.prototype
  A.prototype.call(a) //该句并不影响原型关系，可暂时忽略
  ```

- 对于`new Function`，则存在一点不同

  ```javascript
  var f = function(){}  //或var f = new Function()
  	
  //类似于	
  var f = {}
  f.__proto__ = Function.prototype
  f.prototype = {} // 独有
  Function.prototype.call(f）
  ```



### 执行前后的原型链变化

- 执行前（图1）
  ![执行前](https://edeity.oss-cn-shenzhen.aliyuncs.com/2015/closure-before.jpg)
- 执行后（图2）
  ![执行后](https://edeity.oss-cn-shenzhen.aliyuncs.com/2015/closure-before.jpg)

由图，可以很轻易得出

- `foo.a()`会被调用成功
- `foo.b()`会报错