---
title: 协程状态机、取消竞争与 Flow 进阶
description: CPS、Continuation、Job 继承、调度并行度、回调桥接、超时资源安全、Channel、共享流和虚拟时间测试。
---

# 19 · 协程状态机与 Flow 深入

这一章回答“为什么会这样”：挂起如何保存执行位置，取消与回调同时到达怎么办，热流在无人订阅后究竟做什么。先掌握[协程基础](./coroutines)，再阅读这里。

## 运行机制与任务树

### suspend 函数为什么常被编译成状态机？Continuation 保存什么？ {#state-machine}

协程挂起后需要在结果到达时继续执行。编译器可把挂起函数转换为带额外 continuation 的形式，用状态标签和需要跨挂起保存的局部值表示恢复位置；实际生成代码取决于平台与优化。

<KnowledgeFlow title="一个挂起点的概念模型" :steps="[
  { title: '执行到调用点', detail: '保存后续需要的局部值和状态标签' },
  { title: '尚无结果时挂起', detail: '调用链返回控制权，线程可执行别的工作' },
  { title: '结果完成', detail: '通过 continuation 安排或继续恢复' },
  { title: '进入下一状态', detail: '读取结果并执行剩余逻辑' }
]" caption="这解释为什么挂起不需要一直占住原线程；它不保证任意阻塞函数会自动挂起。" />

