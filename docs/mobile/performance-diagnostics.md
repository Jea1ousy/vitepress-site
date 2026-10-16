---
title: Perfetto、ANR、内存与线上指标实战追问
description: 调度状态、Frame Timeline、等待链、retained size、PSS、LMK、native 堆采样、基准设计、分位数和耗电。
---

# 23 · 性能诊断与线上治理

“主线程慢”“内存高”只是现象。先找时间窗口与责任链，再提出可证伪的假设。这里补充[性能基础](./performance)之后最常见的诊断追问。

## 时间线与因果关系

### trace 上线程 runnable，却没有执行，是函数本身太慢吗？ {#scheduling}

不一定。runnable 表示具备执行条件，但可能仍在等 CPU；线程正在 running 才表示得到调度，睡眠或阻塞又是不同原因。高负载、优先级、核数和系统竞争都可能扩大等待。

把同一时间窗口的线程状态、CPU 占用和相关依赖一起看。不能把墙上时间中的全部空档算进某个方法的纯计算耗时，也不能盲目增加线程来解决调度竞争。[官方：Perfetto CPU 调度](https://perfetto.dev/docs/data-sources/cpu-scheduling)。

### Frame Timeline 怎样帮助区分应用迟到与显示链路迟到？ {#frame-timeline}

它将期望与实际帧时序等信息关联起来，帮助定位帧是否按计划产生、提交和呈现；进一步结合 UI、渲染线程和系统合成轨道分析。适用数据与细节取决于系统和采集配置。

录屏看到跳动可以证明体验异常，但不能单独定位哪个线程或 GPU 阶段。相反，一段方法很快也不能证明最终帧按时显示。[官方：Frame Timeline](https://perfetto.dev/docs/data-sources/frametimeline)。

### ANR 主线程在等锁，为什么必须继续找锁的持有者？ {#anr-wait-chain}

等待点往往不是根因。锁持有者可能正在慢磁盘、同步 Binder 或等待第三个任务；只把主线程那一行改成另一个锁，可能保留同一依赖问题。

<KnowledgeFlow title="沿等待链找真正不能推进的位置" :steps="[
  { title: '主线程', detail: '等待业务锁，无法处理后续输入' },
  { title: '持锁线程', detail: '持锁期间等待同步远程结果' },
  { title: '远端 / 资源', detail: '继续确认 CPU、I/O、回调和锁依赖' },
  { title: '修复边界', detail: '缩小锁范围、移除同步等待或重构协议' }
]" caption="箭头表示等待关系，不表示每个 ANR 都经历这条路径。" />

还要确认采样是否覆盖真正阻塞时刻，避免从较晚的空闲堆栈得出错误结论。[官方：ANR 诊断](https://developer.android.com/topic/performance/issues/anr)。

### 方法采样、插桩和系统 trace 各有什么盲区？ {#profiling-methods}

采样以时间点近似热点，可能漏掉很短或低频路径；插桩可得到更细调用信息，但本身会增加成本；系统 trace 擅长跨线程与调度关系，未必直接提供所有业务函数细节。

工具改变负载的程度也要控制。先用低开销信息缩小窗口，再对热点深入；不能把 debug 插桩下的绝对数字直接承诺为 release 用户耗时。[官方：系统跟踪](https://developer.android.com/topic/performance/tracing)。

## 堆、进程与终止

### shallow size、retained size 与 dominator 怎样帮助找泄漏？ {#heap-analysis}

shallow size 是对象自身的存储，retained size 近似表达该对象释放后可一并释放的受支配对象规模；dominator 关系帮助找重要持有点。但“占得大”不等于“持有错误”。

一份合法图片缓存也可能 retained 很大。先确定页面或任务应已结束，再沿 GC root 路径找第一个不合理的长寿命引用，并重复进入退出验证趋势。[官方：分析堆转储](https://developer.android.com/studio/profile/capture-heap-dump)。

### RSS、PSS、Java heap 和 native heap 为什么不能直接相加比较？ {#memory-metrics}

这些指标的口径不同：RSS 关注驻留页，PSS 对共享页按比例分摊，托管堆和 native 分配统计又描述不同分配体系。图形缓冲、映射和共享库还可能影响进程指标。

固定设备、采样时机和口径，再看分配、存活和驻留趋势。对象释放后，分配器或系统未立刻把所有页归还，也不能据此单独断言存在泄漏。[官方：Android 内存管理](https://developer.android.com/topic/performance/memory-overview)。

### 系统低内存杀进程和 Java OOM，为什么不是一种故障？ {#lmk-oom}

OOM 是某次分配无法满足等错误路径；系统低内存治理可能直接终止进程，应用未必有机会抛 Java 异常或执行 onDestroy。两种情况的现场、回调和治理办法不同。

使用可用的退出原因信息、系统报告与内存趋势交叉判断；ApplicationExitInfo 的可用性和记录内容受平台限制。不要用全局 UncaughtExceptionHandler 宣称能捕捉所有退出。[官方：ApplicationExitInfo](https://developer.android.com/reference/android/app/ApplicationExitInfo)。

### native 堆采样能找出每一处泄漏吗，采样率怎么影响结果？ {#native-heap}

native 堆采样记录部分分配及调用信息，可帮助识别热点与未释放趋势；它不是完整记录每个字节的万能日志。采样间隔、符号、采集范围和负载都会影响可见性与开销。

先保证符号匹配，再结合 repeated scenario 和总量趋势。没有出现在采样中的小对象不一定不存在，某处大量分配也不一定是泄漏，仍需验证释放路径。[官方：heapprofd](https://perfetto.dev/docs/data-sources/native-heap-profiler)。

## 指标、基准与资源预算

### P50、P95、P99 各说明什么，平均值改善为什么可能伤害长尾？ {#percentiles}

分位数描述样本排序后的相应位置，平均值则对所有样本求均值；它们回答不同问题。大多数请求变快、少数请求严重变慢时，平均值和尾部指标可能给出不同方向。

需要同时说明样本量、分组、失败样本如何计算，以及客户端还是服务端口径。不要把多个分组的 P95 再直接平均成整体 P95，也不要只删除超时样本后宣称延迟降低。[官方：分位数与聚合](https://prometheus.io/docs/practices/histograms/)。

### 可复核的 Macrobenchmark 要控制哪些条件？ {#benchmark-design}

设备、系统、构建类型、编译模式、温度、缓存、账户和网络状态都会影响结果。先定义关键用户路径及重置方式，避免一组测冷状态、另一组测已预热状态。

多轮观察与适当统计比“最快一次”可靠；还应报告失败与波动。性能门禁应建立在稳定可重复的环境和合理预算上，而不是对随机噪声频繁报警。[官方：Macrobenchmark](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview)。

### `reportFullyDrawn` 放早一点是不是就完成 TTFD 优化？ {#metric-gaming}

只是改变里程碑，不能让用户更早完成操作。TTFD 的业务含义应与关键内容及可用状态对齐，骨架屏、首帧、关键数据可见与可交互要明确区分。

延后初始化还可能把启动成本推到下一次点击，所以回归要覆盖启动后的关键操作。打点口径变化要单独记录，不与旧数据直接比较为性能收益。[官方：启动最佳实践](https://developer.android.com/topic/performance/appstartup/best-practices)。

### WakeLock、任务合并与后台约束怎样影响耗电治理？ {#power-budget}

WakeLock 用于特定场景维持相应设备状态，需要最小范围、超时与可靠释放；它不是绕过全部后台限制的授权。频繁网络唤醒、定位和重试也可能比某段 CPU 计算更影响电量。

把可延迟任务批处理、设置约束和重试预算，再测实际用户路径的资源成本。不能为了省电丢失必须完成的任务，应把恢复与调度一同设计。[官方：WakeLock](https://developer.android.com/develop/background-work/background-tasks/awake/wakelock)。

## 诊断速查

| 现象 | 优先补充的证据 | 不要直接下的结论 |
| --- | --- | --- |
| 主线程 runnable 很久 | CPU 调度、竞争线程、核负载 | 某一业务函数纯计算慢 |
| 堆下降但 PSS 没降 | 驻留页、native/图形内存、分配器 | 一定存在 Java 泄漏 |
| ANR 堆栈在等锁 | 持锁者、远端、现场时间窗口 | 等待位置就是全部根因 |
| 启动均值降低、投诉增加 | 分位数、机型与失败分布 | 优化已经全面成功 |

选一条线上问题，写下至少两个互斥假设，以及能区分它们的观测；这比列出十个工具名更接近实际排障。
