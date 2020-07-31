## Connector

### 连接器（Client）

``` javascript
class Client {
  // 通用
  start(); // 启动
  exit(); // 退出
  isActive(); // 是否活跃
  // 主控
  onEnter(); // 是否需要控制电脑
  enter(); // 进入并控制电脑
  lock(); // 自锁
  unlock(); // 解锁
  onOutOfControl(); // 被摆脱控制
  // 受控
  onLeave(); // 是否需要退出控制电脑
  leave(); // 离开并退出控制电脑
  onControl(); // 被控制
}
```

### 通讯（Communication）

``` javascript
// 不区分client & server
class Communication {
  ip;   // string 自身ip
  partnerIps;  // Set 伙伴ip
  // 发送和接受信息
  msg = {
    type: '',
    data: {
      cmd: '',
      value: '',
    },
  }
	_partnerJoin();
	_partnerLeave();
  onReceiveMsg();
  sendMsg();
  broadcastMsg();
}
```

## Hook & Mock

### 监听（Hook）

``` javascript
class Hook {
  onEvent();
  // 鼠标事件
  onMouseUp();
	onMouseDown();
  onMouseMove();
  onMouseClick();
  onMouseDrag();
  // 键盘事件
  onKeyDown();
  onKeyUp();
  // 编辑事件
  onCopy();
  onPaste();
}
```

### 模拟（Mock）

``` javascript
class Mock {
  mockEvent();
  // 鼠标事件
  mockMouseUp();
  mockMouseDown();
  mockMouseMove();
  mockMouseClick();
  mockMouseDrag();
  // 键盘事件
  mockKeyDown();
  mockKeyUp();
  // 编辑事件
  mockCopy();
  mockPaste();
}
```

## 流程

![流程图](/Users/edeity/Documents/blog/source/_drafts/img/流程图.png)