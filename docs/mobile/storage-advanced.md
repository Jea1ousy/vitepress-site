---
title: SQLite、Room、离线同步与文件可靠性进阶
description: WAL、事务隔离、索引、查询计划、游标分页、Room 失效通知、迁移、DataStore、Outbox、原子文件和备份。
---

# 22 · 数据库、离线同步与文件可靠性

数据落到磁盘不等于一切可靠；还要解释并发读写、升级路径、同步冲突与账号边界。这里从 SQLite 执行机制一路连接到完整离线协议。

## SQLite 与查询

### WAL 与传统回滚日志有什么区别，为什么 WAL 文件会变大？ {#wal}

WAL 把相应修改写入预写日志，读者可以基于合适的快照读取，之后通过 checkpoint 等过程把内容协调回数据库。它改善特定读写并发，但不意味着支持任意多个写事务同时提交。

长时间持有的读取、checkpoint 时机与业务写入量等会影响日志增长。不要在不了解连接和事务状态时直接删除 WAL 文件；分析需同时考虑数据库、日志与共享状态文件。[官方：SQLite WAL](https://www.sqlite.org/wal.html)。

### SQLite 的事务隔离与“主线程加一把锁”有什么区别？ {#transactions}

事务隔离由数据库与连接行为提供，围绕读写可见性和提交组织；内存锁只能协调遵守该锁的访问者，不会自动覆盖其他连接或进程。WAL 下的快照读取也不能简单理解为随时看到最新提交。

事务尽量短，别持着写事务等待网络。重试 BUSY 等问题前要理解事务边界，否则可能重复整个业务副作用。[官方：SQLite 隔离](https://www.sqlite.org/isolation.html)。

### 联合索引为什么要关注列顺序、范围条件和排序？ {#composite-index}

索引按特定键顺序组织，查询能否有效利用与过滤条件、相等/范围条件、排序方向、选择性和优化器决策有关。不能仅看“where 中出现索引列”就断言已加速。

例如按账号与时间读取列表，可评估 `(accountId, createdAt, id)`，并用 id 处理相同时间戳。写入和更新会维护索引，过多索引增加写放大与存储。[官方：SQLite 查询规划](https://www.sqlite.org/queryplanner.html)。

### EXPLAIN QUERY PLAN 能证明查询在真实设备上很快吗？ {#query-plan}

它帮助判断扫描、索引使用及临时排序等计划信息，但计划不是完整耗时画像。数据分布、页缓存、返回行数、反序列化和调用线程也影响端到端体验。

先用计划检查预期，再在合理数据量下测量；避免只在十条测试数据上验证十万行场景。计划输出格式也不是供应用长期依赖的稳定业务协议。[官方：EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html)。

### OFFSET 分页为什么越翻越慢，keyset 分页怎样处理重复时间？ {#keyset}

大 OFFSET 可能要求跳过越来越多结果；keyset 根据稳定排序键继续取下一段，避免总是从起点跳过。排序键必须能提供确定顺序，常把时间与唯一 ID 组合。

```sql
SELECT * FROM message
WHERE account_id = :accountId
  AND (created_at < :time
       OR (created_at = :time AND id < :id))
ORDER BY created_at DESC, id DESC
LIMIT :pageSize;
```

查询需匹配适当索引，并明确新插入、删除和刷新时的边界。keyset 不天然支持任意跳到第 N 页。[官方：SQLite 行值与分页](https://www.sqlite.org/rowvalue.html)。

## Room 与配置存储

### Room 的关系查询为什么可能需要事务，怎样避免 N+1？ {#relations}

对象关系可能涉及多条 SQL，使用适当事务可让这组读取在期望的一致视图内完成。N+1 则是先读列表，再为每项各读一次附属数据，带来大量调用与处理成本。

根据需求选择 JOIN、批量查询或合适关系映射，并限制返回规模；“使用 ORM”不会自动选择最低成本方案。复杂关系还要验证索引与空结果行为。[官方：Room 关系](https://developer.android.com/training/data-storage/room/relationships)。

### Room Flow 的失效通知是不是只精确通知变化的那一行？ {#room-invalidation}

可观察查询会在相关表失效时重新运行，不能把它当作每次只发一个变化行的差异流。重跑查询、构造对象和 UI 合并都是成本，即使最终展示值相同也可能发生上游工作。

可按语义使用去重、缩小观察范围与结果规模，但不能靠 `distinctUntilChanged` 消除数据库端所有成本；还要检查后台是否存在无意义高频写入。[官方：Room 异步查询](https://developer.android.com/training/data-storage/room/async-queries)。

### 自动迁移、手写迁移与破坏式重建怎样选择？ {#migration-strategy}

自动迁移适合工具能明确推导的 schema 变化；复杂数据转换或歧义需要开发者说明或手写。破坏式重建会丢失本地数据，只能用于明确可放弃的数据或经过业务授权的路径。

测试不仅要验证“能打开”，还要覆盖历史用户可能跨越的版本、数据值、约束、索引与默认值。导出的 schema 和对应迁移测试有助于复核。[官方：Room 迁移](https://developer.android.com/training/data-storage/room/migrating-db-versions)。

### DataStore 的 `updateData` 与“读取后另写一次”为什么不同？ {#datastore-update}

在 API 约定范围内，updateData 把读改写协调为事务式更新；手动先读再写，在并发更新下可能覆盖别人的变化。更新函数应围绕状态转换，不把长时间网络副作用隐藏在配置修改里。

还要遵守每个文件的实例与多进程实现要求；普通实现和多进程支持不能混用假设。DataStore 适合小规模数据，不替代关系查询和海量日志存储。[官方：DataStore](https://developer.android.com/topic/libraries/architecture/datastore)。

## 离线协议与磁盘边界

### Outbox 和 tombstone 如何帮助离线写入恢复？ {#outbox}

Outbox 把业务变更与待同步记录按一致性需求一起持久化，后台执行者据此提交、确认和重试；tombstone 保留删除事实，避免离线旧副本再次把数据“复活”。

<KnowledgeFlow title="离线写入不能只改变界面" :steps="[
  { title: '本地事务', detail: '更新业务记录与待同步操作' },
  { title: '后台提交', detail: '携带操作 ID 与必要版本，控制重试预算' },
  { title: '远端确认', detail: '按协议幂等、合并冲突或返回拒绝' },
  { title: '本地收敛', detail: '记录确认版本，更新状态并清理安全记录' }
]" />

最后写入获胜不是万能策略，设备时钟也不等于可靠全局顺序。版本条件、去重与保留多久必须由服务端协议共同定义。[官方：离线优先数据层](https://developer.android.com/topic/architecture/data-layer/offline-first)。

### 临时文件加 rename 就能保证所有断电场景安全吗？ {#atomic-file}

原子替换帮助避免读到一半的新文件，但原子可见性与持久落盘不是同一个保证；文件系统、写入同步、目录元数据和平台 API 都会影响断电后的状态。

Android 的 AtomicFile 可协助组织相应写入与恢复流程，仍需遵循其开始、完成和失败 API，并自行协调并发访问。大文件校验、磁盘不足和旧文件清理也不应省略。[官方：AtomicFile](https://developer.android.com/reference/android/util/AtomicFile)。

### 备份恢复、分区存储和 URI 授权为什么要进入数据设计？ {#backup-storage}

备份可能让旧数据在新设备恢复，凭据、设备密钥和账号状态却不一定一致；应定义包含与排除规则，并处理解密失败与重新登录。不能把“卸载后没数据”当作永远成立的假设。

共享媒体、应用私有文件与通过系统文件选择器取得的 URI 还有不同访问与授权寿命。存储路径字符串不等于永久访问能力，恢复后需要重新验证。[官方：Auto Backup](https://developer.android.com/identity/data/autobackup)、[存储访问框架](https://developer.android.com/training/data-storage/shared/documents-files)。

## 实验路线

准备多版本数据库与十万行数据，比较 OFFSET 和 keyset。再模拟“本地已提交、网络已成功、确认未写回、进程死亡”，验证 Outbox 重试是否造成重复业务结果。
