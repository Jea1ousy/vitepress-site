---
title: 移动端官方资料、源码与实验路线
description: 为 300 道移动端问答提供按方向组织的官方文档、标准、源码入口与可验证实验。
outline: [2, 3]
---

# 官方资料、源码与实验路线

本页把“还可以看什么”组织成阅读顺序：先用文档明确契约，再在指定版本源码里看实现，最后用实验验证边界。题目正文已就近标注参考链接；需要快速检索请看[全部题目索引](./questions)。

## 怎样使用资料

| 资料类型 | 主要回答 | 使用边界 |
| --- | --- | --- |
| 语言规范、RFC | 语义与必须遵守的约定 | 不能直接推导某个库的全部优化策略 |
| 官方 API 文档 | 使用契约、状态与限制 | 关注版本、平台与废弃说明 |
| 官方实现源码 | 该版本具体如何工作 | 内部类名、阈值和调用栈会变化 |
| 官方诊断指南 | 怎样采样、测量与定位 | 工具结果仍需结合场景解释 |
| 本文实验 | 验证自己的理解 | 最小用例不等于所有设备的性能结论 |

**资料核对日期：2026-10-16。** Framework 阅读样本使用 AOSP `android-16.0.0_r1`；Java 实现以 OpenJDK 21 为示例。Kotlin、Compose、Swift、Flutter、RN 和构建工具等滚动文档需要与项目使用版本对照。Apple 的归档文档适合解释经典运行时机制，现代 API 选择另查当前文档。

## 语言、集合与并发

