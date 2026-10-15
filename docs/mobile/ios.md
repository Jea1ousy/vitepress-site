---
title: iOS、Swift 与移动端通用基础面试题
description: 从 Android 视角理解 Swift 值语义、ARC、RunLoop、GCD、Swift 并发、SwiftUI 状态与性能工具。
---

# 11 · iOS 与 Swift 基础

这章提供移动端拓展所需的核心概念。可以对照 Android 理解，但**相似的职责不等于相同的实现和生命周期规则**。

## 类型与对象寿命

### Swift 的 struct 与 class 有什么区别？ {#swift-types}

struct 采用值语义，class 采用引用语义并支持继承等能力。把值类型赋给另一个变量，语义上得到独立的值；引用类型赋值则可以指向同一对象。

Swift 标准库集合等可能使用写时复制优化，但它不改变值语义约定。不能把“struct 一律在栈上，class 一律在堆上”当成语言保证，实际存储受编译器与上下文影响。

**追问：struct 里有 class 属性会怎样？** 外层值复制不意味着内部引用对象递归复制，仍可能共享内部实例。[官方：类与结构体](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/classesandstructures/)。

### ARC 与 Android 常见的 tracing GC 有何不同？ {#arc}

ARC 管理类实例的引用计数与相关所有权，引用关系释放后可以销毁对象；它不会自动识别并解除所有强引用环。tracing GC 则基于可达性判断，通常能处理不再可达的纯对象环。

**共同点是仍要设计所有权。** ARC 下的闭包强引用环、Android 下单例持有页面，都可能使对象活得过久。文件、播放器等外部资源也需要明确关闭协议。

<KnowledgeFlow title="闭包形成强引用环的典型过程" :steps="[
  { title: '对象保存回调', detail: 'Controller 强持有一个闭包属性' },
  { title: '闭包捕获 self', detail: '闭包又强持有 Controller' },
  { title: '外部离开', detail: '外部引用释放后，环内仍互相持有' },
  { title: '解除关系', detail: '按所有权设计弱捕获，或适时清空回调' }
]" />

[官方：ARC](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/)。

### `weak` 和 `unowned` 怎么选，闭包都要 `[weak self]` 吗？ {#weak}

`weak` 不拥有实例，在对象释放后自动变为 nil，因此通常用可选引用；`unowned` 也不拥有实例，但要求使用时对象仍存活，违反假设会出错。

```swift
final class Owner {
    var callback: (() -> Void)?
    func install() {
        callback = { [weak self] in self?.refresh() }
    }
    private func refresh() { /* 更新业务 */ }
}
```

