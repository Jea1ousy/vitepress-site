---
title: Flutter、React Native、KMP 与跨端开发面试题
description: 对比跨端复用边界，解释 Flutter 三棵树、布局约束、Isolate、平台通道、RN 新架构和 KMP。
---

# 12 · Flutter、React Native 与 KMP

跨端的核心问题是：**共享哪一层，以及平台差异由谁承担。** 不存在同时消除平台适配、原生集成、性能验证和维护成本的万能框架。

## 复用边界与选型

### 原生、Flutter、React Native、KMP 怎么选？ {#selection}

| 方案 | 主要共享边界 | 平台差异与主要成本 |
| --- | --- | --- |
| 原生 Android / iOS | 可共享协议、设计与部分底层库 | 两套 UI 与平台实现，控制力强 |
| Flutter | Dart 业务与 Flutter UI | 引擎、插件、平台视图和原生能力集成 |
| React Native | React / JS 业务与组件描述 | JS 执行、原生组件与平台接口协作 |
| Kotlin Multiplatform | 可共享模型、网络、业务等 | 平台实现与互操作；UI 共享另行选择 |
| WebView / Hybrid | Web 内容和部分业务 | 桥接、安全、加载与 Web 体验 |

KMP 可以与原生 UI 配合，也可以按目标平台采用 Compose Multiplatform；两者不能简单当成同义词。选型看团队经验、页面特点、原生 SDK、目标设备和发布成本。[官方：KMP 共享代码](https://kotlinlang.org/docs/multiplatform/multiplatform-share-on-platforms.html)。

## Flutter 的关键机制

### Flutter 的 Widget、Element、RenderObject 为什么分三层？ {#flutter-trees}

Widget 是不可变配置描述；Element 维护树中实例、身份及对应状态的关联；RenderObject 参与布局、绘制等渲染工作。频繁创建 Widget 不等于频繁重建所有底层渲染资源。

<KnowledgeFlow title="Flutter：配置如何落到渲染对象？" :steps="[
  { title: 'Widget', detail: '描述这一位置想显示什么' },
  { title: 'Element', detail: '协调身份、生命周期和新旧配置' },
  { title: 'RenderObject', detail: '执行尺寸计算、布局和绘制等工作' }
]" />

