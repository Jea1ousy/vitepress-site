---
title: iOS Runtime、Swift 并发与界面进阶
description: 写时复制、existential、Objective-C 消息、autorelease、RunLoop mode、任务结构、actor 重入、Sendable、Observation 和 UIKit。
---

# 26 · iOS Runtime、并发与界面深入

本章接续[iOS 基础](./ios)，覆盖 Swift 与 Objective-C 互操作、并发隔离和列表工程。Swift 的语言模式、默认隔离配置与部署系统会影响具体 API 和诊断，回答时说明前提。

## 类型与运行时

### 写时复制的值类型，为什么仍不能任意并发修改同一个变量？ {#cow}

写时复制可以让独立的值暂时共享存储，写入时再根据条件分离；这优化了值语义的实现，不代表同一个变量可被多个线程无协调地读写。独立副本与共享可变访问是两件事。

struct 包含引用类型字段时，也不意味着内部对象被递归复制。检查跨任务传递的数据图，而不只是看到最外层是 struct 就认为无竞争。[官方：值与引用语义](https://www.swift.org/documentation/articles/value-and-reference-types.html)。

### `some Protocol`、`any Protocol` 与泛型怎样选择？ {#opaque-existential}

泛型表达受约束但具体类型在相应调用中已知的抽象；opaque 返回保留一个隐藏但确定的具体类型身份；existential 容器可在运行时装入符合协议的不同类型。它们在类型关系、能力与成本上不同。

不能把 any 统一当作“免费泛型”，也不能因为 some 隐藏类型就返回任意互不相同的具体类型。协议关联类型和调用边界需要结合语言版本理解。[官方提案：existential any](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0335-existential-any.md)。

### Objective-C 消息发送与 Swift 调用为什么不能一概而论？ {#objc-runtime}

Objective-C 对象消息机制按 selector 与运行时方法查找等规则组织派发；Swift 可能使用直接、虚表、协议见证表或 Objective-C 互操作等不同路径，取决于声明和编译条件。

因此不能认为所有 Swift 方法都可被同一套 swizzling 改写。KVO、动态派发和 runtime 技巧都要确认是否处在支持的边界，避免把实现技巧写成语言保证。[官方归档：消息机制](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtHowMessagingWorks.html)。

### autoreleasepool 在 ARC 下还有什么作用，和 Core Foundation 所有权怎么区分？ {#autorelease}

ARC 管理强引用关系，但部分 Objective-C 自动释放对象仍受 autorelease pool 影响；大量临时对象的循环可以通过合适的局部 pool 控制峰值。它不强制释放仍被持有的对象，也不修复强引用环。

Core Foundation、Unmanaged 等互操作还涉及“是否转移拥有权”的约定，错误使用 retained/unretained 可能泄漏或过早释放。不能因为项目启用 ARC 就忽略所有手动桥接规则。[官方：自动释放池](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/mmAutoreleasePools.html)。

## 事件循环与 Swift Concurrency

### RunLoop 的 mode 为什么可能影响 Timer，common modes 是所有模式吗？ {#runloop-modes}

RunLoop 在某个 mode 中处理相应 sources、timers 和 observers；某个 timer 没在当前运行模式中，可能暂时得不到处理。common modes 是被标记为 common 的一组模式，不是所有已存在模式的别名。

注册到 common 也不是实时保证：主线程长任务和调度仍会推迟触发。计时正确性应依据实际时钟，不能靠把 timer 换 mode 就保证时间准确。[官方：RunLoop 管理](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Multithreading/RunLoopManagement/RunLoopManagement.html)。

### `Task {}`、`Task.detached`、`async let` 和 task group 怎样区分？ {#swift-tasks}

async let 和 task group 提供结构化任务组织，结果、等待和取消沿结构管理。Task 创建的非结构化工作需要另行管理寿命；detached 也不会自动继承所有调用环境，不能当作“安全切后台”模板。

创建方式影响隔离、优先级和 task-local 等传播规则，具体以 API 与语言模式为准。UI 离开时保存任务句柄并取消，也仍需任务配合；取消不是服务器事务回滚。[官方：结构化并发提案](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0304-structured-concurrency.md)。

### actor 已隔离状态，为什么 `await` 之后仍要重新检查业务条件？ {#actor-reentrancy}

actor 防止相应隔离状态被无序并发直接访问，但方法挂起后可以让出执行，其他工作可能改变状态。恢复时，“挂起前余额足够”“当前用户还是 A”等前提不一定成立。

<KnowledgeFlow title="隔离保护不等于整段异步逻辑不可插入" :steps="[
  { title: '检查状态', detail: '满足条件，准备发起异步操作' },
  { title: 'await 挂起', detail: '执行机会让出，其他任务可以改变状态' },
  { title: '恢复', detail: '读取到的业务世界可能已经变化' },
  { title: '重新验证 / 提交', detail: '按协议验证版本、预留或幂等提交' }
]" />

