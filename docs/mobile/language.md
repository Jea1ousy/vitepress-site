---
title: Java、Kotlin 与运行时常见面试题
description: 从空安全、集合、泛型到 Java 内存模型、垃圾回收与 Android Runtime，理解移动端语言基础。
---

# 01 · Java、Kotlin 与运行时

语言面试最终考的是三个问题：**数据如何表达、并发如何协调、对象如何存活**。本章先拆开 Kotlin 的语法便利，再连接 Java 内存模型与 Android 运行时。

## Kotlin 类型与语法

### Kotlin 有空安全，为什么还会空指针？ {#null-safety}

**先答：空安全主要是编译期约束，无法消除所有运行期的空值来源。** `String` 与 `String?` 区分可空性，`?.` 安全访问，`?:` 提供兜底；`!!` 则主动绕过编译器保护。

Java 平台类型、初始化过程中泄漏 `this`、反射和外部代码破坏类型约定，都可能带来风险。未初始化的 `lateinit` 通常抛出 `UninitializedPropertyAccessException`，不能笼统叫作 NPE。

```kotlin
fun displayName(raw: String?): String {
    return raw?.trim()?.takeIf { it.isNotEmpty() } ?: "匿名用户"
}
```

**追问：为什么“先判空再使用”仍可能不被智能转换？** 可变属性、自定义 getter 或并发修改可能让两次读取不同。先读到局部 `val`，再检查，才能固定本次使用的值。[官方：空安全](https://kotlinlang.org/docs/null-safety.html)。

### `val`、只读集合与不可变对象是一回事吗？ {#immutability}

不是。`val` 限制引用重新赋值，`List<T>` 限制通过该接口修改集合；两者都不能保证对象内部或底层集合不会变化。

```kotlin
val backing = mutableListOf("A")
val readOnly: List<String> = backing
backing += "B"  // readOnly 也会看到 B
```

线程间共享状态和 Compose 参数更适合使用设计上不可变的数据模型；必要时复制集合或使用持久化不可变集合。`toList()` 是集合元素引用的浅复制，不会递归复制元素。

**追问：`data class.copy()` 呢？** 也是浅复制；主构造参数中的可变集合仍可能被共享。`equals/hashCode/copy` 等生成行为主要围绕主构造参数，写在类体里的属性不能一概视为参与比较。[官方：数据类](https://kotlinlang.org/docs/data-classes.html)。

### 扩展函数能覆盖成员函数吗？ {#extensions}

**扩展函数不修改原类，也不会增加真正的虚方法。** 扩展根据接收者的编译期类型解析；签名适用的成员函数优先于扩展函数。

```kotlin
open class Animal
class Cat : Animal()
fun Animal.kind() = "animal"
fun Cat.kind() = "cat"
val pet: Animal = Cat()
// pet.kind() 为 animal；这里只演示顶层扩展的静态解析
```

**易错点：** 扩展属性没有额外的 backing field。把缓存放进全局 Map 来模拟字段，会引入额外的生命周期与并发问题。[官方：扩展](https://kotlinlang.org/docs/extensions.html)。

### `inline`、`reified`、`noinline` 和 `crossinline` 怎么解释？ {#inline}

`inline` 允许编译器把函数体与适合内联的 lambda 展开到调用处，可能减少函数对象和间接调用，也可能增加字节码体积。它不是所有函数都该使用的性能开关。

| 关键字 | 主要作用 | 常见追问 |
| --- | --- | --- |
| `reified T` | 内联处保留可用的类型信息，支持 `is T`、`T::class` 等 | 不能让 `List<String>` 的全部嵌套类型信息凭空保留 |
| `noinline` | 使某个 lambda 不参与内联 | 可把它存入字段或作为普通函数对象传递 |
| `crossinline` | 禁止该 lambda 非局部返回 | 用于回调被包装后在其他执行上下文调用等场景 |

```kotlin
inline fun <reified T> Any?.isType(): Boolean = this is T
```

**追问：为什么 lambda 里有时能 `return` 外层函数？** 合适的内联调用可允许非局部返回；普通 lambda 或 `crossinline` 参数不能这样使用。[官方：内联函数](https://kotlinlang.org/docs/inline-functions.html)。

### 泛型为什么有 `in` 和 `out`？ {#generics}

**核心是控制子类型关系，避免把错误类型写进容器。** `out T` 面向生产，`in T` 面向消费；不变类型既读又写时通常不能随便替换类型参数。

```kotlin
interface Source<out T> { fun next(): T }
interface Sink<in T> { fun accept(value: T) }
// Source<Cat> 可用于需要 Source<Animal> 的位置
// Sink<Animal> 可用于需要 Sink<Cat> 的位置
```

JVM 上泛型大多有类型擦除，因此不能普通地判断 `value is List<String>`。`reified` 可以解决部分调用处类型检查，不能递归验证任意容器元素的类型。[官方：泛型与型变](https://kotlinlang.org/docs/generics.html)。

## 集合与并发基础

### HashMap 为什么快，为什么不能直接用于并发写？ {#hashmap}

HashMap 用哈希把 key 映射到桶，再通过相等性确定目标元素；在分布合适时，查找和插入通常是期望 O(1)。哈希冲突、扩容和糟糕的 key 都会增加成本。树化阈值属于具体实现细节，回答时要说明 JDK 或 Android libcore 版本。

**必须满足：相等对象应有相同 hashCode。** key 放入后再修改参与 `equals/hashCode` 的字段，可能导致“对象还在 Map 里，却查不出来”。

HashMap 不提供并发修改所需的同步。ConcurrentHashMap 支持并发操作，但 `if (!containsKey(k)) put(k, v)` 仍是两个动作；用 `putIfAbsent`、`compute` 或外部协调表达原子复合操作。[官方：HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)。

### `volatile` 能保证 `count++` 线程安全吗？ {#jmm}

**不能。`volatile` 主要提供可见性及相关排序保证，不会把读、加一、写合成一个不可分割的动作。** 两个线程仍可能读到同一个旧值并覆盖彼此结果。

<KnowledgeFlow title="丢失更新：两个线程读到同一个 count" :steps="[
  { title: '读取', detail: '线程 A 与 B 都读到 count = 0' },
  { title: '计算', detail: '各自计算 0 + 1，结果都是 1' },
  { title: '写回', detail: '两次写入 1，最终值为 1 而非 2' }
]" caption="即使每次 volatile 读写都可见，复合操作也没有自动获得原子性。" />

可用 `AtomicInteger.incrementAndGet()`，或用同一把锁保护相关状态。需要维护多个字段的不变量时，仅把每个字段换成原子变量仍可能不够。

**追问：happens-before 是时间上先发生吗？** 它描述内存可见性与排序关系。解锁与后续同一监视器加锁、线程启动、`volatile` 写与后续读等都提供特定保证，不等价于“日志时间在前”。[官方：Java 内存模型](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html)。

### `synchronized`、CAS 与协程 Mutex 怎么选？ {#locks}

| 机制 | 等待方式 | 适合情况 | 注意点 |
| --- | --- | --- | --- |
| `synchronized` | 竞争时可能阻塞线程 | 短小、同步的共享状态操作 | 不把长 I/O 放进锁内 |
| CAS / 原子变量 | 比较后更新，竞争时可能重试 | 单个状态的原子转移 | 留意 ABA、重试成本和复合不变量 |
| `Mutex` | 等锁时挂起协程 | 挂起代码间的互斥 | 不可重入，锁顺序错误仍可死锁 |

**不能用“CAS 一定无锁且一定快”概括所有原子类实现。** 选择要基于竞争强度和受保护状态。协程在多个线程执行时，同样存在数据竞争；`suspend` 不会自动让共享变量安全。

**面试例子：** 内存缓存命中计数可用原子计数；“余额与流水同时更新”要围绕整体不变量设计临界区或数据库事务。内存锁也无法替代跨进程事务。

## 对象与 Android 运行时

### GC 能回收所有不再需要的对象吗？ {#gc}

GC 判断的是**对象是否仍从根集合可达**，不是业务是否还需要它。单例持有已经销毁的 Activity 时，对象在业务上失效，却仍然可达，因此发生泄漏。

```text
GC Root → 单例 Repository → listener → Activity → 整棵 View 树
```

强、软、弱、虚引用有不同语义；弱引用适合表达不拥有对象，但不能保证业务访问时对象仍在，也不能替代注销监听。性能敏感路径不断分配临时对象，还可能形成分配抖动和 GC 压力。

**追问：Java 堆不高为什么还 OOM？** 进程还涉及 native、图形缓冲、映射文件等内存；应结合 Java/native 分配、PSS/RSS、系统限制和错误现场分析。[官方：Android 内存管理](https://developer.android.com/topic/performance/memory-overview)。

### Android 运行的是 JVM 字节码吗？ART、JIT、AOT 有什么区别？ {#art}

Android 的常规 Java/Kotlin 构建链最终生成 DEX，由 ART 执行，而不是把桌面 HotSpot 的实现直接搬到手机上。ART 可以结合解释、JIT 和基于配置文件的 AOT；具体策略与系统版本有关。

<KnowledgeFlow title="从 Kotlin / Java 到 Android 运行时" :steps="[
  { title: '源代码', detail: 'Kotlin / Java 编译为 class 字节码' },
  { title: 'DEX 构建', detail: 'D8 转换；启用优化时由 R8 处理压缩优化等工作' },
  { title: 'ART 执行', detail: '解释、JIT 与 AOT 协作执行热点代码' }
]" />

**追问：Baseline Profile 能做什么？** 提供关键路径的配置文件，帮助提前优化执行；它不能消除慢网络、错误锁竞争或不合理业务逻辑。详细验证见[性能章节](./performance#baseline-profiles)。[官方：ART](https://source.android.com/docs/core/runtime)。

## 面试前自测

- 能举出 `val` 仍然不代表不可变的例子吗？
- 能用线程交错解释 `volatile count++` 的问题吗？
- 能从引用链而非“内存没释放”描述一次泄漏吗？
- 能区分语言规范、JDK 实现细节和 Android 运行时差异吗？

### 自测参考答案

1. **`val` 固定引用，不冻结对象。** `val items = mutableListOf("A")` 不能再赋值为另一份列表，却可以执行 `items.add("B")`。把它暴露为 `List<String>` 只限制这个引用的写入接口；其他持有可变引用的代码仍可修改同一对象。需要快照时复制集合，并继续检查元素是否可变。
2. **`volatile` 不把读、改、写合成一次操作。** 初值为 0，线程 A 读到 0，线程 B 也读到 0，然后各自写回 1，两次递增只留下 1。可见性不能排除这种交错；单一计数可用 `AtomicInteger.incrementAndGet()`，多个字段的不变量需要同一把锁或其他统一同步机制。
3. **泄漏要讲出存活引用链。** 例如 `GC Root → 应用级单例 → 监听器集合 → 捕获 Activity 的回调 → 已销毁 Activity`。页面虽然退出，仍被强引用，因此不能回收。应在相应生命周期注销监听器，并用重复进入退出后的堆快照验证引用链消失；只调用 GC 或把某个局部变量设为 null 不会断开这条链。
4. **结论要说明适用层次。** `volatile` 的可见性与 happens-before 属于内存模型；某版 HashMap 的树化阈值属于实现；ART 执行 DEX、采用何种编译与回收策略属于 Android 运行时。回答时记录 JDK、Android API 和实现版本，再查对应规范或源码，不能把某个 HotSpot 参数直接套给 ART。

**验证方法：** 为递增实验用屏障让两线程先读再写，稳定展示丢失更新；不要把“跑了一次没出错”当作线程安全证明。对应机制见本章的[不可变性](#immutability)、[内存模型](#jmm)与[垃圾回收](#gc)。
