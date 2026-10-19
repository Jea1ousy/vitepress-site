---
title: Java 线程池、锁与并发故障进阶
description: 线程状态、wait/notify、ThreadLocal、线程池调度、拒绝策略、Future、AQS、死锁与安全发布。
---

# 16 · 线程池、锁与并发故障

面试里的并发问题最终会落到资源：CPU、线程、队列、锁与生命周期。先明确排队和取消策略，再讨论把线程数调大。

## 线程与等待

### BLOCKED、WAITING、TIMED_WAITING 分别表示什么？ {#thread-states}

Java Thread.State 描述 JVM 层状态：BLOCKED 常见于等待进入 synchronized 监视器；WAITING 可能来自无时限的 wait、join 或 park；带期限等待通常是 TIMED_WAITING。RUNNABLE 也不表示此刻必然占用 CPU 执行。

Android 排障还要看 Linux 调度状态与时间轴，不能把 Java 状态和内核状态逐字等同。主线程 WAITING 时，继续找“在等谁、由谁唤醒、是否形成依赖环”。[官方：Thread.State](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.State.html)。

### `wait`、`sleep`、`join` 为什么不能互相替代？ {#wait-sleep-join}

wait 用于监视器条件等待，调用者须持有对应监视器，等待时释放该监视器，醒来后重新竞争；sleep 暂停当前线程但不释放已持有的监视器；join 等待目标线程结束。

等待条件应放在循环中检查，以应对虚假唤醒和条件被其他线程改变：

```java
synchronized (lock) {
    while (!ready) {
        lock.wait();
    }
    consume();
}
```

`notify` 不等于被唤醒线程立刻执行；通知者仍可能持有锁。高层并发工具通常比手写等待协议容易维护。[官方：Object.wait](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#wait())。

### ThreadLocal 为什么可能泄漏，为什么线程池中特别容易出问题？ {#thread-local}

ThreadLocal 把变量值关联到当前线程。常见实现中弱引用 key 不意味着 value 也弱持有；线程池工作线程存活很久，任务结束后未清理的值可能长期滞留或污染后续任务。

```java
try {
    currentRequest.set(request);
    handle();
} finally {
    currentRequest.remove();
}
```

协程恢复后可能换线程，不能把 ThreadLocal 直接当作协程局部变量；需要适当的上下文传播机制。InheritableThreadLocal 也不能解决线程池中每次任务动态传播的全部问题。[官方：ThreadLocal](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ThreadLocal.html)。

## 线程池与背压

### 线程池达到 corePoolSize 后，是先扩线程还是先入队？ {#pool-dispatch}

典型 ThreadPoolExecutor 调度顺序是：少于核心线程数时尝试增加核心线程；否则尝试入队；队列无法接受时再尝试增加到最大线程数；仍不能接受则走拒绝策略。关闭与竞争状态还会触发必要的二次检查。

| 构造参数 | 需要回答的设计问题 |
| --- | --- |
| corePoolSize / maximumPoolSize | 常态执行规模和允许增长的上界是多少？ |
| keepAliveTime / unit | 空闲非核心线程何时回收，是否允许核心线程超时？ |
| workQueue | 最多等待多少任务，任务能否过期或合并？ |
| threadFactory | 线程如何命名、创建并纳入诊断？ |
| handler | 饱和或关闭时，提交者得到怎样的明确反馈？ |

<KnowledgeFlow title="线程数、队列与拒绝策略必须一起设计" :steps="[
  { title: '核心线程不足', detail: '优先尝试创建工作线程' },
  { title: '尝试入队', detail: '队列接受时等待已有线程处理' },
  { title: '队列无法接受', detail: '尝试增加到 maximumPoolSize' },
  { title: '仍无法接收', detail: '执行明确的拒绝策略' }
]" caption="这是正常运行时的简化路径；线程创建失败、关闭和并发竞争还需要检查。" />

**追问：无界队列时最大线程数为什么常不起作用？** 队列持续接受任务，很少触发非核心扩容，负载可能转化为队列与内存增长。[官方：ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)。

### fixed 与 cached 线程池分别可能怎样耗尽资源？ {#executors-risk}

固定线程数配近乎无界队列时，请求到达速度长期大于处理速度，会堆积任务和关联对象；cached 风格若允许大量线程增长，遇到大量阻塞任务可能耗尽线程、内存或调度资源。

因此“线程池”不自动意味着资源有界。移动端应明确并发上限、排队上限、过期任务、取消与拒绝语义；还要避免每个 SDK 都自建一套无约束线程池。[官方：Executors](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Executors.html)。

### CallerRunsPolicy 在 Android 上为什么可能把后台任务推回主线程？ {#rejection}

它在相应拒绝条件下由提交者运行任务。如果提交来自 UI 线程，原本以为“已提交到后台”的重计算就可能在主线程执行。静默丢弃策略又可能让关键业务无结果，不能随意选。

拒绝策略应根据业务区分：搜索旧任务可合并，日志可按规则采样，支付提交则不能直接丢弃。关闭状态下的行为也要验证。[官方：CallerRunsPolicy](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.CallerRunsPolicy.html)。

### 有界队列、限流、背压与舱壁隔离有什么区别？ {#backpressure}

有界队列限制等待资源，限流限制接收速率或并发，背压让上游获知下游承受能力，舱壁隔离则避免一类慢任务占满全部执行资源。只缩小队列而不设计拒绝反馈，会把问题转成不可观测丢失。

