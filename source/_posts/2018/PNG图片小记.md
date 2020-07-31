---
title: 获取PNG中的“分辨率”
link: learn_png_data
date: 2018-12-15
categories: work
tags: [png, phys, typearray]
---

## 前言

换了公司，做的第一个需求：水印预览。

完成功能后，发现有的图片和C艹内核渲染**尺寸不一致**。分析后发现，C++处理PNG图片时，除了考虑基本像素外，还会按照PNG的分辨率加以缩放。（eg：win下课通过查看图片，`水平（或垂直）分辨率：xxx dpi`得到值）

dpi、ppi或px等的关系，详见[CSS像素、物理像素、逻辑像素、设备像素比、PPI、Viewport ](https://github.com/jawil/blog/issues/21)。

## 获取pHYs

因不是WEB的通用属性，在JS的`Img`对象中不存在。只能读取图片的二进制提取。

参考W3C上的[PNG的描述](https://www.w3.org/TR/PNG/)，PNG由`头部描述` + `若干Chunk`构成。头部仅包含`Width`、`Height`等属性。而我们所需要的分辨率，在某个`Chunk`中。

![PNG组成](https://edeity.oss-cn-shenzhen.aliyuncs.com/png_data.png)

<small>[图片来源](https://blog.csdn.net/liuyaqi1993/article/details/77531328)</small>

通过观（yi）察（yin），发现某个Chunk的名称为`pHYs`（Physical pixel dimensions：物理像素密度）。死马当活马医，假设就是他了。

- 首先，扒开他的外衣（读取二进制数据`ArrayBuffer`）。

```js
// 假设通过<Input>获取了file
let file = document.querySelector('input[type=file]').files[0];
let reader = new FileReader();
reader.onload = (e) => {
    let arrayBuffer = e.target.result;
}
reader.readAsArrayBuffer(fiel);
```

- 而后做一下热身运动（参（chao）考（xi）解析`ArrayBuffer`的方法）。

```js
// 通过offset读取buffer数据
function readUint(buff,p) {
    return (buff[p]*(256*256*256)) + ((buff[p+1]<<16) 
            | (buff[p+2]<< 8) | buff[p+3]);  
}
 function readASCII(buff,p,l) {
     let s = "";  
     for(let i=0; i<l; i++) { 
         s += String.fromCharCode(buff[p+i]);
     }  
     return s;    
 }
```

- 最后，在`ArrayBuffer`身上摸来摸去，手法如下：
  - `ArrayBuffer`是数据原始二进制缓冲区，可通过`new Int8Array(buffer.slice(4))`切割。[TypeArray](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)是处理二进制的数据结构。
  - PNG的每个Chunk，开始的数据会声明`长度`和`名称`。通过`长度`，可推断下一个Chunk的位置，类同索引。
  - 图片结束时，会有`IEND`标志，假若出现了`IEND`也没有发现`pHYs`属性，证明此PNG图片无`pHYs`属性。

完整代码如下：

```js
function read_pHYs(buffer) {
    let isFind = false;
    let offset = 8;
    let pHYs = null;
    let data = new Uint8Array(buffer);

    while(!isFind) {
        let len  = readUint(data, offset);  offset += 4;
        let type = readASCII(data, offset, 4);  offset += 4;
        if(type ==="pHYs") {
            pHYs = [readUint(data, offset), readUnit(data, offset + 4), data[offset + 8]];
            isFind = true;
        } else if(type === "IEND" || Number.isNaN(len)) {
            pHYs = -1;
            isFind = true;
        } else {
            offset += len + 4;
        }
    }
    return pHYs;
}
```

运行，得到结果：

![pHYs](https://edeity.oss-cn-shenzhen.aliyuncs.com/png_dpi.png)

## 其他

- `pHYs`包含水平像素点，垂直像素点，以及单位标记位；当单位标记位为1时，代表单位**像素/米**，当为0时，则代表未知单位。<small>iconfont的png图标，当标记位为0时，单位是**像素/英尺**；</small>
- [UPNG](https://github.com/Alexander-Pop/UPNG.js/blob/master/UPNG.js)类库提供了解析PNG更多属性的方法。上文解析Chunk方法出自此处。

- 关于PNG的更详细信息科参考：[png的故事：获取图片信息和像素内容](http://www.alloyteam.com/2017/03/the-story-of-png-get-images-and-pixel-content/)

- 题外话：Emoji字体（`utf8mb4`），参考[十分钟搞清字符集和字符编码](http://cenalulu.github.io/linux/character-encoding/)。