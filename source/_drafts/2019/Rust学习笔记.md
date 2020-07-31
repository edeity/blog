---
title: Rust学习笔记
link: study_rust
date: 2019-09-22
categories: study
tags: [rust]
warn: 
---

因为更新了node的版本，某些接口被`deprecate`，导致[插件](https://github.com/edeity/clipboard-file)失效。T—T。只能重写。鉴于多年熬夜的debuff，智商已为负数，学不会C++，只能暂时放弃。又闻Rust也能写插件，且好久没学一门新的语言了，故学习之。将学习记录于此。

## 语法

虽学过多门语言，但脱离IDE还能手撸Hello World的，只剩JAVA和Javascript了。又因作为前端er，故以Js作横向对比。虽多年经验告诉我，此乃大忌，但为了能拉近Rust和前端的距离，我豁出去了，哈哈哈。

[Rust中文](https://www.rust-lang.org/zh-CN/)简介，进能撸嵌入式，退能写Node插件，工作之余还能写写WebAssembly，完全匹配了我的刚需，这大概就是一见钟情了吧。

### 更换源

- cargo：`/User/$userName/.cargo`
- `touch config & open config`

```
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"
replace-with = 'ustc'
[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"
```

### Chaptor 1：summary

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# curl -sSf https://mirrors.ustc.edu.cn/rust-static/rustup.sh | sh -s -- --channel=
```

```shell
sudo xcodebuild -license
```

- Rust style is to indent with four spaces, not a tab.
- diff：compiler、execute
- Cargo：dependency；`Cargo.toml` like `package.json`，but `src` directory required
  - `cargo new xxx`
  - `cargo build` & `cargo run` & `cargo check` & `cargo build --release`

### Chaptor 2：simple game

- `mut`：可变
- `&`： 传入引用，不需复制副本
- `except`：处理错误
- `{}`：字符串占位符
-  `cargo doc --open`：打开对应的依赖文档
- default `i32`
- 可重复使用变量

### Chaptor3：type

- `const` & `let mut`：const必须声明`type`，eg：`const MAX_POINTS: u32 = 100_000;`
- 可以多次使用`let`，对某个变量名重新复制，而无需声明`mut`
- `i8` & `u8`、`i16` & `u16`、`i32` & `u32`、`i64` & `u64`、`i128` & `u128`、`isize` & `usize`

- `isize` & `usize` 取决于系统，64位、32位.

- float：`f32` 、`f64`

- boolean：`let t = true`

- charactor：`let c = 'z'`

- tupe type： `let x: (i32, f64, u8) = (500, 6.4, 1);let five_hundred = x.0; let six_point_four = x.1;`

- array：不可拓展，verctor：可拖拽：

  - `let a: [i32; 5] = [1, 2, 3, 4, 5];`
  - `let a = [3; 5]; // [5, 5, 5, 5, 5]`

- `fn another_function(x: i32) { println!("The value of x is: {}", x); }`

- `let`声明不返还变量，但`{}`包括的表达式返回变量

- `->`：标记返回的值：`fn five() -> i32 { 5 }`（最后一个表达式没有`;`）

- `//`：注释

- control flow

  - `if condition { 5 } else { 6 }`
  - `loop { break }`
  - `while condition {}`
  - `for element in a.iter {}` & `for number in (1..4).rev() {}`

  ```rust
  fn main() {
      for number in (1..4).rev() {
          println!("{}!", number); 
      }
      println!("LIFTOFF!!!");
      // 3
      // 2
      // 1
  }
  ```

### Chapter 4：ownership

- not copy：`u32`、`bool`、`f64`、`char`、`(i32, i32)` but not `(i32, String)`
- copy的值传参后，会被立即销毁，要重复利用，应当在调用的`func`中返回，或者传递的是`&`引用
- 传递的引用在方法内不可更改，除非声明`mut`（只能在特殊的block中`{}`使用，或提前使用）
- `mut`不能和`slice`一起使用

### Chapter 5：struct

- `struct` 和 **object**类似
- `print!()`打印`struct`时，需要开启debug或实现fmt
- `struct`可以实现方法：`impl obj { fn area(&self) -> 32 {self.x, self.y} }`
- `Associated functions`、`::`类似构造方法

### Chapter 6：enum

- `enum IpAddrKind {V4, V6}`、`let four = IpAddrKind::V4`
- 没有`null`（强烈赞同）、`Some` & `None`
- `None => None`：match！`_` for others
- `if let` as syntax sugar 

### Chapter 7： package

- . `package` >= `crate`>=`module`
- cargo.toml >= xxx.rs > mod

- `pub` & `crate::mod::mod::fn`：（每个方法、变量需要依次暴露）
- `use` & `use xxa as xxA`
- `use std::{self, cmp::Ordering, io};`

### Chapter 8：Common Collection

1. `let v: Vec<i32> = Vec::new();` | `let v = vec![1, 2, 3];`
2. `let mut v = vec![100, 32, 57];for i in &mut v {*i += 50;}`
3. `String::from` and `to_string` ：same
4. Rust strings不支持索引，可以通过`char`遍历
5. `let mut scores = HashMap::new(); for (key, value) in &scores {}`
6. 要更改map的值，需要在第一次赋值时，更改返回的引用

### Chapter 9：Error Handler

``` toml
[profile.release]
panic = 'abort'
```

- `RUST_BACKTRACE`：输出堆栈
- The `?` operator can only be used in functions that have a return type of `Result`

### Chapter 10：generic type （泛型）

- 先实例化的所有可能，来构成泛型的存在列表，从而不影响性能
- 同一个`crate`才可以`impl`一个`trait`
- `pub fn notify(item1: impl Summary, item2: impl Summary) ` & `pub fn notify<T: Summary>(item1: T, item2: T)` & `pub fn notify<T: Summary + Display>(item: T) `
- `lifetime`：用于告知Rust解析器无法推断的生命周期
- `'static`：静态声明周期（贯彻整个程序）

## 以下内容为略读（后续有需要回归）

### Chapter 11：Test

### Chapter12：IO

### Chapter13

### Chapter14

### Chapter15

### Chapter16

### Chapter17

### Chapter18

### Chapter19