可把首屏请求、图片解码和低优先级上报设定不同预算；预算不一定等于各建线程池，也可以用 semaphore 或调度协调。监控排队时间、执行时间、拒绝数与过期数。[官方：BlockingQueue](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/BlockingQueue.html)。

### `execute` 和 `submit` 的异常观察方式为什么不同？ {#execute-submit}

execute 直接执行 Runnable 时，未处理异常可沿工作线程的异常处理路径暴露；submit 通常把计算包装成 Future，异常保存在完成结果中，调用 get 时以相应形式抛出。忽略返回的 Future，可能让失败悄悄失去观察者。

取消 Future 也不是强杀线程；即使请求中断，任务与底层 I/O 是否停止仍取决于实现配合。`shutdownNow` 同样只是尝试停止并返回部分等待任务。[官方：ExecutorService](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html)、[Future](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Future.html)。

## 锁、协调与正确性

### AQS 是锁吗，ReentrantLock 的公平模式保证绝对公平吗？ {#aqs}

AQS 是构建锁和同步器的基础框架，围绕状态与等待队列组织获取和释放；不同子类定义状态含义。ReentrantLock 支持可重入、可中断或限时获取以及 Condition 等能力。

公平策略可以影响竞争顺序，但不保证线程调度公平、业务完成时间一致或所有获取方法都严格排队。释放必须放在 finally，并只在成功获取后释放。[官方：AQS](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/AbstractQueuedSynchronizer.html)、[ReentrantLock](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html)。

### Semaphore、CountDownLatch、CyclicBarrier 解决什么不同问题？ {#coordination}

| 工具 | 关注点 | 典型例子 |
| --- | --- | --- |
| Semaphore | 同时使用资源的许可数 | 限制同时解码图片数 |
| CountDownLatch | 等待计数降为零，一次性协调 | 等待一组初始化任务完成 |
| CyclicBarrier | 一组参与者反复到达会合点 | 分阶段并行计算 |

许可不是自动绑定线程的所有权，获取和释放需正确配对；等待任一条件都不应无期限阻塞主线程。失败、超时和参与者取消必须进入协议。[官方：Semaphore](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/Semaphore.html)、[CountDownLatch](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CountDownLatch.html)。

### 死锁、活锁与饥饿怎么区分，排查先找什么？ {#deadlock}

死锁是等待依赖无法推进，例如 A 持锁 1 等锁 2，B 持锁 2 等锁 1；活锁是参与者不断响应彼此却无有效进展；饥饿是某任务长期得不到所需资源。

先画“任务 → 等待资源 → 当前持有者”的关系，查看锁顺序、同步 Binder、线程池内互相 get 等场景。统一锁顺序、缩小临界区、避免持锁外部调用和提供超时恢复，比单纯改公平锁更根本。[规范：锁与等待](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html)。

### 双重检查单例为什么需要安全发布，CAS 又有哪些边界？ {#publication}

DCL 需要在检查、初始化和发布间建立正确的可见性与排序约束，例如使用符合语言规则的 volatile 引用；只在内层加锁、外层无约束读取并不足够。

CAS 关注某个位置从预期值到新值的原子转换；若值经历 A→B→A，单看当前值可能无法发现历史变化，版本戳可用于部分 ABA 问题。它仍不自动解决多个字段不变量和资源生命周期。[官方：AtomicStampedReference](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/AtomicStampedReference.html)。

## 排障练习

构造一个只有两条工作线程的线程池，让两个父任务都提交子任务并同步等待，解释队列为什么无法推进。再把队列改为有界，分别验证异常拒绝和 CallerRuns 对提交线程的影响。

### 排障参考答案

**卡住的条件：** 固定两条工作线程，先用屏障保证两个父任务都已开始，再各自向同一个池提交子任务并调用 `Future.get()`。两个工作线程都被父任务占住，子任务留在队列中；父任务等待子任务，子任务等待空闲工作线程，形成线程池饥饿死锁。无需出现 `synchronized` 锁环也会卡住。

```text
worker-1：父任务 A → 等子任务 a ─┐
worker-2：父任务 B → 等子任务 b ─┤
队列：[a, b] → 等 worker 空闲 ──┘
```

**有界队列并不自动解锁。** 若容量正好容纳两个子任务，两者仍可能都排队等待。要稳定比较拒绝策略，可以另起一组实验：两条 worker 用测试闸门阻塞，容量为 1 的队列放入一个任务，再从标记过名字的提交线程调用 `execute` 提交新任务。

| 策略 | 此时预期结果 | 面试应说明的边界 |
| --- | --- | --- |
| `AbortPolicy` | 在提交处抛 `RejectedExecutionException` | 需要处理失败与任务状态；`submit` 被拒绝时也可能在返回 Future 前直接抛异常 |
| `CallerRunsPolicy` | 未关闭的池让提交线程直接运行任务，提交调用变慢 | 若提交者是 Android 主线程，会把工作带回 UI；若是持锁线程，还可能引入新的等待关系 |

不要声称 CallerRuns 一定解决父子等待：有的子任务可能已成功入队，仍然无人执行；关闭后的拒绝行为也与饱和时不同。[官方：线程池与拒绝策略](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)。

**修复与验证：** 优先取消“占用工作线程再同步等同池任务”的结构，改为异步组合；确需隔离时给不同职责独立容量预算。实验用带超时的等待、可释放闸门和 `finally` 清理，避免演示程序永久挂住。查看线程栈中的 Future 等待、活跃线程数和队列长度，验证修复后子任务确实能获得执行机会。
