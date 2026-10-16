---
title: 移动端八股全部题目索引
description: 按专题浏览 Android、Kotlin、并发、渲染、网络存储、性能、音视频、iOS 与跨端开发问答。
outline: [2, 2]
search: false
---

# 全部题目索引

共 **27 个专题、300 道问答**。点击问题直达答案；可用顶部搜索回查关键词，也可回到[学习地图](./)按顺序学习。

基础篇建立整体认识，进阶篇继续展开实现、失败路径与工程取舍。问题序号用于本页阅读，分享时请使用具体问题链接。

## 01 · Java、Kotlin 与运行时 {#language}

1. [Kotlin 有空安全，为什么还会空指针？](./language#null-safety)
2. [`val`、只读集合与不可变对象是一回事吗？](./language#immutability)
3. [扩展函数能覆盖成员函数吗？](./language#extensions)
4. [`inline`、`reified`、`noinline` 和 `crossinline` 怎么解释？](./language#inline)
5. [泛型为什么有 `in` 和 `out`？](./language#generics)
6. [HashMap 为什么快，为什么不能直接用于并发写？](./language#hashmap)
7. [`volatile` 能保证 `count++` 线程安全吗？](./language#jmm)
8. [`synchronized`、CAS 与协程 Mutex 怎么选？](./language#locks)
9. [GC 能回收所有不再需要的对象吗？](./language#gc)
10. [Android 运行的是 JVM 字节码吗？ART、JIT、AOT 有什么区别？](./language#art)

## 02 · 组件、生命周期与后台任务 {#components}

11. [Activity 的生命周期怎么回答，`onPause` 就是不可见吗？](./components#activity-lifecycle)
12. [配置变更和进程死亡，数据分别怎么恢复？](./components#state-restoration)
13. [Fragment 为什么有两个 Lifecycle？](./components#fragment-view)
14. [四种 launchMode 和返回栈有什么关系？](./components#launch-mode)
15. [Service 是子线程吗，前台服务能永久保活吗？](./components#service)
16. [WorkManager、协程、前台服务、AlarmManager 怎么选？](./components#background-choice)
17. [BroadcastReceiver 能执行长任务吗？](./components#broadcast)
18. [ContentProvider 为什么常用于跨进程数据共享？](./components#provider)
19. [Activity Context 与 Application Context 如何选择？](./components#context)
20. [多进程应用里，单例和 SharedPreferences 还是同一份吗？](./components#multiprocess)

## 03 · Handler、Binder 与系统启动 {#framework}

21. [Handler、Looper、MessageQueue 各负责什么？](./framework#handler)
22. [Looper 是死循环，为什么不会一直占 CPU 或触发 ANR？](./framework#looper-anr)
23. [`postDelayed` 能精确定时吗，消息严格 FIFO 吗？](./framework#delay)
24. [同步屏障与异步消息是什么，和异步线程一样吗？](./framework#barrier)
25. [Handler 泄漏与 HandlerThread 退出怎么处理？](./framework#handler-leak)
26. [Binder 解决什么，为什么不能说“永远只复制一次”？](./framework#binder)
27. [AIDL、Messenger 和 `oneway` 怎么理解？](./framework#aidl)
28. [为什么不能用 Intent 或 Binder 直接传一张大图？](./framework#binder-limit)
29. [点击桌面图标到 Activity 显示，大致经过什么？](./framework#app-start)
30. [AMS / ATMS、WMS、SurfaceFlinger 各做什么？](./framework#system-services)

## 04 · View、事件分发与渲染 {#view}

31. [`measure`、`layout`、`draw` 各做什么？](./view#view-pipeline)
32. [MeasureSpec 的三种模式是什么？](./view#measure-spec)
33. [`invalidate` 与 `requestLayout` 有什么区别？](./view#invalidate)
34. [自定义 View 时如何避免绘制卡顿？](./view#custom-view)
35. [`dispatchTouchEvent`、`onInterceptTouchEvent`、`onTouchEvent` 怎么配合？](./view#touch-dispatch)
36. [横向列表嵌套纵向滚动，滑动冲突怎么处理？](./view#scroll-conflict)
37. [RecyclerView 如何复用，为什么会图片错位？](./view#recyclerview)
38. [DiffUtil 的“同一项”和“内容相同”怎么区分？](./view#diffutil)
39. [Choreographer、VSync 与掉帧是什么关系？](./view#vsync)
40. [View 动画和属性动画有什么区别？](./view#animation)

## 05 · 协程、Flow 与并发 {#coroutines}

41. [`suspend` 会自动切到后台线程吗？](./coroutines#suspend)
42. [`launch`、`async`、`withContext`、`runBlocking` 有何区别？](./coroutines#builders)
43. [结构化并发到底“结构化”在哪里？](./coroutines#structured-concurrency)
44. [`coroutineScope` 和 `supervisorScope` 怎么选？](./coroutines#supervisor)
45. [协程取消为什么需要配合？](./coroutines#cancellation)
46. [冷 Flow、StateFlow、SharedFlow 有什么区别？](./coroutines#flow-types)
47. [StateFlow 可以保证“每个事件处理一次”吗？](./coroutines#stateflow-events)
48. [`flowOn`、`catch`、`buffer`、`conflate` 和 `collectLatest` 怎么解释？](./coroutines#operators)
49. [Android 界面为什么要按生命周期收集？](./coroutines#lifecycle-collection)
50. [搜索框为什么常用 `debounce + distinctUntilChanged + flatMapLatest`？](./coroutines#search)

## 06 · Jetpack Compose {#compose}

51. [重组是什么，是否等于重绘整个页面？](./compose#recomposition)
52. [`remember`、`rememberSaveable` 与 ViewModel 保存什么？](./compose#remember)
53. [状态提升为什么有用，提升到哪里？](./compose#state-hoisting)
54. [普通 `mutableListOf` 更新为什么可能不刷新？](./compose#snapshot-state)
55. [`LaunchedEffect`、`DisposableEffect`、`SideEffect` 如何选择？](./compose#effects)
56. [effect 要用新回调，却不想重启，怎么办？](./compose#updated-state)
57. [列表为什么需要稳定的 key？](./compose#keys)
58. [参数不稳定一定不能跳过重组吗？](./compose#stability)
59. [`derivedStateOf`、`snapshotFlow` 和延后读取分别解决什么？](./compose#derived-state)
60. [Compose 与 View 混用，最容易漏掉什么？](./compose#interop)

## 07 · 架构、Jetpack 与可测试性 {#architecture}

61. [MVC、MVP、MVVM、MVI 该怎样比较？](./architecture#patterns)
62. [单向数据流怎样避免 UI 不一致？](./architecture#udf)
63. [ViewModel 里应该放什么，不应该持有什么？](./architecture#viewmodel)
64. [Repository 与 UseCase 是不是越多越好？](./architecture#repository)
65. [LiveData 和 StateFlow 应该怎么选？](./architecture#livedata)
66. [Paging 3 解决什么，`PagingSource` 和 `RemoteMediator` 怎么分工？](./architecture#paging)
67. [Hilt / Dagger 的依赖注入有什么价值？](./architecture#di)
68. [单元测试、集成测试与 UI 测试分别验证什么？](./architecture#testing)
69. [模块化能解决哪些问题，什么情况会越拆越慢？](./architecture#modularization)

## 08 · 网络、图片与本地存储 {#network-storage}

70. [一个网络请求从发出到 UI 展示，经过哪些步骤？](./network-storage#request-path)
71. [OkHttp 拦截器、连接池和 Retrofit 分别负责什么？](./network-storage#okhttp)
72. [HTTPS 解决什么，为什么不能关闭证书校验？](./network-storage#https)
73. [HTTP 强缓存和协商缓存，移动端怎么使用？](./network-storage#http-cache)
74. [弱网为什么不能“失败就重试三次”？](./network-storage#retry)
75. [图片文件只有 200KB，为什么解码会占很多内存？](./network-storage#bitmap)
76. [Room、DataStore 与 SharedPreferences 怎么选？](./network-storage#storage-choice)
77. [数据库事务、索引与迁移分别解决什么？](./network-storage#room)
78. [离线优先如何避免“网络一份，数据库一份”？](./network-storage#offline-first)
79. [缓存和离线任务在多账号切换时如何隔离？](./network-storage#account-isolation)

## 09 · 启动、卡顿、内存与稳定性 {#performance}

80. [冷启动、温启动、热启动怎么区分？TTID 和 TTFD 呢？](./performance#startup)
81. [启动优化为什么不能把所有初始化放到后台？](./performance#startup-optimize)
82. [卡顿如何区分主线程、RenderThread、GPU 和调度问题？](./performance#jank)
83. [ANR 都是“主线程执行超过 5 秒”吗？](./performance#anr)
84. [内存泄漏、内存抖动和 OOM 有什么区别？](./performance#memory)
85. [泄漏工具发现 Activity 被保留，如何分析？](./performance#leak-analysis)
86. [Crash 治理为什么不能只加全局 `try/catch`？](./performance#crash)
87. [Baseline Profile 与 Startup Profile 有什么区别？](./performance#baseline-profiles)
88. [Macrobenchmark、Microbenchmark 与线上指标怎么配合？](./performance#benchmark)
89. [耗电优化与包体积优化，从哪里入手？](./performance#battery-size)

## 10 · 构建、发布、适配与安全 {#engineering}

90. [Android 从源码到 APK / AAB 的大致流程是什么？](./engineering#build)
91. [`minSdk`、`targetSdk`、`compileSdk` 分别控制什么？](./engineering#sdk)
92. [R8 为什么会让反射或 JNI 代码在 release 崩溃？](./engineering#r8)
93. [APK 与 AAB 有何区别，签名为什么影响升级？](./engineering#signing)
94. [Gradle 构建慢，配置缓存与构建缓存有什么区别？](./engineering#gradle)
95. [权限、后台限制与 edge-to-edge 适配怎样组织？](./engineering#compatibility)
96. [JNI / NDK 一定更快吗，常见坑是什么？](./engineering#jni)
97. [token、API key 和本地敏感数据怎么保护？](./engineering#secrets)
98. [WebView、深链和导出组件有哪些共同风险？](./engineering#entry-security)
99. [灰度、回滚与可观测性如何形成发布闭环？](./engineering#release)

## 11 · iOS 与 Swift 基础 {#ios}

100. [Swift 的 struct 与 class 有什么区别？](./ios#swift-types)
101. [ARC 与 Android 常见的 tracing GC 有何不同？](./ios#arc)
102. [`weak` 和 `unowned` 怎么选，闭包都要 `[weak self]` 吗？](./ios#weak)
103. [RunLoop 是线程吗，Timer 为什么不精确？](./ios#runloop)
104. [GCD 的串行/并发与同步/异步是同一个维度吗？](./ios#gcd)
105. [Swift `async/await`、Task 与 actor 解决什么？](./ios#swift-concurrency)
106. [SwiftUI 的 `State`、`Binding` 与观察模型如何理解？](./ios#swiftui-state)
107. [iOS 前后台与 Android Service 可以直接对应吗？](./ios#ios-lifecycle)
108. [iOS 卡顿和内存问题怎么定位？](./ios#ios-performance)

## 12 · Flutter、React Native 与 KMP {#cross-platform}

109. [原生、Flutter、React Native、KMP 怎么选？](./cross-platform#selection)
110. [Flutter 的 Widget、Element、RenderObject 为什么分三层？](./cross-platform#flutter-trees)
111. [Flutter 布局为什么常说“约束向下、尺寸向上、父级定位置”？](./cross-platform#flutter-layout)
112. [Dart 的 `async` 和 Future 会自动多线程吗？Isolate 呢？](./cross-platform#dart-isolate)
113. [Platform Channel 与 FFI 怎么区分？](./cross-platform#platform-channel)
114. [Flutter 还应该统一背“使用 Skia 渲染”吗？](./cross-platform#impeller)
115. [React Native 还完全依赖旧的异步 Bridge 吗？](./cross-platform#react-native)
116. [React Native 的 JS 卡顿与原生 UI 卡顿怎么区别？](./cross-platform#rn-performance)
117. [KMP 的 `expect/actual` 有什么用？](./cross-platform#kmp)
118. [Hybrid / WebView 桥接如何设计，跨端效果如何验证？](./cross-platform#hybrid)

## 13 · 场景设计与面试自测 {#scenarios}

119. [设计一个支持离线、刷新和分页的信息流，怎么回答？](./scenarios#feed)
120. [搜索输入很快，怎么减少请求并避免旧结果覆盖？](./scenarios#search-design)
121. [断点续传下载如何避免文件损坏？](./scenarios#download)
122. [多个请求同时 401，怎么只刷新一次 token？](./scenarios#token-refresh)
123. [LRU 为什么常用哈希表加双向链表？](./scenarios#lru)
124. [移动端算法面试优先复习什么？](./scenarios#algorithms)
125. [聊天消息怎么实现去重、补拉与最终显示一致？](./scenarios#messaging)
126. [视频列表如何协调播放、预加载与页面生命周期？](./scenarios#video)
127. [新版本启动慢了，怎么定位并决定停止扩量？](./scenarios#regression)
128. [如何把一个项目讲成可信的技术案例？](./scenarios#project-story)

## 14 · 集合、类加载与运行时进阶 {#collections-runtime}

129. [HashMap 为什么常用 2 的幂容量，扩容时怎样分配旧节点？](./collections-runtime#hashmap-resize)
130. [链表树化为什么有容量条件，而不是碰到冲突就转红黑树？](./collections-runtime#treeify)
131. [ConcurrentHashMap 为什么不能只理解成“分段锁”？](./collections-runtime#concurrent-map)
132. [ArrayList 随机访问快，为什么头部删除慢？](./collections-runtime#arraylist)
133. [实现栈和队列，为什么常优先考虑 ArrayDeque？](./collections-runtime#deque)
134. [Android 的 SparseArray、ArrayMap 为什么可能更省内存？](./collections-runtime#compact-containers)
135. [fail-fast 能保证发现所有并发修改吗？](./collections-runtime#fail-fast)
136. [CopyOnWriteArrayList 为什么适合读多写少的监听器？](./collections-runtime#copy-on-write)
137. [WeakHashMap 能自动解决监听器或页面泄漏吗？](./collections-runtime#weak-map)
138. [ReferenceQueue 能告诉我们什么，能代替手动关闭资源吗？](./collections-runtime#reference-queue)
139. [类加载、链接和初始化有什么区别，Android 动态加载要注意什么？](./collections-runtime#class-loading)
140. [为什么不能把 HotSpot 的 GC 参数直接用于 Android？](./collections-runtime#art-vs-hotspot)

## 15 · Kotlin 语言机制与互操作 {#kotlin-advanced}

141. [`lateinit` 与 `lazy` 的初始化时机、线程安全有何区别？](./kotlin-advanced#lateinit-lazy)
142. [`object`、`companion object` 与普通静态成员能完全等同吗？](./kotlin-advanced#objects)
143. [sealed class / interface 和 enum 适合表达什么区别？](./kotlin-advanced#sealed)
144. [`Unit`、`Nothing`、可空类型在控制流中分别表示什么？](./kotlin-advanced#nothing)
145. [`let/run/with/apply/also` 是五种不同的线程或作用域吗？](./kotlin-advanced#scope-functions)
146. [Sequence 一定比 List 操作更快吗？](./kotlin-advanced#sequences)
147. [`@JvmInline value class` 能保证完全没有装箱吗？](./kotlin-advanced#value-class)
148. [lambda、函数引用与 SAM 转换都一定创建新对象吗？](./kotlin-advanced#lambda-sam)
149. [`by` 委托属性怎样工作，`observable` 能监听对象内部所有变化吗？](./kotlin-advanced#delegates)
150. [Kotlin 的 `==`、`===` 与数组、浮点比较有什么坑？](./kotlin-advanced#equality)
151. [星投影 `List<*>` 是不是 `List<Any?>`，为什么不能随便写入？](./kotlin-advanced#star-projection)
152. [默认参数、`@JvmOverloads` 和 JVM 注解怎样影响 Java 调用？](./kotlin-advanced#java-interop)

## 16 · 线程池、锁与并发故障 {#java-concurrency}

153. [BLOCKED、WAITING、TIMED_WAITING 分别表示什么？](./java-concurrency#thread-states)
154. [`wait`、`sleep`、`join` 为什么不能互相替代？](./java-concurrency#wait-sleep-join)
155. [ThreadLocal 为什么可能泄漏，为什么线程池中特别容易出问题？](./java-concurrency#thread-local)
156. [线程池达到 corePoolSize 后，是先扩线程还是先入队？](./java-concurrency#pool-dispatch)
157. [fixed 与 cached 线程池分别可能怎样耗尽资源？](./java-concurrency#executors-risk)
158. [CallerRunsPolicy 在 Android 上为什么可能把后台任务推回主线程？](./java-concurrency#rejection)
159. [有界队列、限流、背压与舱壁隔离有什么区别？](./java-concurrency#backpressure)
160. [`execute` 和 `submit` 的异常观察方式为什么不同？](./java-concurrency#execute-submit)
161. [AQS 是锁吗，ReentrantLock 的公平模式保证绝对公平吗？](./java-concurrency#aqs)
162. [Semaphore、CountDownLatch、CyclicBarrier 解决什么不同问题？](./java-concurrency#coordination)
163. [死锁、活锁与饥饿怎么区分，排查先找什么？](./java-concurrency#deadlock)
164. [双重检查单例为什么需要安全发布，CAS 又有哪些边界？](./java-concurrency#publication)

## 17 · Framework、启动与 Binder 深入 {#framework-internals}

165. [Zygote 的预加载与 fork 为什么有价值？是不是完全复制一份内存？](./framework-internals#zygote)
166. [`startActivity` 为什么不是直接 new 一个 Activity？](./framework-internals#launch-transaction)
167. [`attachBaseContext`、Provider 与 `Application.onCreate` 的顺序有什么用？](./framework-internals#application-init)
168. [ActivityThread 是新线程吗，system_server 和应用进程是什么关系？](./framework-internals#process-roles)
169. [ServiceManager 与 `Context.getSystemService` 是同一个东西吗？](./framework-internals#service-manager)
170. [Binder 为什么可能发生重入，持锁远程调用有什么危险？](./framework-internals#binder-reentrancy)
171. [`getCallingUid` 与 `clearCallingIdentity` 为什么涉及安全边界？](./framework-internals#calling-identity)
172. [DeathRecipient 能保证知道某个请求到底有没有执行吗？](./framework-internals#death-recipient)
173. [Handler 的 Runnable、Callback 和 `handleMessage` 谁优先？](./framework-internals#handler-dispatch)
174. [Message 对象池能省什么，发送后还能继续修改消息吗？](./framework-internals#message-pool)
175. [IdleHandler 是不是“系统空闲时随便做长任务”的机会？](./framework-internals#idle-handler)
176. [PendingIntent 为什么不是一份普通 Intent？身份匹配忽略什么？](./framework-internals#pending-intent)

## 18 · 渲染管线、窗口与复杂列表 {#rendering-advanced}

177. [`inflate(layout, parent, false)` 为什么仍要传 parent？](./rendering-advanced#inflate)
178. [`include`、`merge`、ViewStub 分别省下什么？](./rendering-advanced#layout-reuse)
179. [同一个 View 为什么会被测量多次？ConstraintLayout 一定更快吗？](./rendering-advanced#multiple-measure)
180. [一帧前连续 `requestLayout`，是不是立刻完整布局很多次？](./rendering-advanced#traversal-coalescing)
181. [硬件加速下的 DisplayList / RenderNode 与 GPU 是什么关系？](./rendering-advanced#rendernode)
182. [SurfaceView 与 TextureView 在合成、变换和生命周期上有何区别？](./rendering-advanced#surfaces)
183. [双缓冲、三缓冲为什么不能直接等同于“更高帧率”？](./rendering-advanced#bufferqueue)
184. [`postFrameCallback` 是独立渲染线程，能代替定时器吗？](./rendering-advanced#frame-callback)
185. [嵌套滚动中的 pre-scroll、consumed、unconsumed 是什么？](./rendering-advanced#nested-scroll)
186. [多指手势里 pointer index 与 pointer ID 为什么不能混用？](./rendering-advanced#multi-touch)
187. [RecyclerView 的 payload 与状态恢复为什么仍需要完整绑定？](./rendering-advanced#list-restoration)
188. [dp/sp、字体放大、insets 和无障碍为什么属于正确性？](./rendering-advanced#adaptive-a11y)

## 19 · 协程状态机与 Flow 深入 {#coroutines-internals}

189. [suspend 函数为什么常被编译成状态机？Continuation 保存什么？](./coroutines-internals#state-machine)
190. [CoroutineContext 是键值集合，为什么 `launch(Job())` 可能破坏原任务关系？](./coroutines-internals#context-job)
191. [Dispatchers.IO 与 Default 为什么不能简单理解为两组互不相干的线程？](./coroutines-internals#dispatchers)
192. [`limitedParallelism(4)` 能保证最多四个网络请求在途吗？](./coroutines-internals#parallelism)
193. [用 `suspendCancellableCoroutine` 桥接回调，最难的是哪两个竞争？](./coroutines-internals#callback-races)
194. [withTimeout 为什么不能保证超时后服务器停止，资源又可能在哪泄漏？](./coroutines-internals#timeout-resources)
195. [CoroutineExceptionHandler 为什么不能替代每层错误处理？](./coroutines-internals#exception-handler)
196. [Channel 的容量、关闭、取消与 `onUndeliveredElement` 各解决什么？](./coroutines-internals#channels)
197. [`stateIn + WhileSubscribed` 在最后一个订阅者离开后做什么？](./coroutines-internals#sharing-policy)
198. [callbackFlow 为什么常需要 `awaitClose`？和 `flow {}` 有何边界？](./coroutines-internals#callback-flow)
199. [`flowOn` 与 `buffer` 为什么可能融合，重试又应该放在哪一层？](./coroutines-internals#flow-fusion)
200. [runTest 的虚拟时间为什么不能控制所有真实线程与 I/O？](./coroutines-internals#virtual-time)

## 20 · Compose 状态、布局与测试深入 {#compose-advanced}

201. [为什么说 remember 依赖组合身份，而不是某个 Kotlin 对象字段？](./compose-advanced#composition-identity)
202. [Snapshot 与普通 mutable 对象的区别是什么，能随便跨线程改吗？](./compose-advanced#snapshot)
203. [Strong Skipping 下为什么“传同一个可变对象”仍可能让 UI 不更新？](./compose-advanced#skipping-contract)
204. [状态读取放到布局或绘制阶段，为什么可能减少重组？](./compose-advanced#deferred-reads)
205. [Compose 为什么强调一次测量，intrinsic measurement 是违规重测吗？](./compose-advanced#intrinsics)
206. [SubcomposeLayout 为什么允许在布局阶段组织组合，代价是什么？](./compose-advanced#subcompose)
207. [Lazy 列表的 key 与 contentType 分别表达什么？](./compose-advanced#lazy-content-type)
208. [derivedStateOf 与 snapshotFlow 为什么都可能忽略相等的中间结果？](./compose-advanced#derived-vs-flow)
209. [自定义 Saver 应保存整个对象，还是恢复所需的最小信息？](./compose-advanced#saver)
210. [effect key、rememberUpdatedState 与业务任务 ID 如何区分？](./compose-advanced#effect-identity)
211. [Navigation 返回栈、ViewModel 作用域与参数恢复怎么配合？](./compose-advanced#navigation-state)
212. [Semantics 树、重组次数和 UI 测试各能证明什么？](./compose-advanced#semantics-testing)

## 21 · 网络协议与 OkHttp 深入 {#network-advanced}

213. [DNS 解析与连接竞速为什么会影响移动端长尾？](./network-advanced#dns-connect)
214. [TCP 三次握手、关闭与 TIME_WAIT 分别解决什么？](./network-advanced#tcp-lifecycle)
215. [TCP 可靠为什么还需要业务分帧、确认与去重？](./network-advanced#tcp-framing)
216. [HTTP/2 与 HTTP/3 怎样处理队头阻塞，QPACK 就完全不阻塞吗？](./network-advanced#http2-http3)
217. [TLS 1.3 的密钥协商、证书和会话恢复分别负责什么？](./network-advanced#tls13)
218. [OkHttp Dispatcher 的限制是否同样约束同步与异步调用？](./network-advanced#dispatcher)
219. [OkHttp 核心拦截器顺序为什么重要？](./network-advanced#interceptor-chain)
220. [HTTP/2 连接复用与连接合并，是不是只看 host 一样？](./network-advanced#connection-pooling)
221. [connect/read/write/call timeout 为什么不能都叫“请求超时”？](./network-advanced#timeouts)
222. [Authenticator 中同步等待“同池异步刷新”为什么可能死锁或饥饿？](./network-advanced#authenticator)
223. [为什么 ResponseBody 需要关闭，请求体又为什么可能不可重试？](./network-advanced#bodies)
224. [EventListener 为什么比一个 totalTime 更有诊断价值？](./network-advanced#events)
225. [Wi-Fi 切到移动网络后，为什么“系统说有网”仍可能请求失败？](./network-advanced#network-switch)

## 22 · 数据库、离线同步与文件可靠性 {#storage-advanced}

226. [WAL 与传统回滚日志有什么区别，为什么 WAL 文件会变大？](./storage-advanced#wal)
227. [SQLite 的事务隔离与“主线程加一把锁”有什么区别？](./storage-advanced#transactions)
228. [联合索引为什么要关注列顺序、范围条件和排序？](./storage-advanced#composite-index)
229. [EXPLAIN QUERY PLAN 能证明查询在真实设备上很快吗？](./storage-advanced#query-plan)
230. [OFFSET 分页为什么越翻越慢，keyset 分页怎样处理重复时间？](./storage-advanced#keyset)
231. [Room 的关系查询为什么可能需要事务，怎样避免 N+1？](./storage-advanced#relations)
232. [Room Flow 的失效通知是不是只精确通知变化的那一行？](./storage-advanced#room-invalidation)
233. [自动迁移、手写迁移与破坏式重建怎样选择？](./storage-advanced#migration-strategy)
234. [DataStore 的 `updateData` 与“读取后另写一次”为什么不同？](./storage-advanced#datastore-update)
235. [Outbox 和 tombstone 如何帮助离线写入恢复？](./storage-advanced#outbox)
236. [临时文件加 rename 就能保证所有断电场景安全吗？](./storage-advanced#atomic-file)
237. [备份恢复、分区存储和 URI 授权为什么要进入数据设计？](./storage-advanced#backup-storage)

## 23 · 性能诊断与线上治理 {#performance-diagnostics}

238. [trace 上线程 runnable，却没有执行，是函数本身太慢吗？](./performance-diagnostics#scheduling)
239. [Frame Timeline 怎样帮助区分应用迟到与显示链路迟到？](./performance-diagnostics#frame-timeline)
240. [ANR 主线程在等锁，为什么必须继续找锁的持有者？](./performance-diagnostics#anr-wait-chain)
241. [方法采样、插桩和系统 trace 各有什么盲区？](./performance-diagnostics#profiling-methods)
242. [shallow size、retained size 与 dominator 怎样帮助找泄漏？](./performance-diagnostics#heap-analysis)
243. [RSS、PSS、Java heap 和 native heap 为什么不能直接相加比较？](./performance-diagnostics#memory-metrics)
244. [系统低内存杀进程和 Java OOM，为什么不是一种故障？](./performance-diagnostics#lmk-oom)
245. [native 堆采样能找出每一处泄漏吗，采样率怎么影响结果？](./performance-diagnostics#native-heap)
246. [P50、P95、P99 各说明什么，平均值改善为什么可能伤害长尾？](./performance-diagnostics#percentiles)
247. [可复核的 Macrobenchmark 要控制哪些条件？](./performance-diagnostics#benchmark-design)
248. [`reportFullyDrawn` 放早一点是不是就完成 TTFD 优化？](./performance-diagnostics#metric-gaming)
249. [WakeLock、任务合并与后台约束怎样影响耗电治理？](./performance-diagnostics#power-budget)

## 24 · 音视频与相机 {#media-camera}

250. [采样率、位深、声道和码率分别决定什么？](./media-camera#audio-basics)
251. [MP4、H.264、AAC、HLS 分别属于哪一层？](./media-camera#container-codec)
252. [I/P/B 帧、GOP 与关键帧怎样影响压缩和 seek？](./media-camera#gop)
253. [PTS、DTS 与音画同步为什么不能只看系统当前时间？](./media-camera#timestamps)
254. [MediaCodec 的输入、输出、flush 与 EOS 怎么理解？](./media-camera#codec)
255. [Surface 输出是不是保证全链路零拷贝？](./media-camera#surface-output)
256. [Media3 的 READY、playWhenReady 与 isPlaying 为什么不是一个状态？](./media-camera#player-state)
257. [HLS/DASH 自适应码率为什么不能只选“最近测速最高档”？](./media-camera#adaptive-streaming)
258. [媒体缓存和 DRM 许可为什么要分开管理？](./media-camera#cache-drm)
259. [音频焦点丢失、duck 与暂停恢复怎样设计？](./media-camera#audio-focus)
260. [CameraX 分析器跟不上帧率，为什么会卡预览？](./media-camera#camera-backpressure)
261. [YUV_420_888 为什么不能简单当作连续 NV21 字节数组？](./media-camera#yuv)

## 25 · 构建、Native 与安全边界深入 {#build-native-security}

262. [buildType、productFlavor、dimension 和 source set 如何组合？](./build-native-security#variants)
263. [Gradle 的 `api` 与 `implementation` 为什么影响下游编译？](./build-native-security#api-implementation)
264. [BOM、版本约束、依赖锁定与校验各解决什么？](./build-native-security#dependency-control)
265. [kapt 与 KSP 的处理模型和增量能力为什么不同？](./build-native-security#ksp)
266. [Manifest 合并为什么可能改变权限与组件导出行为？](./build-native-security#manifest-merge)
267. [最小 R8 keep 规则怎样找到，为什么“大范围保留”可能掩盖问题？](./build-native-security#keep-rules)
268. [JNI 的 local/global 引用和 JNIEnv 为什么必须分清寿命？](./build-native-security#jni-references)
269. [RAII、use-after-free 和 sanitizer 在 NDK 问题中怎样配合？](./build-native-security#native-memory)
270. [ABI、STL 与 16KB 页适配为什么可能只在部分设备失败？](./build-native-security#abi-pages)
271. [完整性校验和 Root 检测能代替服务端授权吗？](./build-native-security#integrity)
272. [App Links 验证成功，为什么仍需校验页面参数和登录状态？](./build-native-security#app-links)
273. [WebView bridge 为什么需要能力列表和来源边界？](./build-native-security#webview-bridge)
274. [热修复、插件化与动态功能分发有什么不同边界？](./build-native-security#dynamic-code)
275. [不稳定测试为什么不能靠不断增加 sleep 修复？](./build-native-security#flaky-tests)
276. [怎样让一个发布产物可复核，而不只说“CI 绿了”？](./build-native-security#reproducibility)

## 26 · iOS Runtime、并发与界面深入 {#ios-advanced}

277. [写时复制的值类型，为什么仍不能任意并发修改同一个变量？](./ios-advanced#cow)
278. [`some Protocol`、`any Protocol` 与泛型怎样选择？](./ios-advanced#opaque-existential)
279. [Objective-C 消息发送与 Swift 调用为什么不能一概而论？](./ios-advanced#objc-runtime)
280. [autoreleasepool 在 ARC 下还有什么作用，和 Core Foundation 所有权怎么区分？](./ios-advanced#autorelease)
281. [RunLoop 的 mode 为什么可能影响 Timer，common modes 是所有模式吗？](./ios-advanced#runloop-modes)
282. [`Task {}`、`Task.detached`、`async let` 和 task group 怎样区分？](./ios-advanced#swift-tasks)
283. [actor 已隔离状态，为什么 `await` 之后仍要重新检查业务条件？](./ios-advanced#actor-reentrancy)
284. [Sendable 与 `@Sendable` 是运行时锁吗？](./ios-advanced#sendable)
285. [Observation、State、Binding 与旧 ObservableObject 怎样衔接？](./ios-advanced#observation)
286. [Diffable Data Source 的 item identifier 为什么必须稳定？](./ios-advanced#diffable)
287. [URLSession 的后台传输、取消与缓存为什么要分开设计？](./ios-advanced#urlsession)
288. [Auto Layout 的 hugging、compression resistance 和优先级怎么解释？](./ios-advanced#autolayout)

## 27 · 跨端架构与性能深入 {#cross-platform-advanced}

289. [Widget 能否更新现有 Element，为什么同时看 runtimeType 和 key？](./cross-platform-advanced#flutter-update)
290. [RepaintBoundary 能阻止 build、layout 和所有 GPU 成本吗？](./cross-platform-advanced#repaint-boundary)
291. [Dart 的 microtask、event queue 与 isolate 为什么要分开理解？](./cross-platform-advanced#dart-scheduling)
292. [Platform Views 为什么常成为跨端性能与兼容边界？](./cross-platform-advanced#platform-views)
293. [Flutter debug、profile、release 的性能为什么不能直接混比？](./cross-platform-advanced#flutter-profiling)
294. [Fabric 的 render、commit、mount 各负责什么？](./cross-platform-advanced#fabric)
295. [TurboModules、Codegen 与 JSI 分别解决哪一层？](./cross-platform-advanced#turbo-modules)
296. [FlatList 的 window、batch、memo 和稳定 key 怎样一起取舍？](./cross-platform-advanced#flatlist)
297. [commonMain、平台 source set 与中间共享层如何影响依赖可见性？](./cross-platform-advanced#source-sets)
298. [Kotlin/Native 的内存管理和 Swift ARC 混合时容易漏掉什么？](./cross-platform-advanced#native-arc)
299. [Kotlin suspend / Flow 暴露给 Swift，为什么不能假设取消自动等价？](./cross-platform-advanced#swift-coroutines)
300. [commonTest 通过，为什么还需要每个平台的集成测试？](./cross-platform-advanced#cross-platform-tests)
