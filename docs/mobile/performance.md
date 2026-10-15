---
title: Android 启动、卡顿、内存与稳定性面试题
description: 用端到端指标、Perfetto、ANR 堆栈、内存引用链、Macrobenchmark 和 Baseline Profiles 定位性能问题。
---

# 09 · 启动、卡顿、内存与稳定性

性能优化是一条证据链：**定义场景与指标 → 采样 → 找瓶颈 → 改动 → 对照验证 → 线上观察**。工具名本身不是优化结论。

<KnowledgeFlow title="一次可复核的性能优化" :steps="[
  { title: '定义', detail: '明确用户路径、设备、构建类型和指标' },
  { title: '定位', detail: '用 trace、堆转储和分阶段数据找到瓶颈' },
  { title: '验证', detail: '控制条件，对照 P50 / P95 与功能正确性' },
  { title: '持续观察', detail: '灰度发布，检查稳定性与资源代价' }
]" />

## 启动与卡顿

### 冷启动、温启动、热启动怎么区分？TTID 和 TTFD 呢？ {#startup}

冷启动通常需要创建进程及应用；温启动保留部分进程或状态但仍需重建相关对象；热启动通常已有界面实例并回到前台。具体统计要遵守采用工具的定义，不能只凭“第二次点击”判断热启动。

TTID 关注初始显示时间；TTFD 关注应用报告完全绘制的时间。首帧可能只是骨架屏，不能代替“首屏关键内容可交互”的业务指标。

