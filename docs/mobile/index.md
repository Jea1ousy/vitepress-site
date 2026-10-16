---
title: Android 与移动端八股学习地图
description: 以问答、原理图、代码和场景追问系统整理 Android、Kotlin、Compose、性能优化、iOS 与跨端开发面试知识。
outline: [2, 3]
---

# Android 与移动端八股学习地图

一次点击为什么能变成屏幕上的一帧？页面旋转后数据为什么还在，进程被杀后又为什么丢了？“用了协程”为什么仍然会卡顿？这套知识库沿着**语言 → 系统 → UI → 并发 → 架构 → 工程 → 场景**展开，帮助你把答案连成完整的工作过程。

写作形式参考[小林 coding 的 HTTP 面试题](https://xiaolincoding.com/network/2_http/http_interview.html)：按主题组织问题，用图解和例子解释机制，再回答常见追问。本文内容为围绕移动端重新整理的原创讲解。

当前共 **27 个专题、300 道问答、40 处图解**，分为基础总览与进阶专项，配有流程图、状态图、时序图、代码与对比表。可从[全部题目索引](./questions)直接跳到答案，或沿[官方资料与源码路线](./resources)继续深入。

::: tip 怎么用这套八股
每题先用 30 秒说清结论，再用 2 分钟讲原理、边界和一个项目例子。能够解释“为什么这样做、什么时候不适用、如何验证”，比背 API 名字更有用。
:::

<KnowledgeFlow title="移动端知识地图：一次用户操作经过哪些层？" :steps="[
  { title: '界面与状态', detail: 'View / Compose / SwiftUI 接收输入，状态驱动显示' },
  { title: '业务与并发', detail: 'ViewModel、协程和任务边界协调业务' },
  { title: '数据与系统', detail: '网络、数据库、IPC 和系统调度提供能力' },
  { title: '质量与交付', detail: '性能、测试、安全与发布验证用户体验' }
]" caption="图中是理解问题的分层，不表示所有请求都必须经过相同的技术栈。" />

## 基础总览：先连起完整知识体系

| 章节 | 你需要回答的核心问题 | 建议优先级 |
| --- | --- | --- |
| [01 · Java、Kotlin 与运行时](./language) | 空安全、泛型、集合、JMM、GC 和 ART 如何影响代码？ | P0 |
| [02 · 组件、生命周期与后台任务](./components) | 页面、进程、状态保存与后台工作各活多久？ | P0 |
| [03 · Handler、Binder 与系统启动](./framework) | 线程怎样收消息，进程怎样通信，应用如何启动？ | P0 |
| [04 · View、事件分发与渲染](./view) | 点击如何分发，布局如何测量，一帧如何显示？ | P0 |
| [05 · 协程、Flow 与并发](./coroutines) | 挂起、取消、异常、热流和生命周期如何协作？ | P0 |
| [06 · Jetpack Compose](./compose) | 状态、重组、副作用和 UI 身份是什么关系？ | P0 |
| [07 · 架构、Jetpack 与可测试性](./architecture) | 状态与依赖放在哪里，怎样控制复杂度？ | P0 |
| [08 · 网络、图片与本地存储](./network-storage) | 请求、缓存、弱网、图片和离线数据如何一致？ | P0 |
| [09 · 启动、卡顿、内存与稳定性](./performance) | 如何用指标和证据找到真正的性能瓶颈？ | P0 |
| [10 · 构建、发布、适配与安全](./engineering) | 从源码到安装包如何保证兼容、可靠和安全？ | P1 |
| [11 · iOS 与 Swift 基础](./ios) | ARC、RunLoop、Swift 并发和声明式 UI 有何特点？ | 按岗位 |
| [12 · Flutter、React Native 与 KMP](./cross-platform) | 跨端到底复用哪一层，性能代价在哪里？ | 按岗位 |
| [13 · 场景设计与面试自测](./scenarios) | 如何设计信息流、搜索、下载和可靠发布？ | P0 |

## 进阶专项：实现、故障与源码追问

| 专题 | 本轮补充的重点 | 建议前置 |
| --- | --- | --- |
| [14 · 集合、类加载与运行时](./collections-runtime) | 扩容、树化、并发容器、紧凑集合、引用队列与 ART | 01 |
| [15 · Kotlin 机制与互操作](./kotlin-advanced) | lazy 模式、委托、密封类型、值类、SAM 与 JVM 边界 | 01 |
| [16 · 线程池、锁与并发故障](./java-concurrency) | 队列与拒绝、ThreadLocal、Future、AQS 与死锁 | 01、05 |
| [17 · Framework 与 Binder 深入](./framework-internals) | Zygote、启动事务、Provider 顺序、重入与调用身份 | 02、03 |
| [18 · 渲染管线与复杂列表](./rendering-advanced) | inflate、重复测量、RenderNode、Surface、缓冲与恢复 | 04 |
| [19 · 协程状态机与 Flow](./coroutines-internals) | Continuation、任务树、取消竞争、Channel 与共享策略 | 05 |
| [20 · Compose 状态、布局与测试](./compose-advanced) | Snapshot、组合身份、延后读取、Subcompose 与语义 | 06 |
| [21 · 网络协议与 OkHttp](./network-advanced) | TCP、HTTP/2/3、TLS、调度、拦截器与连接复用 | 08 |
| [22 · 数据库与离线同步](./storage-advanced) | WAL、索引、执行计划、keyset、Outbox 与原子文件 | 08 |
| [23 · 性能诊断与线上治理](./performance-diagnostics) | Perfetto、等待链、retained size、PSS、LMK 与分位数 | 09 |
| [24 · 音视频与相机](./media-camera) | PCM、封装、GOP、时间戳、MediaCodec、DRM 与 CameraX | 04、08、09 |
| [25 · 构建、Native 与安全](./build-native-security) | 变体、依赖、KSP、JNI、ABI、页大小与外部入口 | 10 |
| [26 · iOS Runtime 与并发](./ios-advanced) | 写时复制、消息派发、actor 重入、Sendable 与列表 | 11 |
| [27 · 跨端架构与性能](./cross-platform-advanced) | Flutter 更新、Fabric、TurboModules、KMP/Swift 互操作 | 12 |