不要把 Continuation 当作只能恢复在同一线程的栈快照；调度与拦截器还决定恢复环境。[规范：协程与 CPS](https://kotlinlang.org/spec/asynchronous-programming-with-coroutines.html)。

### CoroutineContext 是键值集合，为什么 `launch(Job())` 可能破坏原任务关系？ {#context-job}

Context 中同一个 key 的元素通常由后者替换，Job 也有自己的 key。给 builder 显式传入独立 Job，会改变新协程的父关系，可能使原 scope 取消不再按你的预期传到该任务。

普通 builder 会建立自己的协程 Job，并按上下文确定父关系；不能说所有孩子“共用一个 Job 对象”。通常让 builder 自然继承，确需应用级任务时显式定义所有者和结束协议。[官方：CoroutineContext 与 Job](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html)。

### Dispatchers.IO 与 Default 为什么不能简单理解为两组互不相干的线程？ {#dispatchers}

调度器抽象的是执行安排，具体实现可能共享底层线程资源。Default 面向 CPU 计算，IO 为阻塞 I/O 提供适合的调度策略；同线程观察不代表切换 API 没作用，也不能用线程名称推出完整资源隔离。

CPU 密集操作堆到 IO 仍可能争抢 CPU；阻塞任务塞到有限计算资源也会拖慢其他计算。库已提供非阻塞 API 时，要避免无意义的重复上下文切换。[官方：Dispatchers.IO](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-dispatchers/-i-o.html)。

### `limitedParallelism(4)` 能保证最多四个网络请求在途吗？ {#parallelism}

它约束相应调度视图中的执行并行度，不会把一个挂起期间的完整业务操作自动占住许可。很多协程发出非阻塞请求后挂起，仍可能同时存在远超四个在途请求。

如果需要限制整段逻辑，包括挂起等待期间的资源占用，应评估 Semaphore 等业务级许可机制。区分执行并行度、请求并发数和请求速率，不能用一个开关代替三种限制。[官方：limitedParallelism](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-dispatcher/limited-parallelism.html)。

## 取消、回调与资源

### 用 `suspendCancellableCoroutine` 桥接回调，最难的是哪两个竞争？ {#callback-races}

一是成功、失败或重复回调竞争恢复；二是恢复结果与取消竞争。仅判断 `isActive` 再 resume 不是所有多回调场景的原子防重协议，还要遵守底层回调契约并选择合适的一次性完成协调。

取消时应注销或取消底层操作；如果返回值拥有需要关闭的资源，还必须处理“资源已产生，但协程没能接收”的窗口。普通数据和文件句柄不能套用同一份简化包装。[官方：suspendCancellableCoroutine](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html)。

### withTimeout 为什么不能保证超时后服务器停止，资源又可能在哪泄漏？ {#timeout-resources}

超时取消当前协程范围，并不对任意阻塞调用、外部进程或服务器事务实施回滚。要确保底层可取消，并把业务重试与幂等设计分开。

超时发生在结果即将交付时，也可能让调用方拿不到已创建资源；因此资源获取、使用和 finally 释放应有清晰所有者。不能只在“赋值成功后的下一行”安排关闭，然后假设所有竞争都被覆盖。[官方：withTimeout](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/with-timeout.html)。

### CoroutineExceptionHandler 为什么不能替代每层错误处理？ {#exception-handler}

它处理相应未捕获异常，不是 try/catch 式恢复点，也不会让已经失败的协程从抛出位置继续执行。普通子协程的异常通常先交给父关系处理；async 的结果消费和 supervisor 下的子任务又有不同观察路径。

把 handler 加到每个 child，不代表层层都能拦截并恢复。业务可恢复错误在合适范围转换为状态；编程错误与取消不能统一吞成“网络异常”。[官方：协程异常处理](https://kotlinlang.org/docs/exception-handling.html)。

### Channel 的容量、关闭、取消与 `onUndeliveredElement` 各解决什么？ {#channels}

容量与溢出决定生产消费如何协调；close 表达结束发送等语义，cancel 更直接地终止相关使用。接收者退出或取消竞争时，已发送的资源型元素可能无法正常交付，需要相应的未交付处理。

`onUndeliveredElement` 回调应快速、不能依赖挂起清理，并符合 API 的调用约定。Channel 也是内存通信机制，不提供进程死亡后的持久可靠队列；关键任务仍需落库和确认。[官方：Channel](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.channels/-channel/)。

## 热流、上下文与测试

### `stateIn + WhileSubscribed` 在最后一个订阅者离开后做什么？ {#sharing-policy}

共享 scope、stop timeout 和 replay expiration 分别影响共享协程寿命、上游何时停止与缓存何时重置。`WhileSubscribed(5_000)` 常用于短暂切屏期间避免立即重启上游，但数值应按业务决定。

无人收集时 UI 收集停止，不代表应用所有上游工作都停止；其他订阅者、Eagerly、独立 scope 或被缓存的结果都会影响行为。StateFlow 的重置还需要考虑 initialValue 的展示意义。[官方：WhileSubscribed](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-sharing-started/-companion/-while-subscribed.html)。

### callbackFlow 为什么常需要 `awaitClose`？和 `flow {}` 有何边界？ {#callback-flow}

callbackFlow 把回调源连接到 Channel/Flow，适合处理来自不同线程的事件。需要在收集结束时注销监听，常通过 awaitClose 建立清理动作，否则一个 UI 反复收集可能注册多份回调。

普通 flow builder 要维护相应上下文与异常透明性，不能随意在另一个线程或上下文中直接 emit。高频回调也要定义背压、溢出与合并策略，而不是把 `trySend` 失败全部忽略。[官方：callbackFlow](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/callback-flow.html)。

### `flowOn` 与 `buffer` 为什么可能融合，重试又应该放在哪一层？ {#flow-fusion}

相邻的部分 channel/缓冲/上下文操作可融合为合适的内部通道配置，不能仅按操作符个数推断线程数或缓冲数量。取消时还可能丢弃在途元素，因此不适合据此建立逐条持久提交保证。

重试针对可重试的上游过程，放在过大的范围可能重做已经成功的工作。区分瞬时错误与确定性错误，设置预算；下游渲染异常通常不应伪装成网络重试。[官方：flowOn](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flow-on.html)、[retryWhen](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html)。

### runTest 的虚拟时间为什么不能控制所有真实线程与 I/O？ {#virtual-time}

测试调度器只能控制接入它的任务和延迟；真实网络、独立 dispatcher 或 Thread.sleep 不会自动受其虚拟时钟控制。注入同一测试调度体系，才能可靠验证防抖、超时与任务顺序。

`runCurrent`、推进时间和推进到空闲的含义不同；需要持续收集的热流可按测试 API 使用 backgroundScope 等安排。不要用无限 advanceUntilIdle 去“等待一个本来永不结束的业务”。[官方：kotlinx-coroutines-test](https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/)。

## 实验路线

给回调桥接注入“取消后成功”“成功两次”“成功返回可关闭资源”的测试源；再验证 WhileSubscribed 的停止与重播重置。每次解释任务所有者、在途结果与清理责任，而不仅是最终是否收到值。
