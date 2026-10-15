---
title: 移动端网络、图片与本地存储面试题
description: 请求链路、OkHttp、Retrofit、HTTPS、HTTP 缓存、弱网重试、图片内存、Room、DataStore 与离线一致性。
---

# 08 · 网络、图片与本地存储

移动网络会断、进程会被回收、用户会快速切账号。数据题要同时回答：**正确性、时延、资源成本和恢复能力**。

## 请求与网络协议

### 一个网络请求从发出到 UI 展示，经过哪些步骤？ {#request-path}

逻辑上包括缓存检查、DNS、建立或复用连接、TLS、请求与响应、解码解析、数据更新及 UI 渲染；实际路径会因缓存命中、连接复用和协议变化而不同。

<KnowledgeFlow title="请求耗时不能只看一个 totalTime" :steps="[
  { title: '准备', detail: '排队、缓存、DNS 和连接获取' },
  { title: '传输', detail: '连接 / TLS、发送请求、等待与接收响应' },
  { title: '处理', detail: '解压、反序列化、校验并更新数据源' },
  { title: '展示', detail: '生成 UI 状态，布局绘制到用户可见' }
]" />

**追问：接口 100ms，为什么用户等了 1s？** 请求可能先排队，随后还要解析、落库、主线程调度和渲染；服务端耗时只是端到端延迟的一部分。先拆分阶段指标，再谈优化。[官方：OkHttp](https://github.com/square/okhttp)。

### OkHttp 拦截器、连接池和 Retrofit 分别负责什么？ {#okhttp}

OkHttp 负责 HTTP 调用与连接等底层能力；Retrofit 根据声明的接口和转换器把业务方法映射为 HTTP 请求及响应转换。二者不能简单当成两套互斥网络引擎。

应用拦截器适合围绕一次逻辑调用处理公共请求头或业务日志；网络拦截器更靠近实际网络交换，缓存、重定向和重试会导致它们的执行次数和观察范围不同。日志要脱敏，响应体要正确关闭，`proceed` 的使用要遵守接口约定。

**追问：每次请求新建 client 会怎样？** 可能无法有效复用线程池和连接池。合理共享 client，再按需要派生配置。[官方：拦截器](https://github.com/square/okhttp/blob/master/docs/features/interceptors.md)、[Retrofit](https://github.com/square/retrofit)。

### HTTPS 解决什么，为什么不能关闭证书校验？ {#https}

TLS 提供传输加密、完整性保护和服务器身份验证等能力；客户端需验证信任链、有效期和主机名等。TLS 1.3 的握手、会话恢复与旧协议不完全一样，不能只背一套固定“RSA 交换密钥”流程。

**信任全部证书或总是返回 true 的主机名校验，会破坏身份验证。** 抓包环境需要专门的调试信任配置；正式构建要按平台安全策略验证。证书固定还要考虑轮换、备份与故障恢复，不宜无条件推荐。

HTTPS 不会替应用完成登录授权，也不能保证设备内数据绝对安全。[标准：TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446.html)、[官方：网络安全配置](https://developer.android.com/privacy-and-security/security-config)。

### HTTP 强缓存和协商缓存，移动端怎么使用？ {#http-cache}

新鲜度足够的缓存可直接复用；需要验证时可携带 `If-None-Match` 等条件，服务端返回 304 后复用已有表示。304 不是给客户端返回一份新业务 body。

| 字段 / 指令 | 作用 | 常见误解 |
| --- | --- | --- |
| `Cache-Control: max-age` | 定义新鲜度时长 | 不是让业务数据永久正确 |
| `no-cache` | 使用前需要验证 | 不等于禁止存储 |
| `no-store` | 不应存储此次内容 | 与“每次验证”不同 |
| `ETag / If-None-Match` | 用验证器做条件请求 | 不等于业务分页游标 |

缓存必须考虑 `Vary`、认证、账号和数据敏感性。离线兜底是否接受过期数据应由业务定义，不应偷偷把所有响应都改成可缓存。[标准：HTTP 缓存](https://www.rfc-editor.org/rfc/rfc9111.html)。

### 弱网为什么不能“失败就重试三次”？ {#retry}

先分清错误：无网络、DNS、超时、TLS、服务端过载、参数错误和鉴权失败，处理不同。重试应有次数或总时长预算、退避与抖动，并尊重可用的服务端提示。

**支付或创建订单超时，不代表服务器没执行。** 需要幂等键、业务状态查询和服务端去重；客户端取消也不保证服务端回滚。HTTP 方法的幂等语义与业务实现需同时分析。

对 token 刷新，合并并发刷新、限制重复鉴权和避免死循环；账号切换时还要拒绝旧身份请求的结果。[标准：HTTP 语义与幂等性](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)。

## 图片、数据库与配置

### 图片文件只有 200KB，为什么解码会占很多内存？ {#bitmap}

压缩文件大小与解码像素内存不是一回事。对常见 ARGB_8888，粗估为 `宽 × 高 × 4` 字节；例如 4000 × 3000 大约是 45.8 MiB，还没有计入其他对象、对齐、缓存与图形资源。

按目标显示尺寸解码、使用缩略图、限制并发和缓存预算，通常比“出现 OOM 就清理所有缓存”有效。像素格式和硬件 Bitmap 会改变内存位置及使用限制，不能无条件套同一公式。

**追问：图片加载库的内存/磁盘/网络缓存解决同一个问题吗？** 不同。解码后内存缓存减少解码，磁盘缓存减少下载，HTTP 缓存遵守协议；key 还应包含尺寸、变换和必要身份维度。[官方：高效加载 Bitmap](https://developer.android.com/topic/performance/graphics/load-bitmap)。

### Room、DataStore 与 SharedPreferences 怎么选？ {#storage-choice}

| 方案 | 适合数据 | 主要考虑 |
| --- | --- | --- |
| Room / SQLite | 可查询、关联、事务化的结构化数据 | schema、索引、迁移与并发 |
| DataStore | 小规模设置或类型化配置 | 异步、一致性与实例管理 |
| SharedPreferences | 既有简单配置 | 同步读取、写入和生命周期边界 |
| 文件 / 对象存储 | 大内容、媒体、离线文件 | 原子替换、配额与清理 |

不要把大量关系数据塞进 JSON 配置，也不要把敏感 token 当作普通配置随意备份。DataStore 的具体实现要与多进程需求匹配；一个文件的实例管理需遵守其约定。[官方：Room](https://developer.android.com/training/data-storage/room)、[DataStore](https://developer.android.com/topic/libraries/architecture/datastore)。

### 数据库事务、索引与迁移分别解决什么？ {#room}

事务把一组相关变更作为一致单元执行；索引加快合适的查询，但增加存储与写入成本；迁移把旧 schema 与数据安全演进到新版本。三者不能互相替代。

**追问：建了索引为什么仍然慢？** 看查询条件、排序、选择性、返回行数与执行计划；还要检查是不是主线程等待大量结果转换。一次取出十万行并不会因为有索引就变轻。

升级应覆盖用户可能跨过的版本路径，测试迁移后数据与约束。破坏式重建会丢本地数据，只能用于明确允许丢失的缓存场景。[官方：Room 迁移](https://developer.android.com/training/data-storage/room/migrating-db-versions)。

## 一致性与离线体验

### 离线优先如何避免“网络一份，数据库一份”？ {#offline-first}

一种常见方案是：**UI 主要观察本地数据库，网络结果先事务化写入数据库，再由查询流更新 UI。** 这样首屏缓存、后台同步和界面更新使用同一读取路径。

<KnowledgeFlow title="离线优先：网络更新本地真相来源" :steps="[
  { title: '先显示本地', detail: 'UI 观察数据库，呈现已缓存内容' },
  { title: '同步远端', detail: 'Repository 拉取新数据与版本信息' },
  { title: '事务写入', detail: '合并数据、游标和必要元信息' },
  { title: '自动更新 UI', detail: '数据库查询发出新值，界面刷新' }
]" />

离线写操作还要维护待同步队列、冲突处理与业务版本。最近写入获胜只是某些业务的策略，不适合直接套在库存、余额等强约束数据上。[官方：离线优先](https://developer.android.com/topic/architecture/data-layer/offline-first)。

### 缓存和离线任务在多账号切换时如何隔离？ {#account-isolation}

缓存 key、数据库记录、任务输入与结果验收都要关联正确账号，必要时再加租户或会话版本。旧请求在切换后返回，不能写入当前用户的界面或存储范围。

注销时要取消相关任务，清除或隔离凭据与敏感缓存，并考虑备份恢复、文件分享和通知残留。清除界面列表不代表所有数据已清理。

**追问：每个账号一个数据库就足够了吗？** 还要处理连接、在途任务、公共缓存与恢复路径，建立完整的隔离边界。[官方：安全建议](https://developer.android.com/privacy-and-security/security-tips)。

## 面试前自测

设计一次“弱网提交收藏 → 客户端超时 → 服务器已成功 → 应用重启”的恢复过程。分别说明幂等键、本地状态、同步队列和 UI 提示应如何变化。
