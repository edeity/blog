---
title: V8 Blog的阅读笔记
link: read_v8_blog
date: 2019-09-17
categories: study
tags: [blog, english,note, v8]
---

工作以后，接触英文资料较少。平时阅读英文文档，为了效（yan）率（shi），google翻译已三年。三年内，除了对前端知识稍以熟练，其余收获不多。故立小目标，抽空阅读V8的[博客](https://v8.dev/blog) 。<del>尽可能先读原文，后看翻译</del>。

在我的实践理解中，对前端而言，阅读V8博客，哪怕占用了我下半年大量的空余时间，也是收获甚多。建议细读。<small>（人懒碎事多，导致空闲时间并不多，截止2019.12.31，阅读进度100/100）</small>，

以下仅为各篇文章摘要，具体内容请自行阅读。

## V8技术简介

1. [Digging into the TurboFan JIT](https://v8.dev/blog/turbofan-jit)：仅提及V8采用代号了为`TurboFan`的多层级架构的编译器。
1. [Code caching](https://v8.dev/blog/code-caching)：V8采用了代码缓存的技术，用节省切换页面时字节码转化为机器码所需要的时间，[ScriptCompiler::CompileOptions](https://v8docs.nodesource.com/node-4.8/da/da5/classv8_1_1_script_compiler.html#a9419dd32e265bc13507c44d12f2fd261)<small>（未展开简述）</small>
1. 【REC】[Getting garbage collection for free](https://v8.dev/blog/free-garbage-collection)：V8会在浏览器相对空闲时采取GC，其拆分为多个具备执行上限的不同优先级任务。和大多数GC一样，V8也会区分新生代和次世代。新生代采用了`semi-space`的策略<small>（分为两个半空间，激活一个，用以存放对象，此半空间满时，执行清理，已标记的活跃的对象将移动次世代空间，未被标记的移动到另一个半空间，不活跃的则会被回收，两个半空间空闲状态转化）</small>。次世代则采用`mark-and-sweep`（标记-扫描）策略，次世代的回收耗时较长，为了避免等待，该标记收集会被拆分成多个执行时间小于5ms的子任务。<small>（该方法也是常用的方法，缺点是执行期间会挂起正常程序，以及多次执行会产生碎片，V8如何克服缺点并没有展开简述）</small>
	- 拓展<small>（`semi-space`详见1，`mark-and-sweep`详见2，`新生代&次世代`详见4）</small>
    - [深入浅出垃圾回收（一）简介篇](https://liujiacai.net/blog/2018/06/15/garbage-collection-intro/)
    - [深入浅出垃圾回收（二）Mark-Sweep 详析及其优化](https://liujiacai.net/blog/2018/07/08/mark-sweep/)
    - [深入浅出垃圾回收（三）增量式 GC](https://liujiacai.net/blog/2018/08/04/incremental-gc/)
    - [深入浅出垃圾回收（四）分代式 GC](https://liujiacai.net/blog/2018/08/18/generational-gc/)
1. [Custom startup snapshots](https://v8.dev/blog/custom-startup-snapshots)：V8采用快照的方式，减少页面初始化时全局对象（正则等）初始化的耗时。每打开一个页面，将创建一份具备独立上下文的快照副本。
1. [Jank Busters Part One](https://v8.dev/blog/jank-busters)：交代了导致V8`Jank`的两个重要原因：**GC跟踪过多的ArrayBuffer**、**V8向Chrome提供过多句柄**<small>（允许操作V8数据）</small>。这两个情况常发生在WebGL的渲染上。对这两种情况，V8做了以下优化：对`ArrayBuffer`剥离原有的GC规则，作针对性检查<small>（ per-access checks在原理上增大耗时，但remove redundant checks却实际上减少了jank，V8未进一步交代具体实现，本人想象力缺乏也没有脑补出来）</small>。以及针对这些数据多数只读不写的特性，通过实现[逃逸分析](https://blog.csdn.net/w372426096/article/details/80938788)进行优化。<small>（锁消除 & 标量替换）</small>
1. [There’s `Math.random()`, and then there’s `Math.random()`](https://v8.dev/blog/math-random)：介绍了Math.random从`MWC1616`到 [xorshift128+](http://vigna.di.unimi.it/ftp/papers/xorshiftplus.pdf)的过程。
1. [V8 extras](https://v8.dev/blog/v8-extras)：V8提供`extras`模式 [API](https://docs.google.com/document/d/1AT5-T0aHGp7Lt29vPWFr2-qG8r3l9CByyvKwEuA8Ec0/edit)，使可以用javascript提供内置通用的全局对象（称为`self-hosted`），eg：`Promise`对象。
1. [RegExp lookbehind assertions](https://v8.dev/blog/regexp-lookbehind-assertions)：V8支持了正则的`后置断言`
1. [Experimental support for WebAssembly in V8](https://v8.dev/blog/webassembly-experimental)：V8支持`WebAssembly`（<small>努力学Rust中</small>）
1. [Jank Busters Part Two: Orinoco](https://v8.dev/blog/orinoco)：介绍了名为`Orinoco`的GC优化手段。将对象从新生代转移到次世代的过程中，指针更换的消耗是昂贵的。GC的优化策略：1. 因为指针更换和次世代的压缩没有依赖关系，所以可以并行执行。2. 采用新的` remembered set`，简化了原RS相互引用的情况，使追踪指针的命令能够并行<small>（没看懂，日后再算）</small> 3. 采用了黑色标记法<small>（因为次世代跟持久，所以可以提前标记其活跃）。</small>
1. [ES2015, ES2016, and beyond](https://v8.dev/blog/modern-javascript)：介绍了V8如何健壮地支持ES Next
1. [V8 at the BlinkOn 6 conference](https://v8.dev/blog/blinkon-6)：此博客是一些列视频，先Mark
1. [Firing up the Ignition interpreter](https://v8.dev/blog/ignition-interpreter)：介绍了V8为移动端定制了新的解析器`Ignition`，意在减少内存占用。<small>这里用到了底层一点的技术，不是很了解。</small>
1. [Optimizing V8 memory consumption](https://v8.dev/blog/optimizing-v8-memory)：介绍了v8垃圾收集的优化，让内存指标可视化、针对不同的场景执行不同的回收策略（比如对一些内存敏感的设备执行更积极的回收）、及早释放解析器、通过合并数据使数据存储更紧凑等。
1. [WebAssembly browser preview](https://v8.dev/blog/webassembly-browser-preview)：浏览器支持`WebAssembly`
1. [V8 love Node.js](https://v8.dev/blog/v8-nodejs)：可以在Chromium中调试node、支持`async`/`await`...
1. [How V8 measures real-world performance](https://v8.dev/blog/real-world-performance)、[拓展](https://benediktmeurer.de/2016/12/16/the-truth-about-traditional-javascript-benchmarks/#a-closer-look-at-octane)：经过比较发现，[Speedometer](https://browserbench.org/Speedometer/)更接近真实的数据。
1. [Speeding up V8 regular expressions](https://v8.dev/blog/speeding-up-regular-expressions)：用C++实现正则，为避免变慢，请勿更改Reg的原型
1. [One small step for Chrome, one giant heap for V8](https://v8.dev/blog/heap-size-limit)：Chrome DevTools增加一个功能，在内存快耗尽时断点
1. [Help us test the future of V8!](https://v8.dev/blog/test-the-future)：求助贴，通过开启实验性功能来测试新的解析器和编译器
1. [High-performance ES2015 and beyond](https://v8.dev/blog/high-performance-es2015)：鼓励开发人员使用ES2015+，仅向不支持的浏览器提供编译版本，这通常能提高页面执行速度。<small>（然而自家产品也没有做到，哈哈哈）</small>
1. [Fast for-in in V8](https://v8.dev/blog/fast-for-in)：优化了`for in`：对象是否含有`enumCache`（缓存），对于没有缓存的情况，引入`KeyAccumulator`类，来处理一些简单的键值的枚举，此举提升了众多网站4%的执行速度。
1. [Retiring Octane](https://v8.dev/blog/retiring-octane)：`Octane`工具在现阶段已不利于测评具体世界的js运行情况，谋求一个不依赖于浏览器、分类、免费、关键点在于时间的基准测试工具，如**speedometer**。
1. [Launching Ignition and TurboFan](https://v8.dev/blog/launching-ignition-and-turbofan)：已发布新的点火（Ignition）和涡轮（TurboFan）
1. [About that hash flooding vulnerability in Node.js](https://v8.dev/blog/hash-flooding)：预编译版本的Node，启用快照（加快启动速度）时，因为随机种子固定，可提交有规律的HTTP头进行Hash攻击，从而导致Node服务器拒绝服务。新的解决方法是，在快照反序列化后，重新生成新的随机种子。
1. 【REC】[*Fast properties* in V8](https://v8.dev/blog/fast-properties)：解析V8如何处理对象属性。

    - *数组单独存储*：因为可以动态删除，会造成存储上`有孔`（索引没有值）的现象（有标记位标记不存在的属性，索引没有值会触发原型读取）、稀疏的数组将会以字典形式存储
    - *属性和值可以是数组或字典的形式*：因不利于优化，简单对象并不是以字典方式存储，复制对象可能会一字典存储，但将变成慢属性（运行有效的属性删除，但访问速度较慢）

    - *`HiddenClass`用于描述对象形状：*第一个字段即指向形状，第三个字段存储指针位置等，但没有索引计数，添加属性即更改`HiddenClass`
1. [CodeStubAssembler builtins](https://v8.dev/docs/csa-builtins)：介绍`CodeStubAssembler`，一种定制的，与平台无关的汇编器。可提供接近汇编的性能。
1. [*Elements kinds* in V8](https://v8.dev/blog/elements-kinds)：介绍了V8中不同的数据类型（虽然JS本身不作区分）。这些类型可以在运行中被改变，但只能从特定类型到更一般类型。大类有`PACKED`和`HOLEY`（有孔，代表稀疏）。同时针对类型，给出了一些性能优化建议：避免读取超过数组长度的索引，如：不要再循环条件中复制（可以在循环内部）、避免元素种类转换、优先数组而不是类数组、避免多态，包括参数多态（这个建议牺牲了灵活性，[拓展](https://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html)）、最好在初始化时声明所有值，或者初始化空值，而后采用`push`方法（不要new Array，然后根据索引复制）。
1. [Temporarily disabling escape analysis](https://v8.dev/blog/disabling-escape-analysis)：暂时停止转义分析（eg：通过语法转换避免避免创建对象）
1. [An internship on laziness: lazy unlinking of deoptimized functions](https://v8.dev/blog/lazy-unlinking)：剔除一些潜在的无效代码
1. [Announcing the Web Tooling Benchmark]( )：V8发布了新的基准测试工具，也做出了一些回馈社区的举动
1. [Taming architecture complexity in V8 — the CodeStubAssembler](https://v8.dev/blog/csa)：CSA（CodeStubAssembler）入门介绍
1. [Optimizing ES2015 proxies in V8](https://v8.dev/blog/optimizing-proxies)：介绍了将`Proxy`的运行从C++端转移到CSA上，在JS运行时执行从而将语言跳转的次数从4降为0。同时也优化了注入`get`、`has`、`set`
1. [Orinoco: young generation garbage collection](https://v8.dev/blog/orinoco-parallel-scavenger)：介绍GC中的对新生代的算法、*半空间算法*、*并行标记法*（MS）、*并行消除*（ME）。参考【3】
1. [JavaScript code coverage](https://v8.dev/blog/javascript-code-coverage)：介绍了Chrome的source代码覆盖工具，并分为*尽力而为*（遍历整个对的活动函数，但可能因GC导致数据丢失）、和*精准覆盖*（提供计数，且不被GC）
1. [Chrome welcomes Speedometer 2.0!](https://v8.dev/blog/speedometer-2)：Speedometer 2.0版本，并基于此加速了React一倍解析执行的速度
1. [Optimizing hash tables: hiding the hash code](https://v8.dev/blog/hash-code)：字典存储数据时【参考26】，会生成Hash（会被存储，可能存储在一个对象的属性数组上以节省内存）
1. [Lazy deserialization](https://v8.dev/blog/lazy-deserialization)：为了极速启动页签，V8创建快照【参考4】，但也因序列化原因，导致内存消耗变大。因为V8延迟了反序列化时机，仅在用到时反序列化。
1. [Tracing from JS to the DOM and back again](https://v8.dev/blog/tracing-js-dom)：使内存泄露调试更容易（eg：添加事件监听但不销毁会导致内存泄露，Menory中的`Leak`可观察挂载在window对象或事件）
1. [Background compilation](https://v8.dev/blog/background-compilation)：新架构将对JS的编译剥离了主线程（Parse、Compile在后台线程Stream Source，execute在主线程）
1. [Improved code caching](https://v8.dev/blog/improved-code-caching)：V8缓存并会反序列化编译后的代码
1. [Adding BigInts to V8](https://v8.dev/blog/bigint)：考虑提供对大数bigInt的支持
1. [Concurrent marking in V8](https://v8.dev/blog/concurrent-marking)：改进三色标记的增量标记【参考3】，支持并发执行
1. [Embedded builtins](https://v8.dev/blog/embedded-builtins)：嵌入式函数库（基于CSA）占用了更多的空间（即使开启了反序列化惰性加载）【参考38】。考虑内嵌二进制（由于访问隔离对象和过程消耗大，仅实现内嵌不一定是优化的，文中还给出了一些优化，如全局内置不常用对象等）
1. [Liftoff: a new baseline compiler for WebAssembly in V8](https://v8.dev/blog/liftoff)：新的WASM编辑器（前半部分没看懂，后半部分介绍了wasm结合TurboFan的好处，如静态类型可立即生成优化代码、代码可预测而不需要预热，仅liftoff的话，执行的速度可能会较TurboFan慢）
1. [Celebrating 10 years of V8](https://v8.dev/blog/10-years)：V8十年历史，虽然在两次大事件中稍微降低（支持ES5、Spectre漏洞），但总的性能还是提升了4倍
1. [Improving `DataView` performance in V8](https://v8.dev/blog/dataview)：改进`DataView`（一种和`TypedArray`并列的底层访问数据的结构）。并提到了Torque，一种降低编写CSA难度的语言。
1. [Getting things sorted in V8](https://v8.dev/blog/array-sort)：展开描述Array.sort，推荐避免一些写法以实现更好的性能。原排序使用了*quickSort*（一般Log(n)，最坏O(n2)），但后来转变为了*TimSort*（一般O(n)，最坏nlog(n)）；虽然效率略有降低，但保证每次返回的结果一致。<small>比如`sort(sort(A)) === sort(A)`、或者`[1,2,3,4,5,6,7,8,9,10,11].sort(function(){return 0;})
     \> [6, 1, 3, 4, 5, 2, 7, 8, 9, 10, 11]`（旧版本，新版本会返回原数组）</small>
1. [Faster async functions and promises](https://v8.dev/blog/fast-async)：setTimeout\setImmediate(task)，async/promise(microtask)、一般执行顺序`Promise > Mutate > setTimeout`。`await`的关键词比较接近`Promise.resolve().then()`（旧的标准，要求Promise在大部分时间都throwable），新标准只需要一个Promise即可。现阶段，await/async在chrome上已优于手写Promise代码。
1. [Speeding up spread elements](https://v8.dev/blog/spread-elements)：优化了`[...array]`的性能。假设值是array，会比其他对象能更快地析构（因为不需要创建复杂的Iterable）
1. [Trash talk: the Orinoco garbage collector](https://v8.dev/blog/trash-talk)：又一次介绍了现阶段的V8GC。GC三阶段：标记、清除、压缩。而V8的GC`Orinoco`则包含一些特性：并行，增量，并发。
1. [JIT-less V8](https://v8.dev/blog/jitless)：某些平台禁止非特权应用程序对可执行内存进行访问，导致V8无法分配修改可执行内存。V8添加无JIT模式的运行。
1. [Blazingly fast parsing, part 1: optimizing the scanner](https://v8.dev/blog/scanner)：介绍了V8快速解析JS代码的优化内容、空格扫描、标识符扫描（[Perfect hash function](https://en.wikipedia.org/wiki/Perfect_hash_function)）等。也对开发者给出了优化建议：减少源码、去除不必要空格、尽可能避免使用非ASCII标识符等。
1. [Code caching for JavaScript developers](https://v8.dev/blog/code-caching-for-devs)：介绍了V8的代码缓存（字节码级别，【参考41】），并提出了优化建议：若无必要，不要更新代码、请勿更改网址、少用A/B测试、提取公共代码库、分解大文件（eg：1MB）&合并小文件（eg：1Kb）、避免内敛脚本（无法利用缓存）、使用PWA缓存等的。<small>(感觉大多数建议并不实用，因为业务在大多数优先级优于代码性能)</small>
1. [Blazingly fast parsing, part 2: lazy parsing](https://v8.dev/blog/preparser)：介绍了V8惰性解析的应用，从而加快启动速度，减少内存开销。
1. [A year with Spectre: a V8 perspective](https://v8.dev/blog/spectre)：介绍了spectre漏洞发布后，V8一年的举动。
1. [Faster and more feature-rich internationalization APIs](https://v8.dev/blog/intl)：优复了国际性API的错误 以及优化 性能。
1. [Code caching for WebAssembly developers](https://v8.dev/blog/wasm-code-caching)：缓存WASM（128kb~150MB）
1. [The cost of JavaScript in 2019](https://v8.dev/blog/cost-of-javascript-2019)：介绍了2019V8版本的性能，得益于新的引擎，已大大减少了解析和编译的成本，目前前端瓶颈已经几种在网络下载上。并给出了一些建议：缩短下载时间，避免执行时间过长，避免大型内联脚本（建议1KB以内）。
1. [Emscripten and the LLVM WebAssembly backend](https://v8.dev/blog/emscripten-llvm-wasm)：后端将默认使用LLVM而不是fastcomp。(性能更优，大小更小）。emscripten（编译[asm.js](https://www.ruanyifeng.com/blog/2017/09/asmjs_emscripten.html)的工具），将支持编译webassembly，以达到更好的性能。
1. [The story of a V8 performance cliff in React](https://v8.dev/blog/react-cliff)：V8切换、弃用形状【参考28】，在React上带来了性能瓶颈。（V8推荐，不要再初始化时将数值字段设置为null，因为这样会放弃字段跟踪）
1. [A lighter V8](https://v8.dev/blog/v8-lite)：V8的精简模式（指初始阶段，最终还是会回落到正常的版本），介绍了延迟反馈的实现
1. [Improving V8 regular expressions](https://v8.dev/blog/regexp-tier-up)：正则表达的分层策略（对高频使用的正则编译为本地机器码）
1. [Outside the web: standalone WebAssembly binaries using](https://v8.dev/blog/emscripten-standalone-wasm)：尝试脱离JS运行`wasm`

## 版本发布

因博客中技术简介和发布信息混在一起，发布信息提取于此，顺带了解V8对JS语法的支持进度，以及ES5+语法。

值得一提，2019年，V8对WebAssembly投入了大量的资源，可以预测在不久的将来，一些对性能有一定要求的程序，也会在浏览器上运行起来。

- [V8 release v4.5](https://v8.dev/blog/v8-release-45)*（2015.06）*：支持了箭头函数[Arrow Function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)、[Array.From & Array.of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array)、对象赋值[Object.assign](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
- [V8 release v4.6](https://v8.dev/blog/v8-release-46)*（2015.08）*：支持了[Spread operator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)（展开）、[new.target](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new.target)<small>（没用过，囧，貌似对类的实现有帮助）</small>、避免`Jank`<small>（主程序耗时过多导致界面卡顿，更新不及时）</small>，优化了`TypedArray`
- [V8 release v4.7](https://v8.dev/blog/v8-release-47)*（2015.10）*：[rest operator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/rest_parameters)（动态参数）、[Array.prototype.includes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
- [V8 release v4.8](https://v8.dev/blog/v8-release-48)*（2015.11）*：[Symbol.isConcatSpreadable](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/isConcatSpreadable)（声明数组concat的规则）、[Symbol.toPrimitive](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/@@toPrimitive)（一个对象的不同返回形式）
- [V8 release v4.9](https://v8.dev/blog/v8-release-49)*（2016.01）*：[Destructuring](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)（解构，<small>整了好多名词，然而和展开、动态参数都是一回事</small>）、[P（roxies & Reflect](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)<small>（[Proxy 和 definedPropties不同](https://juejin.im/post/5acd0c8a6fb9a028da7cdfaf)）</small>、[Default Parameters](https://developer.mozilla.org/zh-cn/docs/Web/JavaScript/Reference/Functions/Default_parameters)（默认参数）、[sticky flag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky)（reg索引所处位置）
- [V8 release v5.0](https://v8.dev/blog/v8-release-50)*（2016.03）*：Reg Unicode、优化了Object.keys
- [V8 release v5.1](https://v8.dev/blog/v8-release-51)*（2016.04）*：[Symbol.species](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/species)（更改对象类型，作用于`instanceof`）、[Symbol.hasInstance](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)：（拓展`instanceof`行为）、[Array.values](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/values)
- [V8 release v5.2](https://v8.dev/blog/v8-release-52)*（2016.06）*：Exponentiation operator：求幂运算符（`let n = 3**3 // 27`）
- [V8 release v5.3](https://v8.dev/blog/v8-release-53)*（2016.07）*：优化了GC、启动速度、Promise
- [V8 release v5.4](https://v8.dev/blog/v8-release-54)*（2016.09）*：`Peak memory` & `average memory`，pm可能导致内存崩溃；同时运用了全局[内联缓存](https://en.wikipedia.org/wiki/Inline_caching)来优化启动性能
- [V8 release v5.5](https://v8.dev/blog/v8-release-55)*（2016.10）*：支持`sync`和`await`
- [V8 release v5.6](https://v8.dev/blog/v8-release-56)*（2016.11）*：一些新的语法是构建在新的新的编译渠道
- [V8 release v5.7](https://v8.dev/blog/v8-release-57)*（2017.02）*：一系列优化、支持**WebAssembly**
- [V8 release v5.8](https://v8.dev/blog/v8-release-58)*（2017.03）*：更具新的测量结果优化了代码
- [V8 release v5.9](https://v8.dev/blog/v8-release-59)*（2017.04）*：优化了WebAssembly的编译时间
- [V8 release v6.0](https://v8.dev/blog/v8-release-60)*（2017.06）*：引入[`SharedArrayBuffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)<small>（资料表明，该方法在最新的浏览器上因安全问题，*就是大名鼎鼎，导致所有现代计算器性能减少20%的BUG*，已被弃用）</small>
- [V8 release v6.1](https://v8.dev/blog/v8-release-61)*（2017.08）*：优化了*Map*和*Set*的`forEach`<small>（具体优化措施在于[此](https://benediktmeurer.de/2017/07/14/faster-collection-iterators/)，原迭代逻辑在C++端迭代，每次迭代都需要JS\C艹过渡，且需要创建迭代对象，优化后已全用JS实现，C艹仅负责GC，不过文章还指出在回调时仍然过渡的性能问题）</small>、`isPrototypeOf`、`Reflect.apply`和`Reflect.construct`、移除Crankshaft编译器从而减少700KB、
- [V8 release v6.2](https://v8.dev/blog/v8-release-62)*（2017.09）*：[优化了`Object.toString`](https://ponyfoo.com/articles/investigating-performance-object-prototype-to-string-es2015)（预置标记位，不改动时走快速路径）、`String#includes`
- [V8 release v6.3](https://v8.dev/blog/v8-release-63)（2017.10）：继续优化ES2015语法
- [V8 release v6.4](https://v8.dev/blog/v8-release-64)（2017.11）：优化`instanceof`、`WeakMap`和`WeakSet`（CSA），实现`import.meta`（嵌入式有关）、`formatToParts`（本地化有关）
- [V8 release v6.5](https://v8.dev/blog/v8-release-65)（2018.01）：引入*不可信代码模式*、完成WebAssembly流式编译、优化`indexof`
- [V8版本v6.6](https://v8.dev/blog/v8-release-66)（2018.03）：*Function*的`toString`返回完整代码、catch可选参数、`trimStart & trimEnd`、实现**冷加载（第一次、无任何缓存）、热负荷（第二次、缓存编译后的代码）、热加载（第三次，读取热负荷缓存的代码）**【参考41】、后台编译、移除*AST numbering*
- [V8 release v6.7](https://v8.dev/blog/v8-release-67)（2018.03）：默认启用BigInt【参考42】
- [V8 release v6.8](https://v8.dev/blog/v8-release-68)（2018.06）：减少`SFI`（类似于多次中间短暂的引用改变，会导致执行时间和内存增加），如`var a= b; b=temp; a=temp;`
- [V8 release v6.9](https://v8.dev/blog/v8-release-69)（2018.08）：内置对象【参考44】、Liftoff Wasm编译器【参考45】、实现*Array.flat & Array.flatMap*
- [V8版本v7.0](https://v8.dev/blog/v8-release-70)（2018.10）：嵌入式内置【参考44】、稳定的sort算法【参考48】
- [V8 release v7.1](https://v8.dev/blog/v8-release-71)（2018.10）：解析器字节码处理内嵌二进制、一些性能优化
- [V8 release v7.2](https://v8.dev/blog/v8-release-72)（2018.11.18）：增加[公共字段](https://v8.dev/features/class-fields)的支持
- [V8 release v7.3](https://v8.dev/blog/v8-release-73)（2019.02）：又又又优化了wasm、增加了[Object.fromEntries](https://v8.dev/features/object-fromentries)（需要确保键唯一，否则会有数据丢失）、`String.prototype.matchAll`
- [V8 release v7.4](https://v8.dev/blog/v8-release-74)（2019.03）：支持无JIT模式【参考52】、支持`#`私有变量、一些局部优化
- [V8 release v7.5](https://v8.dev/blog/v8-release-75)（2019.03）：缓存`wasm`【参考58】、支持大容量内存操作、支持[数字分隔符](https://v8.dev/features/numeric-separators)`100_000_000`。
- [V8 release v7.6](https://v8.dev/blog/v8-release-76)（2019.06）：新JSON解析器、优化`frozen`、[Promise.allSettled](https://v8.dev/features/promise-combinators#promise.allsettled)（所有Promise是否已完结）语法等
- [V8 release v7.7](https://v8.dev/blog/v8-release-77)（2019.08）：延迟反馈【参考62】、Intl.NumberFormat、优化`error.stack`
- [V8 release v7.8](https://v8.dev/blog/v8-release-78)（2019.09）：尝试在HTML解析完成前，加载并以流的方式解析Js（但还未启用）、Regexp更快返回失败，优化wasm启动速度等
- [V8 release v7.9](https://v8.dev/blog/v8-release-79)（2019.10）：取消部分形状过渡、未安装IC下也能getter内置函数、OSR缓存（更早识别代码热点）
- [V8 release v8.0](https://v8.dev/blog/v8-release-80)（2019.12）：压缩指针、[`?.`](https://v8.dev/features/optional-chaining)可选连接语法、[`??`](https://v8.dev/features/nullish-coalescing)语法（判断非false的类型）