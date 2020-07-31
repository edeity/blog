---
title: JS中的闭包
link: js_closure
date: 2015-12-30
categories: study
tags: [js, clourse]
---

原以为这也是闭包

```javascript
var a = 'a';
function B() {console.log(a);}
B();
```

闭包不成立证明：

```javascript
var a = 'a';
function B() { console.log(a); }
B(); // a
a = 'b';
B(); // b
// 在 function B被创建的那一刻，a对应的值并没有被“暂存”起来;
```

闭包的标准：__是否创建封闭的空间，暂存闭包中被创建的变量属性__；

证明条件：

1. 存在两个或两个以上作用域
2. 引用不包含自身或子作用域的变量

### 理解闭包的三个基本事实

> 1. 函数可以引用定义在其外部作用域的变量
> 2. 闭包比创建它们的函数有更长的生命周期
> 3. 闭包在内部存储其外部变量的引用，并能读写这些变量

结合`例子：`

```javascript
function A() {
    var a = 0;
    var B = {
        increase: function () {
            // 1, 3
            a++;
            return B;
        },
        result: function () {
            return a;
        }
    }
    return B;
}
// 1, 2, 3
var c = A().increase()
    .result();
console.log(c); // => 1
```



### 几个有趣的例子

- 封装

```javascript
function A() {
    var result = 0;
    this.add = function(b) {
        result+=b;
    }
    this.get = function(){
        return result;
    }
}
var a = new A();
a.add(3);
a.get(); // 3
a.result; // undefined
```

- 暂存变量

```javascript
function memorize(a) {
    return function (b) {
        console.log(a + b);
    }
}
var a1 = memorize('a1');
a1('b'); // a1b
a1('b1');//a1b1
var a2 = memorize('a2');
a2('b'); // a2b
```

- 函数式累加器

```javascript
function add(a, b) {
    function add(a, b) {
        if(typeof a === "undefined") 
          throw Error("function should have at least 1 arguments");
        b ? result =  a + b: result += a;
    }
    var result = 0;
    add(a, b);
    return tmp = {
        add: function (a, b) {
            add(a, b);
            return this;
        },
        toString: function () {
            return result;
        }
    }
}
console.log(""+add(1, 2).add(3));
```

附：MDN中关于[closure的描述](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
