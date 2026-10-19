---
title: Kotlin 语言机制与 Java 互操作进阶
description: 补齐 lateinit、lazy、委托、单例、密封类型、作用域函数、Sequence、值类、SAM、相等性和 Java 互操作。
---

# 15 · Kotlin 语言机制与互操作

本章聚焦容易“会写但讲不清”的语法机制。阅读[基础篇](./language)后，尝试把每种便利语法还原为**类型、对象、调用与生命周期**。

## 初始化与建模

### `lateinit` 与 `lazy` 的初始化时机、线程安全有何区别？ {#lateinit-lazy}

`lateinit var` 由外部在稍后赋值，读取前尚未初始化会抛出异常；它不自动同步，也不适用于所有类型。`val x by lazy { ... }` 首次读取时计算并保存值，后续复用。

JVM 上常见的 lazy 模式有 SYNCHRONIZED、PUBLICATION、NONE：PUBLICATION 可能并发计算多次但发布一个结果，初始化器因此不应随意执行不可重复副作用；NONE 需要调用者保证适当的单线程条件。

**追问：页面里的 lazy ViewBinding 自动随 View 销毁吗？** 不会。缓存的寿命仍由持有它的对象决定。[官方：属性](https://kotlinlang.org/docs/properties.html)、[lazy 委托](https://kotlinlang.org/docs/delegated-properties.html#lazy-properties)。

### `object`、`companion object` 与普通静态成员能完全等同吗？ {#objects}

`object` 声明定义单例式对象，初始化规则由平台实现与语言契约共同约束；companion 是关联到类的对象，也能实现接口。它不是把其中所有 Kotlin 方法都天然变成 Java static 方法。

Java 互操作可按需要用 `@JvmStatic`、`@JvmField` 等生成相应入口。单例对象初始化安全不代表其可变字段都线程安全；单例持有 Activity 仍可能泄漏。[官方：对象声明](https://kotlinlang.org/docs/object-declarations.html)。

### sealed class / interface 和 enum 适合表达什么区别？ {#sealed}

enum 表达有限个枚举常量；sealed 层次约束直接子类型的扩展范围，允许不同分支拥有不同数据。用它建模 Loading、Content(items)、Error(reason) 时，可让 `when` 根据已知分支检查穷尽性。

```kotlin
sealed interface LoadState {
    data object Loading : LoadState
    data class Content(val ids: List<Long>) : LoadState
    data class Failed(val retryable: Boolean) : LoadState
}
```

密封不等于对象不可变，也不意味着可以无视同包、模块及多平台相关约束。分支新增还可能影响二进制或序列化兼容。[官方：密封类型](https://kotlinlang.org/docs/sealed-classes.html)。

### `Unit`、`Nothing`、可空类型在控制流中分别表示什么？ {#nothing}

Unit 表达无有用返回值，函数仍可正常返回；Nothing 没有实例，用于总是抛出异常、永不正常返回等路径。`return`、`throw` 与 Elvis 组合时，编译器可据此收窄后续类型。

```kotlin
fun requireId(value: String?): String {
    val id = value ?: error("缺少 id")
    return id // 这里已是非空 String
}
```

不要用 Nothing 代替普通异步工作的 Job，也不要认为返回 Nothing 就自动改变线程或取消任务。[官方：跳转与 Nothing](https://kotlinlang.org/docs/returns.html)。

## 调用、序列与分配

### `let/run/with/apply/also` 是五种不同的线程或作用域吗？ {#scope-functions}

它们主要区别在接收者的使用方式与返回值，不会创建新线程或 Android 生命周期。`apply/also` 常返回原对象，`let/run/with` 常返回块结果；`this` 与 `it` 的选择影响可读性。

链式嵌套过深会让“现在的 this/it 是谁”变得模糊。用 `let` 也不是对共享可变属性的自动原子判空：先读取局部值，才能固定本次判断所用对象。[官方：作用域函数](https://kotlinlang.org/docs/scope-functions.html)。

### Sequence 一定比 List 操作更快吗？ {#sequences}

Sequence 惰性地把操作按元素串联，可能避免多份中间集合，尤其适合长管线和 `take` 等短路操作；代价是迭代器、间接调用及部分优化限制。短小集合上的直接集合操作可能更合适。

<KnowledgeFlow title="惰性管线：下游只要两个结果时" :steps="[
  { title: '读取一个元素', detail: '从源取得当前候选项' },
  { title: '依次转换 / 过滤', detail: '该元素逐步流经操作链' },
  { title: '满足 take 条件', detail: '得到足够结果后结束，不遍历全部输入' }
]" caption="sorted 等需要全量数据的操作会改变这种短路收益；Sequence 也不是协程 Flow。" />

复用 Sequence 是否会重新执行副作用，取决于具体来源；某些序列只能消费一次。用真实数据规模测量，而不是统一加 `asSequence()`。[官方：Sequence](https://kotlinlang.org/docs/sequences.html)。

### `@JvmInline value class` 能保证完全没有装箱吗？ {#value-class}

值类为已有值提供类型边界，编译器在适当位置可直接使用底层表示。但作为泛型、接口或可空等形式传递时，可能需要包装对象；“声明了值类”不是零分配保证。

例如 UserId 与 OrderId 可避免 String 参数混淆，但还要考虑 Java 调用入口、签名改写和序列化支持。不要把优化表示当成可跨版本稳定的二进制布局。[官方：值类](https://kotlinlang.org/docs/inline-classes.html)。

### lambda、函数引用与 SAM 转换都一定创建新对象吗？ {#lambda-sam}

函数类型、函数引用和单抽象方法接口可表达回调，编译器可能缓存无捕获实例或使用不同生成策略；捕获变量则可能需要额外对象或封装。不能离开编译器版本和调用形式断言“每次零分配”或“每次一个对象”。

函数引用也可能绑定接收者并延长其寿命。性能热点看编译产物与分配采样，生命周期问题看实际引用链；不要只因为换了 `::method` 就认为解除页面捕获。[官方：函数式接口与 SAM](https://kotlinlang.org/docs/fun-interfaces.html)。

## 委托、类型与边界

### `by` 委托属性怎样工作，`observable` 能监听对象内部所有变化吗？ {#delegates}

属性访问可交给委托的 `getValue/setValue`，`provideDelegate` 还能参与委托建立。`observable` 观察对应属性赋值，不会自动深入观察属性指向的普通集合或对象。

例如 `var items by observable(mutableListOf(...))` 后执行 `items.add(...)`，并不等价于给 items 重新赋值；若需要 UI 响应，应选合适的可观察状态或不可变更新。委托本身也可能持有宿主对象，应评估寿命。[官方：委托属性](https://kotlinlang.org/docs/delegated-properties.html)。

### Kotlin 的 `==`、`===` 与数组、浮点比较有什么坑？ {#equality}

`==` 表达结构相等并处理空值，`===` 表达引用身份。数组通常需要 `contentEquals/contentDeepEquals` 等比较内容，不能因元素看起来一样就预设普通 `==` 成立。

浮点比较还与操作数的静态类型及相应比较规则有关，NaN、正负零尤其容易出现直觉偏差。实体比较应先定义业务身份与值相等，不要用引用身份替代业务 ID。[官方：相等性](https://kotlinlang.org/docs/equality.html)。

### 星投影 `List<*>` 是不是 `List<Any?>`，为什么不能随便写入？ {#star-projection}

星投影表达“类型参数未知，但可以在安全边界内使用”，并不是随意把所有泛型参数改成 Any。对于会消费参数的类型，未知类型意味着不能把任意对象写进去；读取能力还受声明处型变和上界约束。

擦除后做外层类型检查，也不能证明所有嵌套元素都符合目标类型。反序列化与跨 Java 边界时应显式验证数据，而不是只增加一次 unchecked cast。[官方：星投影与擦除](https://kotlinlang.org/docs/generics.html#star-projections)。

### 默认参数、`@JvmOverloads` 和 JVM 注解怎样影响 Java 调用？ {#java-interop}

Kotlin 默认参数不意味着 Java 自动获得所有短参数重载；`@JvmOverloads` 可按规则生成重载，`@JvmName` 可解决部分名称或擦除签名冲突，`@JvmStatic/@JvmField` 分别影响相应 JVM 入口。

不要为了方便生成大量重载而忽视 API 规模与兼容性。Java 平台类型、泛型空值、检查型异常以及静态入口都应在边界测试，而不是只验证 Kotlin 调用点。[官方：从 Java 调用 Kotlin](https://kotlinlang.org/docs/java-to-kotlin-interop.html)。

## 面试练习

把一个 Kotlin SDK 暴露给 Java：包含默认参数、值类、密封结果和 suspend API，逐项检查调用方式。再用字节码查看器或反编译工具验证你的解释；不要把反编译结果当成所有版本的语言契约。

### 练习参考答案

| SDK 特性 | Java 调用侧的答案 | 建议的公开边界 |
| --- | --- | --- |
| 默认参数 | 通常只有完整参数签名；加 `@JvmOverloads` 才按规则生成额外重载 | 对少量常用组合提供明确重载，避免依赖编译器的默认参数辅助方法 |
| 值类 | JVM 表示可能被拆箱或装箱，含值类的函数还可能改写名称，不能假定 Java 能像普通类一样构造和调用 | 稳定 Java API 可接收 String/long 或普通包装 DTO，在 Kotlin 内部转换；采用编译器提供的装箱暴露能力时核对版本与开关 |
| 密封结果 | Java 可按实际生成的子类判断分支，通过 getter 取数据；不能直接照搬 Kotlin 的 `when` 写法 | 可提供明确的结果子类型或 visitor，分支扩展时检查 Java 源码和二进制兼容 |
| `suspend` 方法 | JVM 层包含 Continuation 等协程协议，并不是 Java 自动得到 Future | 提供 callback 或平台支持的 Future 适配，约定执行线程、取消、异常与 scope 所有者 |

默认参数与静态入口见[Java 互操作官方文档](https://kotlinlang.org/docs/java-to-kotlin-interop.html)；值类的表示和 Java 暴露条件见[值类官方文档](https://kotlinlang.org/docs/inline-classes.html)。

例如把普通 Kotlin 门面暴露给 Java：

```kotlin
class Client {
    @JvmOverloads
    fun label(id: String, prefix: String = "user"): String = "$prefix:$id"
}
```

```java
Client client = new Client();
String a = client.label("42");
String b = client.label("42", "member");
```

**验证方法：** 固定 Kotlin 编译器、JVM target 和 JDK 版本，在独立 Java 调用模块编译这些入口；用 `javap -p -s` 或 IDE 字节码工具检查重载、名称和签名。异步适配还应分别测试成功、失败、取消和所有者销毁；不能只看到 Continuation 参数就宣称 Java 接口已可用。验证旧 Java 客户端能否调用新 SDK 时，要保留旧编译产物进行运行测试。