| 入口 | 阅读重点 | 对应专题 |
| --- | --- | --- |
| [Java 内存模型](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html) | happens-before、锁、等待与数据竞争 | [01](./language)、[16](./java-concurrency) |
| [OpenJDK HashMap](https://github.com/openjdk/jdk21u/blob/master/src/java.base/share/classes/java/util/HashMap.java) | put、扩容、树化与迭代 | [14](./collections-runtime) |
| [ConcurrentHashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html) | 单次操作契约、复合更新与遍历 | [14](./collections-runtime) |
| [ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html) | 线程数、队列、拒绝与关闭 | [16](./java-concurrency) |
| [Kotlin 文档](https://kotlinlang.org/docs/home.html) | 类型、委托、值类、泛型与互操作 | [15](./kotlin-advanced) |
| [协程规范](https://kotlinlang.org/spec/asynchronous-programming-with-coroutines.html) | CPS、Continuation 与状态机 | [19](./coroutines-internals) |
| [协程 API](https://kotlinlang.org/api/kotlinx.coroutines/) | Job、取消、Channel、Flow 与测试 | [05](./coroutines)、[19](./coroutines-internals) |

**建议实验：** 构造 `volatile count++` 丢失更新；复现小线程池中父任务互相等待子任务；给回调桥接注入重复完成和取消竞争。解释可见性、原子性、调度与任务关系，而不仅观察是否偶尔成功。

## Android 系统与渲染

| 入口 | 阅读重点 | 对应专题 |
| --- | --- | --- |
| [AOSP Zygote](https://source.android.com/docs/core/runtime/zygote) | 派生进程、预建进程与共享边界 | [17](./framework-internals) |
| [ActivityThread 源码](https://android.googlesource.com/platform/frameworks/base/+/android-16.0.0_r1/core/java/android/app/ActivityThread.java) | bind application、Provider 与生命周期调度 | [17](./framework-internals) |
| [Handler 源码](https://android.googlesource.com/platform/frameworks/base/+/android-16.0.0_r1/core/java/android/os/Handler.java) | dispatchMessage 的分支顺序 | [03](./framework)、[17](./framework-internals) |
| [Binder 线程模型](https://source.android.com/docs/core/architecture/ipc/binder-threading) | 同步、异步、嵌套调用与重入 | [17](./framework-internals) |
| [Android 图形架构](https://source.android.com/docs/core/graphics) | Surface、缓冲、合成与同步 | [18](./rendering-advanced) |
| [Compose 阶段](https://developer.android.com/develop/ui/compose/phases) | 组合、布局、绘制与状态读取 | [06](./compose)、[20](./compose-advanced) |
| [Compose 性能实践](https://developer.android.com/develop/ui/compose/performance/bestpractices) | 延后读取、列表和实际性能验证 | [20](./compose-advanced) |

**建议实验：** 画启动泳道；记录父容器中途拦截后的 CANCEL；对比可重排列表的不同 key；做 Surface 销毁后旧回调到达的测试。每个图都标出进程、线程与对象寿命。

## 网络、数据库与离线协议

| 入口 | 阅读重点 | 对应专题 |
| --- | --- | --- |
| [RFC 9293 TCP](https://www.rfc-editor.org/rfc/rfc9293.html) | 字节流、建立关闭与可靠传输边界 | [21](./network-advanced) |
| [RFC 9110 HTTP 语义](https://www.rfc-editor.org/rfc/rfc9110.html) | 方法、幂等、条件与范围请求 | [08](./network-storage)、[21](./network-advanced) |
| [RFC 9111 HTTP 缓存](https://www.rfc-editor.org/rfc/rfc9111.html) | 新鲜度、验证与存储限制 | [08](./network-storage) |
| [RFC 9113 HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html)、[RFC 9114 HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html) | 复用、流控与传输差异 | [21](./network-advanced) |
| [OkHttp 官方源码](https://github.com/square/okhttp) | Dispatcher、RealCall、连接和资源管理 | [21](./network-advanced) |
| [SQLite WAL](https://www.sqlite.org/wal.html)、[查询计划](https://www.sqlite.org/queryplanner.html) | 事务、索引与执行路径 | [22](./storage-advanced) |
| [Room 文档](https://developer.android.com/training/data-storage/room) | DAO、关系、失效通知与迁移 | [22](./storage-advanced) |
| [离线优先数据层](https://developer.android.com/topic/architecture/data-layer/offline-first) | 本地读取来源、持久同步与冲突 | [08](./network-storage)、[22](./storage-advanced) |

**建议实验：** 对同一个请求分别制造慢 DNS、慢连接、慢首字节与慢响应体；创建十万行数据库比较 OFFSET/keyset；验证“远端已成功、确认丢失、进程重启”的幂等恢复。

## 性能、音视频与工程

| 入口 | 阅读重点 | 对应专题 |
| --- | --- | --- |
| [Perfetto 文档](https://perfetto.dev/docs/) | 调度、Frame Timeline、内存与跨线程证据 | [23](./performance-diagnostics) |
| [ANR 指南](https://developer.android.com/topic/performance/issues/anr) | 类型、现场时间和等待依赖 | [09](./performance)、[23](./performance-diagnostics) |
| [Macrobenchmark](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview) | 可复核路径、编译与测量条件 | [23](./performance-diagnostics) |
| [Media3](https://developer.android.com/media/media3)、[MediaCodec](https://developer.android.com/reference/android/media/MediaCodec) | 播放状态、解码、缓冲与时间 | [24](./media-camera) |
| [CameraX 分析](https://developer.android.com/media/camera/camerax/analyze) | 背压、ImageProxy 与线程 | [24](./media-camera) |
| [Gradle 手册](https://docs.gradle.org/current/userguide/userguide.html) | 依赖、缓存、输入输出和构建边界 | [25](./build-native-security) |
| [JNI 指南](https://developer.android.com/ndk/guides/jni-tips)、[页大小适配](https://developer.android.com/guide/practices/page-sizes) | 引用、线程、ABI 与加载 | [25](./build-native-security) |
| [Android 安全建议](https://developer.android.com/privacy-and-security/security-tips) | 授权、外部入口与数据边界 | [10](./engineering)、[25](./build-native-security) |

**建议实验：** 区分 Java OOM 与系统终止；让主线程等待持锁的 Binder 调用；复现相机分析器未 close 的积压；保存每次 release 的产物与符号，做一次正确还原。

## iOS 与跨端

| 入口 | 阅读重点 | 对应专题 |
| --- | --- | --- |
| [Swift Programming Language](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/) | 值语义、ARC、协议与并发 | [11](./ios)、[26](./ios-advanced) |
| [Swift Evolution](https://github.com/swiftlang/swift-evolution) | actor 重入、Sendable 与任务结构的设计语义 | [26](./ios-advanced) |
| [Apple 文档](https://developer.apple.com/documentation) | UIKit、SwiftUI、URLSession 和平台生命周期 | [26](./ios-advanced) |
| [Flutter 架构](https://docs.flutter.dev/resources/architectural-overview)、[Dart 并发](https://dart.dev/language/concurrency) | 三棵树、渲染、isolate 与平台边界 | [12](./cross-platform)、[27](./cross-platform-advanced) |
| [RN 新架构](https://reactnative.dev/architecture/landing-page) | Fabric、TurboModules 与宿主协作 | [27](./cross-platform-advanced) |
| [KMP 文档](https://kotlinlang.org/docs/multiplatform/get-started.html) | source set、目标平台与代码共享 | [27](./cross-platform-advanced) |
| [Kotlin/Native ARC 集成](https://kotlinlang.org/docs/native-arc-integration.html) | 跨语言持有与释放边界 | [27](./cross-platform-advanced) |

**建议实验：** 在 actor await 前后制造状态变化；为 Flutter 列表错误设置 key；让 KMP 流订阅随 Swift 页面离开而停止，验证 Kotlin Job 和底层资源确实结束。

## 读源码时记录什么

为每个专题保留一页笔记：版本与入口、关键数据结构、线程/进程边界、正常路径、失败与取消、状态恢复、实验与证据。遇到文档与观测不一致，先检查版本和场景，再提出最小复现；不要用一段实现覆盖规范的全部语义。
