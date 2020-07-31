---
title: JS基本类型 & 遍历
link: js_type
date: 2016-09-27
categories: study
tags: [js, type, iterator]
---

基本功不实，于此小记：

## type VS toString

### typeof

```javascript
typeof 1; // "number"
typeof '1'; // "string"
typeof null; // "object"
typeof undefined; // "undefined"
typeof {}; // "object"
typeof []; // "object"
typeof function(){}; // "function"
```

### Object.prototype.toString

```javascript
Object.prototype.toString.call(1); // "[object Number]"
Object.prototype.toString.call('1'); // "[object String]"
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
Object.prototype.toString.call({}); // [object Object]
Object.prototype.toString.call([]); // "[object Array]"
Object.prototype.toString.call(function(){}); // "[object Function]"
```

由此可见，`Object.prototype.toString`的可靠性要高于`typeof`



## 兼容性

### JQuery.type

在JQuery中，对类型的判断主要基于`type`方法：


```javascript
function type(obj) {
 if ( obj == null ) { return obj + "";}
// Support: Android<4.0, iOS<6 (functionish RegExp)
return typeof obj === "object" || typeof obj === "function" ?
	class2type[ toString.call( obj ) ] || "object" :
	typeof obj;   
}
```

### Function

如，据史书记载，`typeof`在判断`Function`时，存在兼容性问题：

> - FireFox：在HTML的<object>元素上使用typeof的话，会返回function
> - IE：如果对其他窗口（比如iframe）的不存在的对象进行类型判断，该类型会返回unknown
> - Safari：DOM的NodeList是一个function

### Array

毫无疑问，对于ES5+ ，[Array.isArray()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)是最好用的方法，

## 遍历

鉴于总是忘记用法，特总结于此：

对于一般的遍历，JS已提供具有可读性的API，如下：

- some：`IE9+`  `boolean` ：某一项满足，返回`true`，不继续执行
- every：`IE9+` `boolean` ：某一项不满足，返回`false`， 不继续执行，所有项目满足，返回`true`
- forEach: `IE9+` `boolean` ：执行所有项，无返回值，`undefined`
- map: `IE9+` `object` ：返回index数组，并标记是否满足条件
- filter: `IE not support` `object` ：返回满足条件的项

```javascript
const numArr = [1, 2, 3, 4]
const test = (num) => { console.log(num); return num > 2}}
numArr.some( test ) // log: 1, 2, 3; return: true
numArr.every( test ) // log: 1; return: false
numArr.forEach(( test ) // log: 1, 2, 3, 4; return : undefined
numArr.map( test ) // log: 1, 2, 3, 4; return [0: false, 1: false, 2: true, 3: true]
numArr.filter( test) // log: 1, 2, 3, 4; return [3, 4]
```

