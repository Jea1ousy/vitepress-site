---
title: 构建系统、NDK、测试与安全边界进阶
description: Variant、依赖隔离、KSP、Manifest 合并、R8、JNI 引用、RAII、ABI、16KB 页、完整性、App Links 和 WebView bridge。
---

# 25 · 构建、Native 与安全边界深入

本章接续[工程基础](./engineering)，围绕“为什么只在某种构建、设备或入口出问题”展开。版本号、依赖图和最终产物，比源码里看起来的配置更有证明力。

## 构建与依赖

### buildType、productFlavor、dimension 和 source set 如何组合？ {#variants}

buildType 常区分调试/发布等构建属性，productFlavor 表达产品差异，多 dimension 会产生相应组合；source set 再为不同范围提供代码与资源。并非目录里所有代码都进入每个产物。

变体爆炸会增加构建、测试与维护成本。排查某渠道缺类或资源时，先确认最终 variant、依赖和合并结果，不要只看 main 源集。[官方：构建变体](https://developer.android.com/build/build-variants)。

### Gradle 的 `api` 与 `implementation` 为什么影响下游编译？ {#api-implementation}

api 把依赖作为库的公开编译边界暴露给消费者，implementation 尽量把实现依赖封装在内部。若公共签名泄露了本想隐藏的类型，消费者仍可能需要相应可见依赖。

合理隔离能减少依赖泄漏和部分重编范围，但不是把所有声明改成 implementation 就一定加速。检查模块公共 API、编译类路径与增量构建结果。[官方：Java Library API/Implementation 分离](https://docs.gradle.org/current/userguide/java_library_plugin.html)。

### BOM、版本约束、依赖锁定与校验各解决什么？ {#dependency-control}

BOM 或平台约束帮助一组库版本对齐，锁定记录已解析版本，校验关注依赖文件是否符合预期。它们不能互相替代，也不能保证所有组合都经业务验证。

动态版本或不受控仓库变化可能使同一提交得到不同依赖。CI 应保留可复核的依赖与构建环境信息，升级时检查解析结果和二进制兼容，而不只是改声明版本。[官方：依赖锁定](https://docs.gradle.org/current/userguide/dependency_locking.html)、[依赖验证](https://docs.gradle.org/current/userguide/dependency_verification.html)。

### kapt 与 KSP 的处理模型和增量能力为什么不同？ {#ksp}

kapt 为 Java 注解处理生态提供桥接，涉及 stub 等处理；KSP 提供面向 Kotlin 符号的处理 API。处理器支持情况、输入依赖声明和生成代码方式都会影响增量效果。

不能只把依赖前缀从 kapt 改成 ksp 就假设所有处理器兼容。验证生成结果、错误报告、构建变体及增量变更范围，并按库支持版本迁移。[官方：KSP 概览](https://kotlinlang.org/docs/ksp-overview.html)。

### Manifest 合并为什么可能改变权限与组件导出行为？ {#manifest-merge}

最终 Manifest 来自多个来源与优先级合并，库也可能带入权限、组件或元数据；源码 main/AndroidManifest.xml 不一定等于安装包中的最终配置。

检查 merged manifest、合并报告和特定 variant，再使用适当规则解决冲突。安全审查应针对最终产物的 exported、权限、Provider 和深链入口，而不是只搜索一个文件。[官方：合并 Manifest](https://developer.android.com/build/manage-manifests)。

### 最小 R8 keep 规则怎样找到，为什么“大范围保留”可能掩盖问题？ {#keep-rules}

先定位动态入口：反射构造、字段名、序列化、JNI 或库生成代码，再根据实际可达性与所需成员建立窄规则。保留整个包虽可能暂时消除崩溃，却降低优化收益并掩盖错误边界。

用 release 产物回归，并保存同一次构建的 mapping 与 native 符号。还原堆栈后继续定位业务根因，不能把每个 release 异常都归为混淆。[官方：保留规则](https://developer.android.com/topic/performance/app-optimization/keep-rules-overview)。

## Native 的所有权与兼容

### JNI 的 local/global 引用和 JNIEnv 为什么必须分清寿命？ {#jni-references}

local 引用通常受当前 JNI 调用等边界约束，global 引用可跨越更长范围但需显式删除；长循环创建大量局部引用也需要管理。JNIEnv 关联线程，不能作为全局值随意跨线程使用。

native 自建线程进入 JVM 相关调用时要按约定 attach/detach，回调还需考虑 Java 异常。引用有效不代表业务对象仍应该继续工作，两层寿命都要管理。[官方：JNI Tips](https://developer.android.com/ndk/guides/jni-tips)。

### RAII、use-after-free 和 sanitizer 在 NDK 问题中怎样配合？ {#native-memory}

RAII 把资源释放关联到对象寿命，可减少遗漏，但悬空指针、跨线程所有权错误或重复释放仍可能存在。use-after-free 往往在损坏之后才崩溃，表面堆栈未必就是首次错误位置。

适用环境下用 HWASan 等工具定位内存错误，并保留匹配符号；工具有平台与开销条件，不能把测试构建的表现直接当线上成本。先明确谁拥有缓冲、谁借用、何时失效。[官方：HWASan](https://developer.android.com/ndk/guides/hwasan)。

### ABI、STL 与 16KB 页适配为什么可能只在部分设备失败？ {#abi-pages}

native 产物与设备 ABI、加载器和链接环境相关，第三方 .so 也会参与兼容性。多个不一致的运行库或缺失的架构产物，可能只在特定安装包/设备组合暴露。

页大小相关适配需检查 ELF 对齐、打包与代码假设，不能硬编码“所有设备页都是 4096 字节”。验证目标环境与所有 native 依赖，而不是只重编自己写的一个库。[官方：16KB 页支持](https://developer.android.com/guide/practices/page-sizes)。

## 身份、输入与分发

### 完整性校验和 Root 检测能代替服务端授权吗？ {#integrity}

不能。完整性信号帮助服务端评估调用环境或应用来源，但业务仍需认证、授权、重放防护和风控策略。单一客户端布尔判断容易被误用成“绝对可信”。

校验结果要按官方协议在服务端验证，并结合具体请求绑定、错误与配额等条件设计降级。不能把客户端出现一次检测失败就当作所有业务事实已被证明。[官方：Play Integrity](https://developer.android.com/google/play/integrity/overview)。

### App Links 验证成功，为什么仍需校验页面参数和登录状态？ {#app-links}

域名验证帮助系统建立网站与应用的关联，不代表任意 URL 参数都已获得业务授权。商品、账户、邀请和支付等操作还要检查参数格式、当前身份与服务端权限。

同时验证 scheme、host、path 等结构以及路由结果，避免只用字符串 startsWith；多域名、重定向、冷启动与已有任务还需测试。[官方：验证 App Links](https://developer.android.com/training/app-links/verify-android-applinks)。

### WebView bridge 为什么需要能力列表和来源边界？ {#webview-bridge}

bridge 把网页输入连接到 native 能力，风险取决于哪些内容可加载、哪些 frame 能调用，以及参数最终触达什么操作。HTTPS 只保护相应传输，不能让所有脚本自动可信。

暴露有限且版本化的能力，明确来源校验、请求 ID、错误与生命周期；不要允许任意方法名、文件路径或命令透传。选用支持来源约束的 API 时也要核对版本与兼容实现。[官方：不安全的 native bridge](https://developer.android.com/privacy-and-security/risks/insecure-webview-native-bridges)。

### 热修复、插件化与动态功能分发有什么不同边界？ {#dynamic-code}

它们分别可能改变代码替换、模块加载或功能交付方式，涉及类加载、资源、签名、优化与平台/分发规则等不同约束。不能把它们都概括为下载 dex 后反射执行。

远端代码输入扩大了供应链与执行风险，应有明确来源、完整性、版本兼容、失败恢复和可观测性；具体方案还需符合适用平台规则。动态功能并不自动允许任意绕过发布流程。[官方：动态代码风险](https://developer.android.com/privacy-and-security/risks/dynamic-code-loading)。

## 测试与交付

### 不稳定测试为什么不能靠不断增加 sleep 修复？ {#flaky-tests}

固定等待把调度噪声伪装成时间假设，机器变慢就失败，变快又白白浪费。先找异步工作的可观察完成条件，注入调度器、时钟与数据源，隔离跨测试共享状态。

UI 同步机制、虚拟时间和适当测试替身解决不同层面问题；关键路径还需要真实设备与正式构建验证。通过率高不代表覆盖了恢复、权限和升级边界。[官方：Android 测试基础](https://developer.android.com/training/testing/fundamentals)。

### 怎样让一个发布产物可复核，而不只说“CI 绿了”？ {#reproducibility}

记录提交、构建工具链、依赖解析、变体、签名身份标识及相应符号文件，保存验证结果与产物摘要。可复核不一定意味着跨所有 OS 都逐字节一致，应先定义重现目标与非确定输入。

<KnowledgeFlow title="发布证据跟随同一次构建" :steps="[
  { title: '确定输入', detail: '提交、工具链、变体与依赖' },
  { title: '生成产物', detail: '构建、优化与签名使用预期配置' },
  { title: '验证', detail: '安装升级、关键路径与兼容矩阵' },
  { title: '保留证据', detail: '产物、mapping、符号和发布观察可关联' }
]" />

日志里不应输出密钥等凭据；测试通过后还要用灰度指标验证真实用户环境。[官方：配置 Android 构建](https://developer.android.com/build)。

## 实验路线

为一个库建立 api/implementation 两种边界，观察下游编译；再制作 debug 正常、release 缺反射入口的最小例子。最后在目标 ABI 与页大小环境中验证最终安装包，记录可追溯产物。