**追问：Key 有什么用？** 帮助框架判断更新时哪些对象对应同一身份；错误的 key 会造成局部 State 跟错项目。GlobalKey 功能更强但有成本，不是所有列表项的默认选择。[官方：Flutter 架构](https://docs.flutter.dev/resources/architectural-overview)。

### Flutter 布局为什么常说“约束向下、尺寸向上、父级定位置”？ {#flutter-layout}

父节点把约束传给子节点，子节点在约束内决定尺寸并返回，父节点再放置子节点。子节点声明一个宽度，不代表可以无视父级约束。

**追问：为什么 Column 里放列表会报无界高度？** 滚动容器通常需要明确视口，而父布局可能在该方向没有给出有限上界；需要根据意图用 Expanded、合适的有界容器或其他布局方案。

不要一看到报错就无条件 `shrinkWrap: true`。它可能改变布局成本，也未必是正确的滚动设计。[官方：布局约束](https://docs.flutter.dev/ui/layout/constraints)。

### Dart 的 `async` 和 Future 会自动多线程吗？Isolate 呢？ {#dart-isolate}

**不会。异步等待与并行计算是不同能力。** 一个 isolate 的事件循环可以等待 I/O，但在其中执行长 CPU 计算仍会阻塞该 isolate 处理其他工作。

Isolate 提供独立执行环境和消息通信，通常不共享普通可变对象内存。适合把足够重、可隔离的计算移走，但要衡量启动、消息传输与数据复制等成本；某些传输类型有专门优化。

Web 与移动端的执行能力不同，不能把 `compute` 等接口在所有平台都当成真实多核并行承诺。[官方：并发与 isolates](https://docs.flutter.dev/perf/isolates)。

### Platform Channel 与 FFI 怎么区分？ {#platform-channel}

Platform Channel 通过双方约定的消息协议连接 Dart 与 Android/iOS 平台代码，适合调用相机、系统服务等原生能力。FFI 则用于调用适合 C ABI 的 native 接口等场景，并不是互换写法。

接口要约定参数、错误码、线程、取消、版本和资源释放；高频发送大对象会增加编码与跨边界成本。请求返回时页面可能已经销毁，也要确认结果是否仍有接收者。

**追问：通道异步，native 回调就能阻塞主线程吗？** 不能。异步接口不代表底层工作自动切到合适线程。[官方：平台通道](https://docs.flutter.dev/platform-integration/platform-channels)。

### Flutter 还应该统一背“使用 Skia 渲染”吗？ {#impeller}

不应该把某个引擎后端作为所有平台与版本的恒定结论。Flutter 官方有 Impeller 等渲染路径，默认启用情况与支持范围取决于平台、版本和设备能力。

解释重点应是框架、引擎和 embedder 的分层，以及场景怎样经过布局、绘制与合成。排查时记录实际版本和渲染后端；升级前后在同设备测量，避免把 debug 表现当作 release 结论。[官方：Impeller](https://docs.flutter.dev/perf/impeller)。

## React Native、KMP 与 Hybrid

### React Native 还完全依赖旧的异步 Bridge 吗？ {#react-native}

不能只背旧架构。官方新架构围绕 JSI、Fabric 渲染器与 TurboModules 等能力演进；项目采用的版本与架构开关决定实际路径。

JSI 提供 JS 与 native 互操作能力，不等于每个调用都应同步执行，也不能保证线程切换和数据处理免费。Fabric 关注新渲染体系，TurboModules 关注 native 模块体系，职责不要混淆。

**追问：用了新架构就不会卡顿吗？** JS 侧长计算、频繁更新、大列表、图片和 native 工作仍可能成为瓶颈。[官方：新架构](https://reactnative.dev/architecture/landing-page)。

### React Native 的 JS 卡顿与原生 UI 卡顿怎么区别？ {#rn-performance}

先看用户操作需要哪些线程协作。JS 长任务可能让 JS 驱动逻辑迟缓；原生主线程或渲染工作过重，也可能让界面掉帧。部分原生驱动的操作能够在 JS 忙时继续，具体依赖实现路径。

优化要区分数据处理、列表渲染、组件更新、图片和跨边界调用；不要把所有问题归因到 Bridge。使用合适的性能工具，并在 release 构建验证。[官方：RN 性能概览](https://reactnative.dev/docs/performance)。

### KMP 的 `expect/actual` 有什么用？ {#kmp}

共享代码可以依赖平台能力的声明或抽象，由 Android、iOS 等 source set 提供实现。`expect/actual` 是其中一种机制，也可采用接口注入，避免公共层直接依赖 Android Context 等平台类型。

<KnowledgeFlow title="KMP：共享逻辑保留平台出口" :steps="[
  { title: 'commonMain', detail: '业务规则、数据模型与可共享接口' },
  { title: '平台实现', detail: 'Android / iOS 提供系统能力与适配' },
  { title: '应用层', detail: '选择原生 UI 或适用的共享 UI 方案' }
]" />

还要处理 Swift 互操作、错误和取消映射、线程隔离、依赖支持与产物发布。Kotlin/Native 的内存管理不能直接套用 ART 或 Swift ARC 的全部假设。[官方：平台相关声明](https://kotlinlang.org/docs/multiplatform/multiplatform-expect-actual.html)。

### Hybrid / WebView 桥接如何设计，跨端效果如何验证？ {#hybrid}

桥接协议要有限、版本化、可鉴权：约定能力名、参数、请求 ID、响应与错误，并限制可信页面和可调用能力。不能把任意 JS 字符串当成 native 命令执行。

选型验证应在目标设备上比较关键路径：冷启动、首屏、滚动、图片密集页、内存、包体积、插件兼容和故障恢复；同时测开发、调试与升级成本。

**没有脱离业务的固定性能排名。** 用同需求、同设备和正式构建做试点，再决定共享边界。[官方：WebView](https://developer.android.com/develop/ui/views/layout/webapps/webview)、[Flutter 性能分析](https://docs.flutter.dev/perf/ui-performance)。

## 面试前自测

如果团队已有成熟 Android/iOS 应用，只希望共享离线同步与业务规则，你会如何选共享边界？如果要做大量定制视觉的新产品，又如何验证跨端框架是否合适？请列出需要测量的数据，而不是只说“性能接近原生”。