进阶题不是按题号越大就越难排序。Android 岗优先 14—25，iOS 与跨端专项按岗位要求补充；每个专题都附有失败场景或实验路线。

P0 表示 Android 岗位优先掌握；P1 表示需要结合项目深入。iOS、Flutter、React Native 和 KMP 是移动端拓展，并不要求每个 Android 候选人都熟练使用全部框架。

## 高频问题直达

| 常见提问 | 去哪里看 |
| --- | --- |
| `volatile` 能保证 `count++` 吗？ | [可见性、原子性与有序性](./language#jmm) |
| ViewModel 能扛住进程死亡吗？ | [三层状态恢复](./components#state-restoration) |
| Looper 死循环为什么不 ANR？ | [等待消息与阻塞业务](./framework#looper-anr) |
| Binder 是不是永远只复制一次？ | [IPC 路径与边界](./framework#binder) |
| 父容器拦截后子 View 收到什么？ | [手势序列和 CANCEL](./view#touch-dispatch) |
| `suspend` 会自动切后台线程吗？ | [挂起与调度器](./coroutines#suspend) |
| StateFlow 能保证每个事件送达吗？ | [状态与事件](./coroutines#stateflow-events) |
| 重组是不是整页重绘？ | [Compose 三阶段](./compose#recomposition) |
| 数据库和网络谁是真相来源？ | [离线优先架构](./network-storage#offline-first) |
| ANR 都是主线程执行了 5 秒吗？ | [不同 ANR 类型](./performance#anr) |
| 跨端是不是一定更省人力？ | [选型中的共享边界](./cross-platform#selection) |
| 无界队列下 maximumPoolSize 为什么可能不起作用？ | [线程池调度](./java-concurrency#pool-dispatch) |
| limitedParallelism 能限制在途请求数吗？ | [执行并行度与业务并发](./coroutines-internals#parallelism) |
| 数据库为什么越翻页越慢？ | [OFFSET 与 keyset](./storage-advanced#keyset) |
| 系统低内存杀进程能被全局异常捕获吗？ | [LMK 与 OOM](./performance-diagnostics#lmk-oom) |
| 图片缓存命中，为什么视频仍因授权失败不能播？ | [媒体缓存与 DRM](./media-camera#cache-drm) |

## 建议学习路线

### 第一次准备 Android 面试

1. **第 1—2 天：语言和生命周期。** 解释线程安全、配置变更、进程死亡，画出组件生命周期。
2. **第 3—4 天：消息、IPC 和 UI。** 把一次启动、一次点击、一次绘制串起来。
3. **第 5—6 天：协程和 Compose。** 手写可取消搜索，解释状态恢复与副作用。
4. **第 7—8 天：架构、网络和存储。** 设计离线信息流，补齐错误处理与一致性。
5. **第 9—10 天：性能和工程。** 用真实 trace、堆转储或基准数据讲一次优化。
6. **第 11—14 天：场景模拟与岗位专项。** 用最后一章自测，再按 JD 补 iOS 或跨端。

这是一条可调整的学习顺序，并不是在两周内掌握全部知识的承诺。每天至少选择一题，在设备上做实验验证。

### 继续深入的四条路线

- **源码与系统：** 14 → 16 → 17 → 18，画清对象、线程、进程和显示管线。
- **现代 UI 与并发：** 15 → 19 → 20，重点验证取消、状态观察、恢复和任务身份。
- **业务与质量：** 21 → 22 → 23 → 25，用离线信息流串起协议、存储、排障与交付。
- **岗位专项：** 视频/直播/相机岗加 24，iOS 加 26，Flutter/RN/KMP 加 27。

每条路线的源码入口、可验证实验与官方阅读链接见[资料路线](./resources)。

### 已有项目经验，准备深入追问

按“故障现象 → 假设 → 采样证据 → 根因 → 修复 → 回归指标”整理项目故事。不要只说“把任务放到子线程，速度提升很多”，要说明设备、构建类型、样本量、P50/P95、失败率，以及为此付出的资源或复杂度成本。

## 内容边界与资料使用

- **整理日期：2026-10-16。** 稳定原理与版本行为分开讲解；后台限制、权限、构建插件和跨端架构需要结合 OS、targetSdk 与依赖版本复核。
- **代码是聚焦机制的片段。** 省略项目已有的 import、依赖注入和部分业务类型；片段旁会说明关键前提。它们不是完整可运行的 Android 或 iOS 工程。
- **原理图做了抽象。** 箭头表示逻辑顺序或依赖，不能当作所有系统版本的源码调用栈。
- **每章给出官方出处。** 优先查 [Android Developers](https://developer.android.com/)、[AOSP](https://source.android.com/)、[Kotlin 文档](https://kotlinlang.org/docs/home.html)和对应平台文档，再用目标版本源码验证实现细节。

可以从 [Java、Kotlin 与运行时](./language) 开始，也可以直接进入 [场景设计与面试自测](./scenarios)。
