---
title: Jetpack Compose 常见面试题
description: 图解 Composition、Layout、Drawing，解释状态提升、remember、副作用、稳定性、列表 key 与性能。
---

# 06 · Jetpack Compose

理解 Compose 的入口是 `UI = f(state)`：开发者描述状态对应的界面，由运行时协调更新。**声明式不是“每次把整页重建一遍”，也不是允许在 UI 函数里随意执行副作用。**

## 状态与重组

### 重组是什么，是否等于重绘整个页面？ {#recomposition}

重组是重新执行受影响的可组合范围，更新 UI 描述。它不同于布局和绘制；运行时会跟踪状态读取，必要时只重做相关阶段，未变化的部分可能被跳过。

<KnowledgeFlow title="Compose 一帧的三个主要阶段" :steps="[
  { title: 'Composition', detail: '执行可组合函数，决定显示哪些 UI' },
  { title: 'Layout', detail: '测量尺寸，再放置到相应位置' },
  { title: 'Drawing', detail: '把内容绘制到 Canvas，进入显示管线' }
]" caption="状态在哪个阶段被读取，会影响变化后哪些阶段需要重新运行。" />

Composable 应尽量无副作用且执行快速。执行可能重复、跳过或被取消，不能依赖“这个函数只会调用一次”。[官方：Compose 阶段](https://developer.android.com/develop/ui/compose/phases)。

### `remember`、`rememberSaveable` 与 ViewModel 保存什么？ {#remember}

| 机制 | 保存范围 | 典型内容 |
| --- | --- | --- |
| `remember` | 当前 Composition 中相应身份位置 | 局部临时对象或 UI 状态 |
| `rememberSaveable` | 借助保存状态机制恢复受支持的数据 | 输入框、选中项、轻量 UI 状态 |
| ViewModel | ViewModelStoreOwner 对应业务作用域 | 屏幕业务逻辑与 UI 状态 |

`remember` 不能自动跨 Activity 重建或进程死亡保存；`rememberSaveable` 也不是持久化数据库。复杂类型可定义 Saver，但不要把大列表或图片全部序列化进去。

**追问：退出 Composition 再回来，remember 一定还在吗？** 不保证，身份、宿主和保存机制决定行为。还需区分“当前组合身份”和业务实体 ID。[官方：状态与 Compose](https://developer.android.com/develop/ui/compose/state)。

### 状态提升为什么有用，提升到哪里？ {#state-hoisting}

把状态放到需要读取和修改它的合适共同所有者，子组件接收值与事件回调，使状态来源明确、组件容易复用和测试。并不是所有开关都必须放进 ViewModel。

```kotlin
@Composable
fun SearchBar(query: String, onQueryChange: (String) -> Unit) {
    TextField(value = query, onValueChange = onQueryChange)
}
```

控件展开状态可在局部，搜索结果与业务规则更适合屏幕状态所有者。**不要同时在父子各保存一份互相同步的真实状态**，否则容易出现双向更新与不一致。[官方：状态提升](https://developer.android.com/develop/ui/compose/state-hoisting)。

### 普通 `mutableListOf` 更新为什么可能不刷新？ {#snapshot-state}

Compose 需要能观察到的状态变化。对普通可变集合执行 `add`，不会自动触发 Snapshot 状态通知；把它放进一个从未更新的 `MutableState` 里也不会神奇地观察内部修改。

可选择 `SnapshotStateList` 等可观察容器，或使用不可变 UI 模型，每次生成新值并更新状态。后者也便于状态流、差异比较和日志分析。

**追问：StateFlow 原地修改同一个对象也会更新吗？** 相等性合并可能使更新不可见，应该用符合状态语义的新值。对象内部可变字段仍需要被正确观察。[官方：Compose 状态](https://developer.android.com/develop/ui/compose/state)。

## 副作用与身份

### `LaunchedEffect`、`DisposableEffect`、`SideEffect` 如何选择？ {#effects}

| API | 生命周期与用途 | 常见错误 |
| --- | --- | --- |
| `LaunchedEffect(key)` | 进入组合时启动协程，key 变化重启，离开取消 | key 过于频繁变化造成重复请求 |
| `DisposableEffect(key)` | 注册需要成对清理的资源，在 onDispose 解绑 | 只注册监听不清理 |
| `SideEffect` | 成功重组后向外部发布状态 | 用来执行耗时请求 |
| `rememberCoroutineScope` | 返回与组合位置关联的 scope | 把必须持久完成的工作绑到短寿命 UI |

不要直接在 Composable 函数体发网络请求。用 effect 也要先确认任务所有者：页面级业务通常交给 ViewModel，而不是每个展示组件自行加载。[官方：副作用](https://developer.android.com/develop/ui/compose/side-effects)。

### effect 要用新回调，却不想重启，怎么办？ {#updated-state}

`rememberUpdatedState` 在保持 effect 寿命的同时，让长寿命逻辑读到最新值。它适合“回调变化不应该重启计时”等需求。

```kotlin
@Composable
fun TimeoutNotice(onTimeout: () -> Unit) {
    val latestOnTimeout by rememberUpdatedState(onTimeout)
    LaunchedEffect(Unit) {
        delay(3_000)
        latestOnTimeout()
    }
}
```

这里的计时只属于本次组合位置；离开后取消。**`LaunchedEffect(Unit)` 不意味着应用全局只执行一次。** 如果任务身份本来依赖用户 ID，就应把用户 ID 纳入 key，而不是绕过重启。[官方：effect 中引用最新值](https://developer.android.com/develop/ui/compose/side-effects#rememberupdatedstate)。

### 列表为什么需要稳定的 key？ {#keys}

列表插入、删除或排序后，位置会变化，稳定 key 帮助运行时识别“还是同一业务项”，让对应局部状态与 effect 跟随实体。

```kotlin
LazyColumn {
    items(items = messages, key = { it.id }) { message ->
        MessageRow(message)
    }
}
```

不要给每次渲染生成随机 key，也不要在可重排列表中仅用位置表达身份。key 必须在相应范围内唯一；需要 saveable 恢复时还要符合可保存类型的要求。[官方：Lazy 列表 key](https://developer.android.com/develop/ui/compose/lists#item-keys)。

## 性能与互操作

### 参数不稳定一定不能跳过重组吗？ {#stability}

**不能把旧版规则直接套到所有版本。** 官方说明 Kotlin 2.0.20 起默认启用 Strong Skipping；在该模式下，可重启函数的跳过能力和不稳定参数的比较方式，与旧模式有区别。稳定参数通常按相等性比较，不稳定参数可按引用身份比较。

`@Stable`、`@Immutable` 是契约声明，不会替普通可变字段补上观察能力。错误标注可能让界面无法及时更新；对大集合的昂贵比较也可能成为成本。

**追问：怎么验证？** 确认编译器版本和开关，查看稳定性报告及 Layout Inspector，再用 release 性能测量判断是否真有瓶颈。[官方：稳定性](https://developer.android.com/develop/ui/compose/performance/stability)。

### `derivedStateOf`、`snapshotFlow` 和延后读取分别解决什么？ {#derived-state}

`derivedStateOf` 适合高频输入变化、低频派生结果变化，例如滚动位置频繁更新，但“是否展示回顶按钮”只偶尔变化。它自身有成本，不必包住所有字符串拼接。

`snapshotFlow` 把 Snapshot 状态读取转换为 Flow，适合连接流式处理；并不是任意对象字段变化都能被它观察。把状态读取延后到布局或绘制 lambda，则可能减少不必要的前置阶段工作。

**易错点：** 不能只看重组次数判断性能。一次昂贵布局或图片解码可能比很多次轻量重组更糟。[官方：派生状态](https://developer.android.com/develop/ui/compose/side-effects#derivedstateof)、[状态读取阶段](https://developer.android.com/develop/ui/compose/phases#phased-state-reads)。

### Compose 与 View 混用，最容易漏掉什么？ {#interop}

用 `AndroidView` 托管已有 View，用 `ComposeView` 在旧页面中嵌入 Compose。关键是正确绑定宿主生命周期、处理 View 的创建与更新，并管理监听、回调和资源释放。

Fragment 的 View 销毁时，Composition 的释放策略也应与 View 生命周期一致；不能让它持续持有已经失效的绑定。混合列表还要注意复用语义和状态所有者。

**追问：是否应该一次性全量迁移？** 应结合维护成本、互操作边界和性能回归逐步决定。两套 UI 混用时仍要统一导航、主题、无障碍和状态来源。[官方：Compose 与 Views 互操作](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis)。

## 面试前自测

做一个可以重排的输入框列表，分别使用位置 key、稳定 ID key，观察输入内容跟随谁。再把请求放进不同 key 的 LaunchedEffect，解释何时取消和重启。