是否弱捕获取决于闭包是否逃逸、谁持有它、应该让对象活多久。**弱捕获不是所有异步代码的固定模板。** 长任务中把 weak self 提升成强引用，也会在该范围内延长寿命。[官方：ARC 的闭包引用环](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/#Strong-Reference-Cycles-for-Closures)。

## 事件循环与并发

### RunLoop 是线程吗，Timer 为什么不精确？ {#runloop}

RunLoop 是线程上的事件处理循环机制，协调输入源、定时器等事件；它本身不是新线程。线程是否运行适当的 RunLoop，以及运行在哪个 mode，会影响相应事件何时处理。

Timer 的触发受调度、执行负载和 mode 等影响，不是硬实时保证。计时业务应根据合适时钟计算实际经过时间，不能仅靠“每次回调减一”维持准确性。

**追问：和 Android Looper 一样吗？** 可以比较事件循环职责，但消息类型、mode 和系统集成细节不同。[官方：RunLoop](https://developer.apple.com/documentation/foundation/runloop)。

### GCD 的串行/并发与同步/异步是同一个维度吗？ {#gcd}

串行或并发描述队列安排任务的能力；同步或异步描述提交调用是否等待任务结束。并发队列不是保证每个任务同时运行，异步提交也不代表一定新建线程。

在主队列正在执行的代码中，再同步提交到主队列，会形成等待自身的死锁；其他同步等待环也可能造成死锁。UI 更新要遵守主线程与对应框架的隔离约定。

**追问：barrier 能锁住所有队列的共享数据吗？** 不能随意这么推导，必须明确队列类型和所有访问是否受同一协调机制约束。[官方：Dispatch Queues](https://developer.apple.com/library/archive/documentation/General/Conceptual/ConcurrencyProgrammingGuide/OperationQueues/OperationQueues.html)。

### Swift `async/await`、Task 与 actor 解决什么？ {#swift-concurrency}

`async/await` 表达可挂起异步调用；结构化任务管理并发工作的关系与结果；actor 隔离可变状态的访问。`async` 本身不应被解释成“必定在某条后台线程运行”。

**actor 也要考虑逻辑重入。** 方法经过 `await` 时可能让出执行，恢复后共享状态已变化；先检查条件、挂起请求、再写状态，仍要重新验证业务前提。

`MainActor` 为 UI 相关状态提供主 actor 隔离，不意味着其中可执行长时间重计算。任务取消同样需要配合检查，并明确资源清理。[官方：Swift 并发](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)。

## 状态、平台与性能

### SwiftUI 的 `State`、`Binding` 与观察模型如何理解？ {#swiftui-state}

`State` 表达由视图关联存储拥有的状态；`Binding` 提供对另一处状态的读写连接；观察模型将外部数据变化连接到界面更新。具体属性包装器选择取决于部署版本与 Observation 等技术栈。

**不要把 View struct 的重新创建，等同于关联状态必然全部丢失。** SwiftUI 的身份和框架管理的状态存储很重要；反过来，身份变化也会导致状态重置。

与 Compose 一样，保持单一状态来源，避免父子各持有互相同步的副本。具体 API 不应从另一平台逐字映射。[官方：管理 UI 状态](https://developer.apple.com/documentation/swiftui/managing-user-interface-state)。

### iOS 前后台与 Android Service 可以直接对应吗？ {#ios-lifecycle}

不能。iOS 的应用、scene 与页面生命周期有自己的职责；进入后台后可以执行的工作受场景与系统能力约束。音频、定位、任务调度等需选择平台允许的机制，不能模拟一个永久运行的普通 Android Service。

移动端通用原则是把重要状态及时持久化，工作设计为可恢复，并正确处理暂停、取消、恢复与授权变化。多窗口或多 scene 时还应明确状态共享范围。[官方：应用生命周期](https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle)。

### iOS 卡顿和内存问题怎么定位？ {#ios-performance}

使用 Instruments 的时间采样、内存与分配等工具，结合 Xcode 诊断、主线程与布局现场分析；线上可结合平台提供的指标能力。先界定用户场景，再选择工具。

列表图片解码、主线程 I/O、重复布局、过重的状态更新和错误引用关系都是可能因素，但必须用采样证据确认。SwiftUI 视图更新次数也不能单独代表帧性能。

**面试讲法：** 描述设备、系统、构建、路径、基线、证据、改动与回归数据，和 Android 性能案例采用相同的验证纪律。[官方：应用性能](https://developer.apple.com/documentation/xcode/improving-your-app-s-performance)。

## 平台对照速记

| 关注点 | Android 常见体系 | iOS 常见体系 |
| --- | --- | --- |
| 对象内存 | ART tracing GC 与 native 资源管理 | ARC 与相应资源管理 |
| 事件循环 | Looper / MessageQueue | RunLoop |
| 声明式 UI | Compose | SwiftUI |
| 异步与隔离 | Kotlin 协程、dispatcher、Mutex 等 | Swift Concurrency、actor、GCD 等 |
| 诊断 | Perfetto、Android Studio 工具 | Instruments、Xcode 工具 |

上表只做职责对照，不表示机制一一等价。面试前请用自己最熟悉的平台，解释另外一个平台的差异及讨论前提。
