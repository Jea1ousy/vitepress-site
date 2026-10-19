---
title: 移动端架构、Jetpack 与可测试性面试题
description: MVVM、MVI、单向数据流、ViewModel、Repository、LiveData、Paging、Hilt 与测试设计。
---

# 07 · 架构、Jetpack 与可测试性

架构题不应从缩写开始。先问：**谁拥有数据，谁修改状态，谁控制任务寿命，失败由谁处理？** 架构的作用是让这些责任可追踪。

## 分层与数据流

### MVC、MVP、MVVM、MVI 该怎样比较？ {#patterns}

这些名字在不同团队中定义不完全一致，应先对齐具体边界。常见 Android 实践用 UI 层展示状态，用 ViewModel 协调屏幕逻辑，用 Repository 统一数据访问；复杂、复用的业务规则可再抽成领域层。

| 风格 | 常见关注点 | 可能的代价 |
| --- | --- | --- |
| MVC | Controller 协调模型与界面 | 页面可能承载过多职责 |
| MVP | Presenter 通过 View 接口驱动界面 | 接口和状态同步代码增加 |
| MVVM | UI 观察 ViewModel 暴露的状态 | 多来源状态可能难以协调 |
| MVI 风格 | 事件驱动状态转移，强调单向流 | reducer、effect 与事件建模成本 |

**没有一种缩写天然保证低耦合。** 对一个简单表单增加多层空转发，也可能只是制造成本。[官方：应用架构指南](https://developer.android.com/topic/architecture)。

### 单向数据流怎样避免 UI 不一致？ {#udf}

让状态向下传递，事件向上交给状态所有者处理，再生成新状态。避免 TextView、ViewModel 和 Repository 各自维护一份冲突的“当前值”。

<KnowledgeFlow title="一次收藏点击的单向数据流" :steps="[
  { title: 'UI 事件', detail: '用户点击收藏，发送 itemId' },
  { title: '状态所有者', detail: '校验、协调任务并执行业务规则' },
  { title: '数据更新', detail: 'Repository 写入结果或失败状态' },
  { title: 'UI 状态', detail: '界面按新状态展示，并等待下次事件' }
]" caption="图中最后的状态返回界面形成反馈环；副作用不应藏在纯状态转换函数中。" />

