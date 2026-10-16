---
title: 网络协议、OkHttp 调用链与弱网进阶
description: TCP、HTTP/2/3、TLS、Dispatcher、拦截器、连接复用、超时、鉴权刷新、响应体和网络切换。
---

# 21 · 网络协议与 OkHttp 深入

本章补充[网络基础](./network-storage)没有展开的传输机制和客户端实现。协议以相应 RFC 为准；OkHttp 源码链接用于阅读，具体行为请锁定项目版本。

## 协议与连接

### DNS 解析与连接竞速为什么会影响移动端长尾？ {#dns-connect}

域名可能有多个 IPv4/IPv6 地址，连接还受本地缓存、代理、网络栈和地址选择策略影响。某条路径慢，不应被误判为接口业务处理慢；复用连接的请求又可能完全不经历新的 DNS 和握手。

连接竞速可以减少等待坏路径的时间，但具体策略取决于客户端版本和环境。观测应分开排队、DNS、连接尝试与服务端等待，并按网络类型分析。[官方实现：OkHttp](https://github.com/square/okhttp)。

### TCP 三次握手、关闭与 TIME_WAIT 分别解决什么？ {#tcp-lifecycle}

建立连接需要协调双方的发送接收状态与初始序列号，不能只理解成“服务器确认客户端存在”。TCP 是双向字节流，关闭两个发送方向也需要相应确认；报文可能合并，因此不保证每次关闭都看到独立四个包。

TIME_WAIT 等状态参与处理旧报文和关闭可靠性，不是可以随意关掉的“无用等待”。移动端应先减少无谓新连接并正确复用，不能把调整系统 TCP 参数当作通用应用优化。[标准：TCP](https://www.rfc-editor.org/rfc/rfc9293.html)。

### TCP 可靠为什么还需要业务分帧、确认与去重？ {#tcp-framing}

TCP 提供连接内有序字节流，不保留每次 write 的消息边界；应用需通过长度、分隔符或结构化协议识别消息。连接断开时，业务仍可能不知道对方是否已经完成处理。

“一次 read 就是一条完整消息”会在拆分或合并读取时出错。聊天和自定义长连接还需要业务 ID、重连补拉、幂等与状态确认，不能把连接内可靠交付扩展为跨重连 exactly-once。[标准：TCP 字节流](https://www.rfc-editor.org/rfc/rfc9293.html)。

### HTTP/2 与 HTTP/3 怎样处理队头阻塞，QPACK 就完全不阻塞吗？ {#http2-http3}

HTTP/2 在一条连接中复用多个流，但 TCP 层丢包仍可能阻挡后续字节的交付。HTTP/3 基于 QUIC 提供不同流的独立交付，缓解跨流的传输层队头阻塞；丢失流自身的数据仍需恢复。

QPACK 为 HTTP/3 头部压缩设计了独立机制和限制，特定动态表依赖仍可能让流等待，不能说“HTTP/3 所有地方都不会阻塞”。复用、流控、拥塞与服务端并发上限也仍有成本。[标准：HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html)、[HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)、[QPACK](https://www.rfc-editor.org/rfc/rfc9204.html)。

### TLS 1.3 的密钥协商、证书和会话恢复分别负责什么？ {#tls13}

证书与签名等机制帮助验证身份，密钥协商建立会话秘密，对称加密保护记录；不能把 HTTPS 一概描述为“服务器用 RSA 私钥解密全部数据”。会话恢复可减少部分握手成本，但仍有安全和部署前提。

0-RTT 还有重放风险，不能把非幂等业务无条件放进早期数据。抓包调试与生产信任配置应分开，证书固定也要设计轮换与故障恢复。[标准：TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)。

## 客户端调度与拦截器

### OkHttp Dispatcher 的限制是否同样约束同步与异步调用？ {#dispatcher}

要看方法与版本。常见实现中 Dispatcher 管理异步待运行和运行队列，并依据总量与主机限制提升异步任务；同步 execute 会登记执行，但不能据此假设它自动受到完全相同的异步排队限额。

因此“client 设置了最大并发数”不等于应用任意同步调用都已被限流。WebSocket 等调用还可能有特殊计数规则，需直接检查使用版本的 Dispatcher。[源码：Dispatcher](https://github.com/square/okhttp/blob/master/okhttp/src/commonJvmAndroid/kotlin/okhttp3/Dispatcher.kt)。

### OkHttp 核心拦截器顺序为什么重要？ {#interceptor-chain}

典型逻辑链围绕应用拦截器、重试与后续请求、协议桥接、缓存、连接、网络拦截器和发送接收展开。响应再逐层返回，因此修改头、缓存判断、重定向与日志所在层级会影响观察结果。

<KnowledgeFlow title="一次请求的逻辑分层" :steps="[
  { title: '逻辑调用', detail: '应用拦截器观察业务意图' },
  { title: '重试 / 协议 / 缓存', detail: '准备请求，决定复用缓存或进行网络交换' },
  { title: '连接与网络', detail: '获取连接，观察实际网络请求' },
  { title: '响应返回', detail: '读取结果并沿链返回，遵守关闭责任' }
]" caption="具体实现和特殊路径需看项目版本；不要用图推导每种拦截器都恰好调用一次。" />

修改响应缓存头不是免费的本地优化，可能改变协议和隐私语义。[源码：RealCall 拦截链](https://github.com/square/okhttp/blob/master/okhttp/src/commonJvmAndroid/kotlin/okhttp3/internal/connection/RealCall.kt)。

### HTTP/2 连接复用与连接合并，是不是只看 host 一样？ {#connection-pooling}

连接是否可复用还涉及路由、地址、协议、TLS 身份与配置等；HTTP/2 在符合条件时可能让不同主机名共享连接，不能只按字符串 host 做判断。代理、证书固定或网络变化也会影响路径。

复用减少握手，但共享连接也带来流数与故障关联。不要每次请求都创建独立 client，也不要未经验证强迫所有请求固定在同一连接。[源码：RealConnection](https://github.com/square/okhttp/blob/master/okhttp/src/commonJvmAndroid/kotlin/okhttp3/internal/connection/RealConnection.kt)。

### connect/read/write/call timeout 为什么不能都叫“请求超时”？ {#timeouts}

连接超时限制相应连接过程，读写超时关注特定 I/O 等待，call timeout 约束整次调用的总预算；具体覆盖范围和特例以版本契约为准。连续慢速传输可能不断有数据，但总体时间仍很长。

UI 业务还可能有独立的体验预算。重试、重定向与鉴权刷新消耗同一用户等待窗口，不能每次重试都把总预算无限重置。[源码与契约：OkHttpClient](https://github.com/square/okhttp/blob/master/okhttp/src/commonJvmAndroid/kotlin/okhttp3/OkHttpClient.kt)。

### Authenticator 中同步等待“同池异步刷新”为什么可能死锁或饥饿？ {#authenticator}

若许多受限执行资源都在等待刷新，而刷新又排在同一资源后面，就可能无法推进；若刷新请求继续触发同一鉴权逻辑，还可能递归失败。仅用一把锁合并刷新并不能修复所有执行资源依赖。

应明确刷新使用的执行路径、避免递归、检查 token 是否已被其他请求更新，并设置重放次数与账号代次。重放请求还要检查请求体是否可再次消费。[源码与契约：Authenticator](https://github.com/square/okhttp/blob/master/okhttp/src/commonJvmAndroid/kotlin/okhttp3/Authenticator.kt)。

### 为什么 ResponseBody 需要关闭，请求体又为什么可能不可重试？ {#bodies}

响应体通常持有连接等底层资源，未消费或未正确关闭可能阻碍复用和释放。流式读取要把关闭放进明确的所有权范围，不要在日志层读完后把空流交给业务。

请求体可能是一次性来源、流或双工过程，并不一定能安全重新发送；失败后是否重试需要结合调用语义、已发送状态和业务幂等判断，不能只看发生了 IOException。[源码与契约：ResponseBody](https://github.com/square/okhttp/blob/master/okhttp/src/commonJvmAndroid/kotlin/okhttp3/ResponseBody.kt)、[RequestBody](https://github.com/square/okhttp/blob/master/okhttp/src/commonJvmAndroid/kotlin/okhttp3/RequestBody.kt)。

### EventListener 为什么比一个 totalTime 更有诊断价值？ {#events}

它把 DNS、连接、TLS、连接获取、请求响应等事件分开，帮助识别排队与网络阶段差异；复用、重试等会改变事件组合，不能机械假设每次都出现同样序列。

还需记录调用 ID、网络类型和必要版本信息，并补充解析、落库与 UI 可见时间。不要在监听中做阻塞 I/O 或输出 token 与敏感 body。[官方：事件说明](https://github.com/square/okhttp/blob/master/docs/features/events.md)。

### Wi-Fi 切到移动网络后，为什么“系统说有网”仍可能请求失败？ {#network-switch}

网络可用、具备相应能力、通过验证和目标服务器可达是不同判断；原有连接也可能绑定旧网络路径而失效。网络回调只提供环境变化线索，不能保证下一次请求成功。

正确处理失败、取消与重试，避免在每次网络变化时同时重放所有任务形成洪峰。心跳频率还要结合后台约束与耗电，不能靠高频轮询保证不断线。[官方：读取网络状态](https://developer.android.com/develop/connectivity/network-ops/reading-network-state)。

## 实验路线

用可控服务模拟慢 DNS、慢连接、慢首字节、逐块慢响应、401 和断线；分别观察事件与总预算。再验证上传体不可重放和刷新资源互相等待，解释为什么这些不是“把超时调大”就能解决。