**追问：优化了 Application 打点，用户为什么没感知？** 可能真正瓶颈在 Provider、首屏布局、网络、数据库或报告点之后。应测完整关键路径。[官方：启动分析](https://developer.android.com/topic/performance/appstartup/analysis-optimization)。

### 启动优化为什么不能把所有初始化放到后台？ {#startup-optimize}

先把初始化分为首屏必需、可延后、按需加载三类，建立依赖关系。可并行不代表越多线程越快：线程竞争、磁盘争用和等待依赖都会拖慢首帧。

特别检查 SDK、Provider、反射扫描、类加载和磁盘读取。延后任务还要避免在用户首次点击时集中爆发，造成启动快了但下一步更卡。

**验证：** 比较同设备、同构建、相同缓存状态下的多轮结果，报告分位数与样本，不用一次录屏或 debug 日志证明提升。[官方：启动最佳实践](https://developer.android.com/topic/performance/appstartup/best-practices)。

### 卡顿如何区分主线程、RenderThread、GPU 和调度问题？ {#jank}

从受影响的帧回看时间轴：主线程是在长计算、布局、I/O、等锁，还是准备完成后下游渲染仍来不及？CPU runnable 却得不到调度，也与函数自身慢不同。

Perfetto / 系统跟踪可以把线程调度、帧时间线和系统事件放在同一个时间窗口观察。方法采样、布局检查和 GPU 工具是补充，不能只用一个“总耗时”归因。

**易错点：** 60Hz 的 16.67ms 不是适用于所有设备和所有阶段的固定预算。还要按刷新率和实际帧 deadline 分析。[官方：慢渲染](https://developer.android.com/topic/performance/issues/render)。

### ANR 都是“主线程执行超过 5 秒”吗？ {#anr}

**不是。ANR 有不同触发类型和超时规则。** 输入分发超时常见于 5 秒级阈值，但广播、服务、前台服务启动和 JobService 等检查还受具体类型、系统版本与状态影响。

主线程可能不是在执行慢代码，而是在等锁、等待同步 Binder 返回，或因其他线程与系统资源问题不能及时处理工作。后台 ANR 也不一定展示用户对话框。

排查先确认 ANR 类型与时间，再看主线程状态、锁持有者、Binder 对端、CPU 和调度。单个现场堆栈可能晚于真正阻塞时刻。[官方：ANR](https://developer.android.com/topic/performance/issues/anr)。

## 内存与稳定性

### 内存泄漏、内存抖动和 OOM 有什么区别？ {#memory}

| 问题 | 含义 | 典型证据 |
| --- | --- | --- |
| 泄漏 | 本应释放的对象仍被不合理持有 | 多次进出页面后保留对象和引用链 |
| 抖动 | 高频分配与回收 | 分配速率高、GC 频繁、伴随耗时 |
| OOM | 一次分配无法满足 | 分配失败、堆或其他内存限制现场 |

泄漏可能逐渐导致 OOM，但一次超大图片也能在没有泄漏时触发 OOM。频繁手动调用 GC 不能修复错误引用关系，反而可能增加停顿。[官方：内存管理](https://developer.android.com/topic/performance/memory-overview)。

### 泄漏工具发现 Activity 被保留，如何分析？ {#leak-analysis}

先确认这个对象在观察窗口后确实应被释放，然后沿引用链查找**第一个不合理的持有关系**，例如应用单例保存了页面 listener。不是看到任何字段就把它改成弱引用。

```text
长期存活对象 → 全局监听表 → 页面回调 → 已销毁 Activity
                        ↑ 应在生命周期结束时解除的关系
```

修复后反复进入退出页面，观察 retained 对象与内存趋势；同时确认回调、协程、播放器和文件资源真正停止。暂时去掉 UI 引用但让任务永远运行，只修复了部分问题。[工具原作者：LeakCanary 基础](https://square.github.io/leakcanary/fundamentals/)。

### Crash 治理为什么不能只加全局 `try/catch`？ {#crash}

全局捕获不能让处于损坏状态的应用安全继续执行，且 Java、native、系统终止等路径不同。正确治理包含符号化、聚类、影响用户数、版本与设备分布、复现和回归。

混淆后的 Java/Kotlin 堆栈需要对应构建的 mapping；native 崩溃需要匹配符号与 ABI。不能拿相邻版本符号文件解析后就相信结果。

**追问：Crash 率降低一定代表质量提升吗？** 还要检查 ANR、启动失败、功能完成率和是否改变了上报口径，避免把崩溃隐藏成不可观测失败。[官方：崩溃治理](https://developer.android.com/topic/performance/vitals/crash)。

## 基准、编译与资源

### Baseline Profile 与 Startup Profile 有什么区别？ {#baseline-profiles}

Baseline Profile 为关键执行路径提供配置，帮助 ART 提前优化；Startup Profile 主要参与构建时的 DEX 布局优化。二者目标相关，但不是一个文件改名。

它们适合围绕真实关键用户路径生成并验证，不能只覆盖空白启动页。性能数字受设备、编译状态和任务影响，不应承诺所有场景固定提升某个百分比。[官方：Baseline Profiles](https://developer.android.com/topic/performance/baselineprofiles/overview)、[Startup Profiles](https://developer.android.com/topic/performance/baselineprofiles/dex-layout-optimizations)。

### Macrobenchmark、Microbenchmark 与线上指标怎么配合？ {#benchmark}

Microbenchmark 适合测受控的小段热点代码；Macrobenchmark 适合启动、滚动等应用级路径；线上数据观察真实设备和用户分布。三者解决不同范围的问题。

基准测试要关注编译模式、release/profileable 配置、温度、缓存、系统噪声与设备一致性。一次极快样本不能代表用户体验，平均值也可能隐藏长尾。

**追问：优化速度后还测什么？** 内存、耗电、流量、失败率及业务正确性，防止用预加载换来无约束资源增长。[官方：Macrobenchmark](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview)。

### 耗电优化与包体积优化，从哪里入手？ {#battery-size}

耗电关注不必要的唤醒、后台工作、定位、网络重试与持续计算；可合并可延迟任务，利用系统约束并释放资源。不能为了省电直接禁止关键任务恢复。

包体积先分析 DEX、资源、图片、语言和 native 库的构成，再考虑 R8、资源压缩、合适图片格式与按设备分发。AAB 是发布格式，用户最终下载体积与上传文件大小不是一个数。

**共同原则：先测最大贡献项。** 删掉几行代码可能影响很小，一份重复打包的 native 库却很显著。[官方：电量优化](https://developer.android.com/topic/performance/power)、[缩小应用体积](https://developer.android.com/topic/performance/reduce-apk-size)。

## 面试前自测

准备一个有证据的优化案例，按“场景、基线、定位、改动、结果、代价、回归”讲述。至少说明一项你排除的假设，以及为什么数据不支持它。
