---
title: Yahoo! Cloud Serving Benchmark 
link: learn_ycsb
date: 2015-06-03
categories: study
tags: [YCSB, redis, benchmark]
---

## 前言

该工具是大二唯一看过完整源码的程序

- [github代码](https://github.com/brianfrankcooper/YCSB)
- [Papers](https://b9f6702a-a-62cb3a1a-s-sites.googlegroups.com/site/brianfrankcooper/home/publications/ycsb.pdf?attachauth=ANoY7crUx8yzbi4_2j79JbiZSn1tNQYHofw3OX-vksjCvIsxYAICyl1t6EgPaoCiS9xf5_cxle0BWnxVTm53pooXHKA7yhL4wMpwT4uqgRyeJzcugUsedHvhNtJh6HKknTn2UI79Y9ZeiEfIv69hKr6UllFtQ963sfAINGIBY5qNbCE-PkkMewILE91mHQZFHl4Np-LYYruxkc0hMKiHbGCt4rKReCYKS0HYudE_EwTh1eM7Z3fP7tU%3D&attredirects=0)

仅在此总结为一篇文章；

## 工具简介

> Yahoo! Cloud Serving Benchmark (YCSB) 。是 Yahoo 公司的一个用来对云服务进行基础测试的工具。

使用方法：

`./bin/ycsb load redis -P workloada/workload -p redis.host=localhost`

## 使用过程

- 操作系统：ubuntu
- 以测试redis数据库的性能为例：

### 安装及使用

- 安装redis

```bash
wget http://download.redis.io/releases/redis-3.0.0.tar.gz
tar xzf redis-3.0.0.tar.gz
cd redis-3.0.0
make
./src/redis-server # 此处若缺少tcl，可能报错，参考附录安装tcl
```

- 安装java

```bash
java -version # 假如已安装，则不需再次安装
sudo apt-get install default-jre
```

- 安装并运行YCSB


```bash
wget https://github.com/downloads/brianfrankcooper/YCSB/ycsb-0.1.4.tar.gz
tar xfvz ycsb-0.1.4
cd ycsb-0.1.4
./bin/ycsb load redis -p redis.host=localhost -P workload/workloada > test_redis.txt
```

### 解读参数

```javascript
YCSB Client 0.1
Command line: -db com.yahoo.ycsb.db.RedisClient -P workloads/workloada -p redis.host=localhost -load
【OVERALL】, RunTime(ms), 782.0 //运行总时间为782毫秒
【OVERALL】, Throughput(ops/sec), 1278.772378516624 //throughput 吞吐量（ops：操作数/sec ：秒） 即每秒进行约1278次操作
【INSERT】, Operations, 1000 //一共执行了1000条操作
【INSERT, AverageLatency(us), 589.714 //平均每条【INSERT】插入操作耗时约 589us
【INSERT】, MinLatency(us), 146 //【INSERT】单次操作最少耗时
【INSERT】, MaxLatency(us), 19760 //【INSERT】单次操作最大耗时
【INSERT】, 95thPercentileLatency(ms), 2 // 执行到95%时，该次操作延迟
【INSERT】, 99thPercentileLatency(ms), 5 // 执行到99%时，该次操作延迟
【INSERT】, Return=0, 1000 // 0~1000条操作均成功执行
【INSERT】, 0, 901 // 下面1000条【INSERT】记录代表了平均延迟分布（单位ms），如该记录就表示有901条【INSERT】操作在0~1ms之间
【INSERT】, 1, 36 // 36条操作在1~2ms之间…
【INSERT】, 2, 21
【INSERT】, 3, 19
【INSERT】, 4, 8
【INSERT】, 5, 7
【INSERT】, 6, 1
【INSERT】, 7, 3
【INSERT】, 8, 2
【INSERT】, 9, 0
 …………
【INSERT】, 996, 0
【INSERT】, 997, 0
【INSERT】, 998, 0
【INSERT】, 999, 0
【INSERT】, >1000, 0
```



### 参数含义

参数 `-P workload/workloada`用于加载配置文件，如

```bash
./bin/ycsb load redis -p redis.host=localhost -P workload/workloada > test_redis.txt
```

workloada文件解析如下：

```javascript
recordcount=1000 // 执行操作记录数
operationcount=1000 // 执行操作的记录数
workload=com.yahoo.ycsb.workloads.CoreWorkload // workload具体类
readallfields=true // 是否读取所有字段
readproportion=0.5 // read操作占比：50%
updateproportion=0.5 // update操作占比：50%
scanproportion=0 // scan操作占比：0
insertproportion=0 // insert操作占比：0
requestdistribution=zipfian // 采用zipfian分布
```

#### 其他细节

- recordcount 和 operationcount

```bash
# workload配置
recordcount = 2000
operationcount = 3000
# shell
./bin/ycsb load … # 将执行2000条操作
./bin/ycsb run … # 将执行3000条操作
```

- load 和 run

  - `load`执行的是【INSERT操作】

  - `run`执行的是配置文件中的操作，如

  ```
  readproportion=0.5
  updateproportion=0.5
  ```

  将执行50%的【READ】和50%的【UPDATE】

- 概率分布

  - zipfian distribution：[zipfian分布](https://baike.baidu.com/item/Zipf%E5%AE%9A%E5%BE%8B/1577540?fr=aladdin)
  - skewed distribution：[偏态分布](https://baike.baidu.com/item/%E5%81%8F%E6%80%81%E5%88%86%E5%B8%83/445413?fr=aladdin)



## 代码概述

命令`./bin/ycsb run redis -p redis.host=localhost -P workload/workloada`在代码中会经过两个阶段：

1. 读取命令参数：
    1. 分析终端中的命令参数
    2. 读取分析-P worklod/workload* 文件中的参数
2. 根据（一）中的参数进行相应的数据库测试操作
    1. 根据YCSB目录下诸如`./hbase`；`./redis`；`./mongodb`等文件夹中对应的 `*Client.java `连接相应的数据库，以及该类文件提供的`insert`，`delete`，`update`， `scan`四种基本方法对数据库进行操作
    2. 上述四种操作的执行嵌套在`DBWrapper.java`中，DBWrapper实际上是一个包装类，将对上述执行操作进行额外的统计（如`每条操作所需的时间`）
    3. `DBWrapper`收集到的每次操作的数据最终将在`com.yahoo.ycsb.measurements` 以及`com.yahoo.ycsb.measurements.exporter` package中汇总和格式化：（如`test_redis.txt`中显示的格式）
      - 值得注意，在`com.yahoo.ycsb.generator package`所有类的作用，是因为`非关系数据库`是`key-value`的模式，我们将通过该generator生成可用且不重复的key值

## 尾声

据说`YCSB`的一大优点在于其扩展性，然而编写代码仍是件很烦躁的事情（对不熟悉`JAVA`的同学更是如此），tips：参考*Client.java文件，实现对特定数据库的连接和`CRUD`基本操作，即可生成想要的结果。

## 附录

- 安装tcl8.5或更改版本

```bash
wget http://downloads.sourceforge.net/tcl/tcl8.6.4-src.tar.gz
tar -xf ../tcl8.6.4-html.tar.gz –strip-components=1
# 下列配置源自tcl官网，复制运行即可
export SRCDIR=pwd &&
cd unix &&
./configure –prefix=/usr \
–mandir=/usr/share/man \
([ (uname -m) = x86_64 ] && echo –enable-64bit) &&
make &&
sed -e “s#SRCDIR/unix#/usr/lib#” \
-e “s#SRCDIR#/usr/include#” \
-i tclConfig.sh &&
sed -e “s#SRCDIR/unix/pkgs/tdbc1.0.3#/usr/lib/tdbc1.0.3#” \
-e “s#SRCDIR/pkgs/tdbc1.0.3/generic#/usr/include#” \
-e “s#SRCDIR/pkgs/tdbc1.0.3/library#/usr/lib/tcl8.6#” \
-e “s#SRCDIR/pkgs/tdbc1.0.3#/usr/include#” \
-i pkgs/tdbc1.0.3/tdbcConfig.sh &&
sed -e “s#SRCDIR/unix/pkgs/itcl4.0.3#/usr/lib/itcl4.0.3#” \
-e “s#SRCDIR/pkgs/itcl4.0.3/generic#/usr/include#” \
-e “s#SRCDIR/pkgs/itcl4.0.3#/usr/include#” \
-i pkgs/itcl4.0.3/itclConfig.sh &&
unset SRCDIR
```