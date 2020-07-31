---
https://github.com/mozilla/arewefastyet/tree/master/benchmarks/v8-v7title: React的一些感悟
link: think_of_react
date: 2020-01-05
categories: study
tags: [react, design]
---

- 多层props真的不是一个好主意（比如超过两层）。react-redux关系的是数据，我们关心的是事件，然而绝大多数，我们关心的只是触发的事件。在数据变更是基于事件（接口），注册事件更简单，而且完全不必要引入类库。更新事件，而后接受通知，仅维护组件内的state。
  - 当然，假若不同组件强依赖于同一个数据，还是应该将其托管于store中，但在我个人接触的业务逻辑中，这种强依赖还是少数。







