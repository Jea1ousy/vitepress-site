---
title: Android 构建、发布、适配与安全面试题
description: 理解 Gradle、DEX、R8、AAB、签名、SDK 版本、权限适配、JNI、WebView 安全与灰度发布。
---

# 10 · 构建、发布、适配与安全

工程题连接本地代码与真实用户设备。面试时要能说明：**这份源码怎样变成可验证的安装包，怎样升级，出了问题怎样停止扩大影响。**

## 构建与产物

### Android 从源码到 APK / AAB 的大致流程是什么？ {#build}

常见流程涉及代码编译、资源与 Manifest 处理、DEX 生成、可选压缩优化、打包和签名。实际任务由 Gradle 与 Android Gradle Plugin 组织，顺序和实现细节随版本变化。

<KnowledgeFlow title="构建产物的逻辑流程" :steps="[
  { title: '输入', detail: '源码、资源、Manifest、依赖和构建配置' },
  { title: '编译与处理', detail: '代码编译、资源链接、Manifest 合并' },
  { title: '优化与打包', detail: 'DEX、R8 / 资源优化及 APK / AAB 产物' },
  { title: '签名与验证', detail: '使用对应身份签名，检查版本与安装升级' }
]" />

**追问：本地能编译，CI 为什么失败？** 比较 JDK、Gradle/AGP、SDK、依赖锁定、大小写路径、环境变量与凭据注入，避免只靠清缓存碰运气。[官方：Android 构建](https://developer.android.com/build)。

### `minSdk`、`targetSdk`、`compileSdk` 分别控制什么？ {#sdk}

| 配置 | 作用 | 不能替代什么 |
| --- | --- | --- |
| `minSdk` | 应用支持的最低 Android API 级别 | 不保证所有厂商设备表现相同 |
| `compileSdk` | 编译时可见的 Android API | 不意味着低版本运行时已有该 API |
| `targetSdk` | 声明针对的行为兼容级别，影响相关平台规则 | 不等于最高可运行版本 |

调用高版本 API 需要版本判断、兼容库或其他适当处理。提高 targetSdk 要逐条检查相关行为变化，而不是只改一个数字。[官方：模块配置](https://developer.android.com/build/configure-app-module)。

### R8 为什么会让反射或 JNI 代码在 release 崩溃？ {#r8}

优化器基于静态可达性等信息压缩、优化和混淆代码。反射类名、动态注册、序列化、JNI 查找等动态入口，可能无法被完整推导，需要有针对性的保留规则或库提供的配置。

**不要为了修复一个模型就保留整个应用。** 先定位缺失入口和构建差异，缩小 keep 范围；同时保存每个发布版本的 mapping 和 native 符号，支持线上还原。

**追问：debug 成功足够吗？** 不够。正式构建涉及不同优化和签名路径，关键流程必须在相应产物上验证。[官方：R8 优化](https://developer.android.com/topic/performance/app-optimization/enable-app-optimization)。

### APK 与 AAB 有何区别，签名为什么影响升级？ {#signing}

APK 是可安装包格式；AAB 是发布格式，应用分发方可以按设备配置生成适合的 APK 集合。ABI、语言、屏幕密度及动态功能等因素影响最终交付内容。

升级还涉及包名、签名身份、版本码和平台签名轮换规则。不能随便用新签名覆盖旧应用；上传密钥与应用签名密钥在托管签名方案中也可能不同。

**追问：为什么同代码装不上？** 分析安装错误：签名冲突、版本降级、ABI、不兼容 SDK 或缺失 split 等原因，不能统称“手机缓存问题”。[官方：AAB](https://developer.android.com/guide/app-bundle)、[应用签名](https://developer.android.com/studio/publish/app-signing)。

### Gradle 构建慢，配置缓存与构建缓存有什么区别？ {#gradle}

配置阶段确定项目与任务执行图，执行阶段运行任务。配置缓存复用相关配置结果；构建缓存复用满足条件的任务输出；增量任务则可只处理变化的输入，三者并不相同。

先分析时间花在哪：依赖解析、配置、代码生成、Kotlin 编译、资源处理还是打包。缓存要求任务输入输出与环境依赖声明正确；错误地把不可缓存任务强行标记可缓存，会制造难追踪的错误产物。[官方：Gradle 配置缓存](https://docs.gradle.org/current/userguide/configuration_cache.html)。

## 适配与平台边界

### 权限、后台限制与 edge-to-edge 适配怎样组织？ {#compatibility}

建立设备 OS × targetSdk × 权限状态 × 用户场景的矩阵。运行时权限可能被拒绝、撤销或变化；通知、媒体、定位、后台任务等能力还各有规则。

UI 适配关注窗口大小、insets、键盘、字体缩放、折叠和分屏，避免把“手机型号”当成布局条件。edge-to-edge 要处理状态栏、导航栏和交互区域，不能把内容简单铺满后就结束。

**版本提醒：** 发布前查目标系统及 targetSdk 的官方行为变化；不在此固定陈述随时间变化的商店截止日期。[官方：edge-to-edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge)、[权限](https://developer.android.com/training/permissions/requesting)。

### JNI / NDK 一定更快吗，常见坑是什么？ {#jni}

JNI 是托管代码与 native 代码的互操作边界；NDK 常用于复用 C/C++ 库、编解码或特定性能路径。跨边界调用、数据复制和线程管理本身都有成本，不能因为换成 C++ 就预设更快。

重点关注对象引用寿命、局部/全局引用释放、线程 attach/detach、字符串与数组访问、异常检查、ABI 以及符号文件。`JNIEnv` 具有线程关联性，不能当作可跨线程共享的全局对象。

**追问：native 泄漏会被 Java GC 自动修复吗？** 不保证，必须明确资源所有者与释放协议。[官方：JNI 建议](https://developer.android.com/training/articles/perf-jni)。

## 安全与交付

### token、API key 和本地敏感数据怎么保护？ {#secrets}

客户端中的静态秘密不能因为放在 native 库、BuildConfig 或混淆代码里就被当作绝对安全。服务端需要身份认证、授权和必要的限流；客户端只持有完成场景所需的凭据。

Keystore 可管理密钥并提供相应保护，硬件支持程度取决于设备；它并不自动加密业务文件。还要设计登录过期、注销清理、备份策略、日志脱敏和受损设备下的风险边界。[官方：Android Keystore](https://developer.android.com/privacy-and-security/keystore)。

### WebView、深链和导出组件有哪些共同风险？ {#entry-security}

它们都是外部输入进入应用能力的入口。WebView 应限制可信内容和导航范围，谨慎暴露 JS bridge；bridge 参数不能被直接当作可信命令。深链和导出组件需要验证来源、参数及业务授权。

**“通过了 HTTPS”不代表网页可以调用所有 native 能力；“URL 看起来来自本站”也不等于完成了安全校验。** 解析 URI 时按 scheme、host、path 等结构验证，避免简单字符串前缀判断。

FileProvider 的临时 URI 授权也应限定范围和寿命。[官方：WebView](https://developer.android.com/develop/ui/views/layout/webapps/webview)、[安全建议](https://developer.android.com/privacy-and-security/security-tips)。

### 灰度、回滚与可观测性如何形成发布闭环？ {#release}

发布前验证正式构建、升级迁移和关键路径；逐步扩大用户范围，观察 Crash、ANR、启动、请求失败与业务完成率。记录构建 ID、版本、实验分组与必要诊断信息，避免日志泄露用户数据。

回滚要区分停止扩量、远程关闭功能、发布修复包与真正恢复旧版本。**数据库迁移、服务端协议和已写入的数据，可能让二进制回退不再安全。** 提前设计向后兼容与开关默认行为。

上线标准要可检验，例如某关键指标恶化到预定程度停止扩量；阈值应来自团队基线，而不是随意套用统一数字。[官方：应用质量](https://developer.android.com/quality)。

## 面试前自测

讲清一次 targetSdk 升级、一次 release 专属故障或一次数据库迁移。分别说明测试矩阵、发布观察、触发停止的条件，以及数据改变后还能否回退。
