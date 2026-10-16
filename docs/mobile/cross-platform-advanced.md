---
title: Flutter、React Native、KMP 架构与性能追问
description: Flutter 身份与重绘、Dart 调度、Platform Views、Fabric、TurboModules、FlatList、KMP source set 与 Native/Swift 互操作。
---

# 27 · 跨端架构与性能深入

基础篇讲[复用边界](./cross-platform)，本章继续回答跨端框架内部怎样更新、跨语言如何交付结果，以及性能成本怎样测量。

## Flutter

### Widget 能否更新现有 Element，为什么同时看 runtimeType 和 key？ {#flutter-update}

在相应更新规则中，Widget 的类型与 key 帮助判断新配置是否可用于更新当前 Element。key 改变可能意味着身份变化，局部 State 和生命周期因此不同；并不是看到新的 Widget 实例就必然销毁整个子树。

GlobalKey 支持更强的身份与位置能力，也可能触发较昂贵的树调整；不要给每个普通行随意分配全局 key。相关订阅和控制器仍应按 State 生命周期释放。[官方：Widget.canUpdate](https://api.flutter.dev/flutter/widgets/Widget/canUpdate.html)。

### RepaintBoundary 能阻止 build、layout 和所有 GPU 成本吗？ {#repaint-boundary}

它主要隔离适当的重绘边界，使部分变化不必重新绘制无关内容，并可能配合缓存；不会自动阻止状态导致的 build 或所有布局工作，也不保证图层缓存一定获利。

边界太多可能增加图层和内存，复杂内容是否适合缓存还需测量。先确认瓶颈是 UI 构建、布局还是 raster，再选择优化手段。[官方：RenderRepaintBoundary](https://api.flutter.dev/flutter/rendering/RenderRepaintBoundary-class.html)。

### Dart 的 microtask、event queue 与 isolate 为什么要分开理解？ {#dart-scheduling}

单个 isolate 通过事件循环安排工作，microtask 与普通事件有不同调度时机；持续制造微任务可能推迟其他事件。Future 让代码异步衔接，不等于 CPU 计算自动去了另一核。

isolate 提供隔离执行与消息传递，适合足够重且可切分的工作；传输数据、创建和同步也有成本。UI 上的一段大 JSON 处理是否值得转移，应结合规模、平台与实际测量。[官方：Dart 并发](https://dart.dev/language/concurrency)。

### Platform Views 为什么常成为跨端性能与兼容边界？ {#platform-views}

嵌入原生视图需要协调不同渲染、合成、输入和无障碍体系，具体路径还随平台、系统和 Flutter 版本变化。地图、WebView 和播放器等不能假设与普通 Flutter Widget 完全同成本。

验证滚动、变换、遮挡、键盘、截图和生命周期，并记录所用合成方式。框架宣称支持嵌入，只说明有集成能力，不代表所有组合都无需平台专项测试。[官方：Android Platform Views](https://docs.flutter.dev/platform-integration/android/platform-views)。

### Flutter debug、profile、release 的性能为什么不能直接混比？ {#flutter-profiling}

调试能力、编译和诊断开销不同。用 profile 等适当模式分析帧与调用，再用目标 release 路径验证真实体验；不能拿 debug 热重载后的数字作为正式性能承诺。

区分 UI 侧工作与 raster 侧负载，记录后端、设备、温度、图片与网络状态。只减少 build 次数可能没有改善真正受 GPU 或平台视图限制的帧。[官方：Flutter UI 性能分析](https://docs.flutter.dev/perf/ui-performance)。

## React Native

### Fabric 的 render、commit、mount 各负责什么？ {#fabric}

render 根据 React 更新形成相应树，commit 协调树与布局等结果，mount 把必要变更应用到宿主视图。阶段与线程安排存在具体实现规则，不能把“JS 组件执行完”视为像素已经呈现。

<KnowledgeFlow title="RN 新架构：描述更新到宿主界面" :steps="[
  { title: 'Render', detail: '根据组件与状态构造更新描述' },
  { title: 'Commit', detail: '协调相应树和布局结果' },
  { title: 'Mount', detail: '把必要更新应用到宿主视图' },
  { title: '呈现', detail: '继续经过平台 UI 与显示管线' }
]" caption="阶段图不表示每阶段始终固定在一条线程，细节按使用版本核对。" />

新架构改善边界不代表所有大列表或原生组件都自动流畅。[官方：RN Render Pipeline](https://reactnative.dev/architecture/render-pipeline)。

### TurboModules、Codegen 与 JSI 分别解决哪一层？ {#turbo-modules}

TurboModules 组织新 native 模块体系，Codegen 根据接口定义生成相关边界代码，JSI 提供 JS 与 native 的互操作基础。它们一起减少部分旧路径的限制，但不等于任意调用都应同步或零复制。

接口仍要约定线程、错误、对象寿命、取消与版本；高频大数据传递依然可能昂贵。不能因为跨边界形式改变，就省略 native 能力的权限和参数验证。[官方：Turbo Native Modules](https://reactnative.dev/docs/turbo-native-modules-introduction)。

### FlatList 的 window、batch、memo 和稳定 key 怎样一起取舍？ {#flatlist}

渲染窗口和批量策略影响内存、首次展示、滚动空白与响应；memo 和稳定属性减少部分无效组件工作，但无法消除图片、布局与 native 绘制成本。稳定 key 仍表达业务身份。

参数不应照搬一个“万能最优值”。在目标设备上测快速滚动、混合高度、图片加载和交互，记录 blank areas、帧表现与内存；更新频繁的数据也要确认比较策略没有漏掉真实变化。[官方：FlatList 配置](https://reactnative.dev/docs/optimizing-flatlist-configuration)。

## Kotlin Multiplatform

### commonMain、平台 source set 与中间共享层如何影响依赖可见性？ {#source-sets}

commonMain 只能使用适合其目标集合的公共能力，平台 source set 可访问对应平台 API；层级结构可在部分目标之间共享代码。目录名字看起来通用，不代表其中引用的 Android 类就能进入所有平台。

把平台能力抽成接口或合适 expect/actual 出口，并检查库对目标平台的支持。依赖解析、发布元数据和构建插件版本也影响消费者能否正确选择产物。[官方：source set 层级](https://kotlinlang.org/docs/multiplatform/multiplatform-hierarchy.html)。

### Kotlin/Native 的内存管理和 Swift ARC 混合时容易漏掉什么？ {#native-arc}

现代 Kotlin/Native 使用自己的内存管理体系，不能再把早期冻结模型作为所有项目的当前规则。与 Swift/Objective-C 互操作时，又存在 ARC 对象和跨边界引用的释放时机与所有权问题。

保留对象、回调或 StableRef 等需按 API 明确解除；跨语言引用环和释放线程也应验证。把所有对象改成弱引用不是统一解决方案，可能让任务过早失去结果接收者。[官方：Native 内存管理](https://kotlinlang.org/docs/native-memory-manager.html)、[ARC 集成](https://kotlinlang.org/docs/native-arc-integration.html)。

### Kotlin suspend / Flow 暴露给 Swift，为什么不能假设取消自动等价？ {#swift-coroutines}

导出方式和适配层决定 Swift 怎样等待、取消和接收错误；一次异步函数调用与持续 Flow 订阅的所有权不同。Swift Task 被取消，不应未经验证就假定 Kotlin Job 与底层请求全部已结束。

明确错误映射、流开始停止、主 actor 更新及对象释放协议，测试页面销毁、取消竞争和进程恢复。工具链演进较快，应锁定所用导出方案与版本。[官方：Kotlin/Objective-C 互操作](https://kotlinlang.org/docs/native-objc-interop.html)。

### commonTest 通过，为什么还需要每个平台的集成测试？ {#cross-platform-tests}

公共测试验证共享规则，但无法覆盖每个平台的文件、网络、数据库驱动、权限、线程隔离和 UI 生命周期差异。平台实现与发布产物还需要独立验证。

先定义可共享契约，再用平台测试证明适配器符合它。例如同一离线同步算法，在 Android 与 iOS 都应验证取消、重试和持久化恢复，而不只是比较计算结果。[官方：KMP 测试](https://kotlinlang.org/docs/multiplatform/multiplatform-run-tests.html)。

## 选型验证

为一个真实混合页面设置启动、首屏、滚动、包体、内存与平台能力预算。按目标设备和 release 产物比较方案，同时记录开发与升级成本；不要从一张纯列表 demo 推导整个产品的长期收益。