可以用 `Loading/Content/Error` 或 data class 表达页面，但要允许“已有内容 + 正在刷新 + 局部错误”等真实组合；不能用三个互相冲突的布尔值随意拼状态。[官方：UI 层](https://developer.android.com/topic/architecture/ui-layer)。

### ViewModel 里应该放什么，不应该持有什么？ {#viewmodel}

放屏幕业务逻辑、UI 状态生产，以及适合其作用域的任务。不要持有 Activity、Fragment ViewBinding、具体 View 或短寿命 UI 回调，避免寿命倒挂。

ViewModel 的范围由 ViewModelStoreOwner 决定，可以是 Activity、Fragment 或导航图等，并不是名字叫 ViewModel 就自动全局共享。不同 owner 获取到的可能是不同实例。

**追问：为什么不要在 ViewModel 里直接弹 Dialog？** 展示依赖当前窗口和界面生命周期，更适合由 UI 根据状态执行；关键业务结果仍应有可恢复的数据记录。[官方：ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel)。

### Repository 与 UseCase 是不是越多越好？ {#repository}

Repository 组织数据源、缓存、一致性和错误转换；UseCase 可封装跨多个 Repository 的业务规则或需要复用的复杂操作。单纯把 `repository.get()` 包一层 `useCase.invoke()`，不一定产生收益。

**数据源不应决定 UI 的每个展示细节，UI 也不应知道缓存写入顺序。** 数据模型、领域模型与 UI 模型可以在确有边界需要时区分，避免无意义转换。

离线场景可把本地数据库设为 UI 的主要读取来源，网络负责同步更新它。如何保持一致，见[离线优先](./network-storage#offline-first)。[官方：数据层](https://developer.android.com/topic/architecture/data-layer)。

## Jetpack 的职责

### LiveData 和 StateFlow 应该怎么选？ {#livedata}

LiveData 内置生命周期感知，适合现有 View 体系观察。StateFlow 原生衔接协程与 Flow，强调持有当前值；Android UI 收集时需要明确生命周期策略。

LiveData 的 `postValue` 在主线程分发前多次调用可能合并；StateFlow 也会按相等性合并。**两者都不应被直接宣传为可靠的逐条事件总线。**

既有项目可按边界逐步迁移；为了“技术更新”在同一条链路反复转换 LiveData 和 Flow，会增加理解与测试成本。[官方：LiveData](https://developer.android.com/topic/libraries/architecture/livedata)、[StateFlow](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow)。

### Paging 3 解决什么，`PagingSource` 和 `RemoteMediator` 怎么分工？ {#paging}

Paging 管理分页加载、失效、重试和加载状态等过程。PagingSource 从一个分页数据来源提供页；RemoteMediator 协调网络与本地缓存的分页边界，常用于数据库作为界面读取来源的方案。

**用了 Paging 也要设计排序和一致性。** refresh、append、prepend、游标过期、重复 ID 和空页都可能影响结果。UI 要区分首次加载失败与已有内容时追加失败，不能都显示整页错误。

`cachedIn(viewModelScope)` 的共享范围也不是永久磁盘缓存。[官方：Paging 3](https://developer.android.com/topic/libraries/architecture/paging/v3-overview)。

### Hilt / Dagger 的依赖注入有什么价值？ {#di}

依赖注入让对象所需依赖从外部提供，有助于替换实现、约束生命周期和测试。Hilt 在 Android 组件体系上组织生成的依赖关系，并不使所有对象天然单例。

**Scope 表达某个组件范围内的复用。** 生命周期长的对象不应依赖生命周期短的 Activity；用注解掩盖错误依赖关系，会把泄漏固定进对象图。

简单代码可以先用构造函数注入，达到规模后再引入生成框架。测试时替换 Repository、dispatcher、时钟和网络实现，比在每个测试里操纵真实系统更可控。[官方：Hilt](https://developer.android.com/training/dependency-injection/hilt-android)。

## 测试与复杂度控制

### 单元测试、集成测试与 UI 测试分别验证什么？ {#testing}

| 测试层次 | 重点 | 示例 |
| --- | --- | --- |
| 单元测试 | 明确输入下的业务规则与状态转移 | 取消旧查询后不覆盖新结果 |
| 集成测试 | 真实边界之间的协作 | Room 迁移、序列化、缓存策略 |
| UI / 端到端测试 | 关键用户路径是否可完成 | 搜索、登录、返回、恢复 |

协程测试用 `runTest` 与测试调度器控制虚拟时间；不能靠固定 `Thread.sleep` 猜异步何时结束。UI 测试关注用户可观察行为，而不是把每个私有方法复写成断言。[官方：测试 Kotlin 协程](https://developer.android.com/kotlin/coroutines/test)。

### 模块化能解决哪些问题，什么情况会越拆越慢？ {#modularization}

按业务 feature 与稳定公共能力划分模块，明确 API 和依赖方向，可以支持团队协作、隔离变化，并改善部分增量构建。基础模块不应反向依赖所有业务模块。

**模块越多不代表架构越好。** 过细拆分增加 Gradle 配置、接口样板和依赖管理成本；巨大公共模块又会让一次改动使大量下游重编。应结合依赖图、构建分析和团队边界决定。

**追问：循环依赖如何处理？** 找清职责，抽取窄接口或调整依赖方向；不要把所有模型塞进 common 模块让循环表面消失。[官方：模块化指南](https://developer.android.com/topic/modularization)。

## 面试前自测

拿一个已有页面，画出 UI → 状态所有者 → Repository → 数据源的依赖关系。标注每个对象的作用域，并说明如何在不联网、不等待真实时间的条件下测试失败与重试。

### 自测参考答案

以文章列表为例，依赖方向可以写成：

```text
Fragment / Composable → FeedViewModel → FeedRepository 接口
                                      └─ 实现 → ArticleDao + RemoteApi
UI 发送刷新动作 → ViewModel 协调 → Repository 更新数据库
UI 收集 UiState ← ViewModel 转换 ← 数据库 Flow
```

UI 和绑定对象跟随 View 或组合生命周期；ViewModel 跟随选定页面或导航图作用域；Repository 可按应用或账号作用域复用，DAO 跟随数据库实例，网络客户端通常共享连接资源。作用域必须显式选择，应用级对象不能捕获页面，账号相关实例和任务要支持注销清理。

**不联网的测试：** 注入可编程 Fake Repository 或 Fake RemoteApi，使第一次调用返回可重试错误，第二次成功；注入测试 dispatcher，在 `runTest` 中使用同一个测试调度器推进虚拟时间。若逻辑读取时钟或计算随机退避，还要注入时钟与随机源；不要留下真实 `sleep` 或未替换的 IO dispatcher。

**应核对的结果：** 初始缓存可见，刷新失败保留旧列表并显示错误；到达退避期限前不发请求，重试后显示新数据并清除错误；取消页面任务后不再继续页面级重试。额外验证重复点击不会并发刷新、旧账号结果不能落入新账号。观察中间状态时让收集端及时消费，不要求 StateFlow 保留所有瞬时值。

ViewModel 单元测试检查状态与协调，Repository 集成测试再检查真实数据库事务、去重和迁移；仅使用 Fake 不能证明 SQL 正确。见[测试分层](#testing)与[离线优先](./network-storage#offline-first)。
