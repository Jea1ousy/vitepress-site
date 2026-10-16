---
title: Compose Snapshot、布局、身份与测试进阶
description: 组合身份、Snapshot、稳定性、读取阶段、intrinsics、SubcomposeLayout、Lazy 列表、Saver、导航和语义测试。
---

# 20 · Compose 状态、布局与测试深入

本章把[Compose 基础](./compose)继续展开到局部身份、状态观察和性能验证。内部结构与编译器实现会变化，先掌握公开契约，再阅读对应版本源码。

## 身份与状态观察

### 为什么说 remember 依赖组合身份，而不是某个 Kotlin 对象字段？ {#composition-identity}

remember 的值与组合中的相应身份位置关联。调用顺序、分支或循环变化时，需要框架的分组与 key 语义协助区分实例；不能想象为“Composable 函数对象里有一个永久成员变量”。

在可重排的同一调用位置发出多项内容时，稳定业务 key 尤其重要。它影响状态与 effect 对应谁，不只是提高 Diff 性能。SlotTable 等内部结构可作为源码阅读入口，但不是公共持久化格式。[官方：Composable 生命周期](https://developer.android.com/develop/ui/compose/lifecycle)。

### Snapshot 与普通 mutable 对象的区别是什么，能随便跨线程改吗？ {#snapshot}

Snapshot 系统跟踪受支持状态对象的读取和写入，并协调状态版本与观察通知；普通对象内部字段不会因此自动变成可观察状态。需要遵守相应快照与并发 API 的使用约定。

即使单次状态访问受框架管理，“读取两个字段、校验、分别写回”的业务操作也不天然具有整体原子性。跨线程业务仍要设计一致性边界，必要时使用合适的快照事务或外部协调。[官方：Snapshot API](https://developer.android.com/reference/kotlin/androidx/compose/runtime/snapshots/Snapshot)。

### Strong Skipping 下为什么“传同一个可变对象”仍可能让 UI 不更新？ {#skipping-contract}

跳过重组的比较策略与状态观察是不同层面。对未被观察的普通属性原地修改，框架可能不知道变化；同一对象引用在特定模式下还可能被判定可跳过。强行标注 `@Stable` 不能补齐通知。

优先明确状态来源与更新方式，再看类型稳定性报告、编译器开关和实际分配。不要先把所有对象改成不同引用来“强刷”，否则可能把正确性问题换成不必要更新。[官方：稳定性](https://developer.android.com/develop/ui/compose/performance/stability)。

### 状态读取放到布局或绘制阶段，为什么可能减少重组？ {#deferred-reads}

运行时会跟踪相应阶段的状态读取。若某变化只需要平移或绘制颜色，可在适用的布局/绘制 lambda 中读取，减少不需要的前置阶段工作；如果在构建 Modifier 前就先取值，读取可能已发生在组合阶段。

<KnowledgeFlow title="优化关注读取位置，而不只关注状态创建位置" :parallel="true" :steps="[
  { title: '组合读取', detail: '变化可能使对应组合范围重新执行' },
  { title: '布局读取', detail: '适用时把变化限制在尺寸 / 放置阶段' },
  { title: '绘制读取', detail: '仅外观变化可在绘制时按需读取' }
]" caption="这些是不同选择，并非每帧必须依次重新执行；只有语义允许时才延后读取。" />

不应为了减少重组把实际影响尺寸的状态强塞进纯绘制。以帧耗时和正确性验证收益。[官方：最佳实践](https://developer.android.com/develop/ui/compose/performance/bestpractices)。

## 测量、延迟组合与列表

### Compose 为什么强调一次测量，intrinsic measurement 是违规重测吗？ {#intrinsics}

常规布局流程约束对孩子的测量方式，以避免反复试探造成成本失控。intrinsics 提供一种在正式测量前查询期望尺寸的信息，并不应简单等同于把同一个孩子任意 measure 多次。

自定义 Layout 要理解父约束、返回尺寸与放置的关系；无界约束、文字换行与固定高度结合时尤其容易误判。先用最小例子解释约束如何流动，再谈优化。[官方：固有尺寸测量](https://developer.android.com/develop/ui/compose/layouts/intrinsic-measurements)。

### SubcomposeLayout 为什么允许在布局阶段组织组合，代价是什么？ {#subcompose}

有些 UI 的子内容依赖测量结果或可见区域，SubcomposeLayout 为这类需求提供布局期间的子组合能力；Lazy 体系等会使用相关思路。它解决普通“先组合完，再统一测量”难以表达的依赖。

这种能力也增加组合、槽位与测量协调成本，不应成为普通 Row/Column 的默认替代。内部复用行为和 API 使用方式要结合库版本核对。[官方：SubcomposeLayoutState](https://developer.android.com/reference/kotlin/androidx/compose/ui/layout/SubcomposeLayoutState)。

### Lazy 列表的 key 与 contentType 分别表达什么？ {#lazy-content-type}

key 描述实体身份，帮助状态跟随同一项；contentType 表达可复用内容的类型，便于框架在结构适合的项之间复用。一个是“是谁”，一个是“可按哪类结构处理”，不能互相替代。

为每项生成独一无二 contentType 可能丧失复用机会；把不稳定位置当 key 又可能让输入状态跟错项。混合列表应按业务 ID 和相应结构类型建模。[官方：Lazy 列表](https://developer.android.com/develop/ui/compose/lists)。

### derivedStateOf 与 snapshotFlow 为什么都可能忽略相等的中间结果？ {#derived-vs-flow}

derivedStateOf 用于派生状态，适合输入高频变化而 UI 关心结果较少变化的情况；snapshotFlow 把快照读取连接到 Flow，并按相关相等性规则发射。它们不是用于保存所有历史事件的日志。

滚动分析可以按需要转换、过滤和去重，但交易操作和逐条业务事实不能因“只关心最新值”的策略丢掉。派生计算本身有成本，应避免给简单拼接一律加 derivedStateOf。[官方：派生状态与 snapshotFlow](https://developer.android.com/develop/ui/compose/side-effects)。

## 恢复、导航与验证

### 自定义 Saver 应保存整个对象，还是恢复所需的最小信息？ {#saver}

通常保存可重建状态所需的最小线索，例如实体 ID、筛选、选择和位置；长期业务数据由持久层负责。保存整个大对象既增加序列化和事务预算，也可能包含不可保存的 Context、回调等。

恢复要考虑数据已删除、schema 变化或账号切换，不能假定保存时的对象世界仍然存在。rememberSaveable 的寿命边界也与系统状态恢复条件有关。[官方：保存 UI 状态](https://developer.android.com/develop/ui/compose/state-saving)。

### effect key、rememberUpdatedState 与业务任务 ID 如何区分？ {#effect-identity}

effect key 定义这段效果应随什么身份重启；rememberUpdatedState 让已有效果读取最新值而不必因该值变化重启；业务任务 ID 则可能需要跨组合或进程保存。三者关注的寿命不一致。

例如头像加载应随 userId 变化取消旧请求，提示超时可能只想采用最新回调，文件上传则不能因 UI 离开就丢失任务记录。先明确所有者，再选择 API。[官方：副作用 API](https://developer.android.com/develop/ui/compose/side-effects)。

### Navigation 返回栈、ViewModel 作用域与参数恢复怎么配合？ {#navigation-state}

导航项有自己的身份与生命周期，ViewModelStoreOwner 决定状态实例范围；同名 ViewModel 在不同目的地未必是同一实例。共享状态应明确提升到哪一层，而不是靠单例绕过导航边界。

参数尽量传可验证的 ID 和轻量线索，再由数据层重建内容；深链进入、返回、进程恢复和多返回栈都要验证。具体 API 需区分所用 Navigation 方案与版本。[官方：Navigation 与 Compose](https://developer.android.com/develop/ui/compose/navigation)。

### Semantics 树、重组次数和 UI 测试各能证明什么？ {#semantics-testing}

Semantics 以可理解的属性与动作描述 UI，供无障碍和测试等使用；它与像素树、布局节点不必一一对应。测试应优先验证用户可观察状态和操作，避免只绑定不稳定实现层级。

重组次数只是诊断线索，不代表帧是否超时；性能要在适当构建上测量关键路径，功能要覆盖状态、恢复和语义。不能用“测试找到了一个文本”证明整个页面可访问且性能合格。[官方：Semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics)。

## 实验路线

做一个可重排混合列表：包含输入框、图片与不同 contentType；加入保存恢复、大字体和导航返回。分别记录状态跟随、语义查询和帧时间，解释这三个结果为什么不能互相替代。