解决方式可能是先预留、记录版本并复核或重新设计协议，而不是把所有异步过程硬塞进阻塞锁。[官方：Actors 与重入](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0306-actors.md)。

### Sendable 与 `@Sendable` 是运行时锁吗？ {#sendable}

它们参与静态并发安全表达与检查，不会自动给所有字段加锁。类型是否可安全跨相应边界，取决于其状态和隔离设计；闭包捕获的变量也可能带来不安全共享。

`@unchecked Sendable` 是开发者承担的正确性承诺，不是关闭告警后风险消失。先理解编译器指出的共享可变访问，再选不可变值、actor 或合适同步。[官方：Sendable 提案](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0302-concurrent-value-and-concurrent-closures.md)。

## UI、网络与验证

### Observation、State、Binding 与旧 ObservableObject 怎样衔接？ {#observation}

Observation 改变模型可观察性与读取追踪的方式，State/Binding 则仍关注拥有和访问路径；旧的 ObservableObject 体系在既有项目中也有明确的使用约定。不能把一个属性包装器机械替换成另一个就完成迁移。

先确认模型由谁创建、视图身份是否稳定、谁可写状态，再按部署条件选择 API。恢复持久化与网络任务寿命仍需要独立设计。[官方：迁移到 Observable](https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro)。

### Diffable Data Source 的 item identifier 为什么必须稳定？ {#diffable}

snapshot 表达列表当前结构与身份，item identifier 用于判断新旧项对应关系。把可变展示内容直接当身份，可能让一次文本变化变成删除再插入，影响动画与局部状态。

图片异步返回仍需确认对应 item、版本和当前 cell，diffable 本身不解决旧回调错位。区分标识、展示数据和资源加载任务，并在正确线程/隔离约定下更新 UI。[官方：Diffable Data Source 更新](https://developer.apple.com/documentation/uikit/updating-collection-views-using-diffable-data-sources)。

### URLSession 的后台传输、取消与缓存为什么要分开设计？ {#urlsession}

普通异步请求与系统支持的后台传输具有不同配置、交付与恢复模型；取消本地任务不保证远端业务未执行。URL 缓存也遵守相应请求响应策略，不等同于业务数据库或永久离线能力。

请求身份、认证刷新、delegate 处理、重试和账号切换都应建立明确规则。恢复后的回调不能直接假设原页面仍存在。[官方：后台下载文件](https://developer.apple.com/documentation/foundation/downloading-files-in-the-background)。

### Auto Layout 的 hugging、compression resistance 和优先级怎么解释？ {#autolayout}

hugging 影响视图抗拒被拉伸的程度，compression resistance 影响抗拒被压小的程度；约束优先级用于表达发生冲突时的取舍。它们不能替代对内容固有尺寸和父级约束的理解。

大字体、多语言和动态内容容易暴露固定高度假设。排查先读冲突约束与最终布局，不要把所有优先级都设成最高来“强制正确”。[官方：Intrinsic Content Size](https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/AutolayoutPG/ViewswithIntrinsicContentSize.html)。

## 实验路线

构造 actor 在 await 前后状态变化的用例；再做稳定 ID 的异步图片列表，加入取消、重排和大字体。用 Instruments 或相关诊断确认对象寿命与主线程工作，而不是只观察页面是否暂时看起来正常。
