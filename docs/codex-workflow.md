---
title: Codex 日常工作流
description: 使用计划、目标、AGENTS.md、Skill 和安全检查点组织 Codex 任务
outline: deep
---

# Codex 日常工作流

安装并登录后，任务质量主要取决于上下文、权限边界和验证方式。下面的做法适用于桌面应用和 CLI；具体命令会随版本和入口略有差异，先在 Codex 中输入 `/` 查看当前菜单。

## 计划与目标

### `/plan`：拆解当前任务

任务跨多个目录、包含多个步骤或验收标准不清楚时使用 `/plan`。它解决的是“这一次任务如何做”：先拆解问题、指出风险和需要确认的假设，计划确认后再执行。

### `/goal`：保存长期完成条件

任务会持续数小时或跨多次交互时使用 `/goal`，写清长期目标和完成条件。它解决的是“任务最终要达到什么状态”，可以和 `/plan` 组合：先用 `/plan` 设计路径，再用 `/goal` 保持完成条件。

参考[官方长任务指南](https://learn.chatgpt.com/docs/long-running-work)。

## 常用斜杠命令

| 命令 | 用途 |
| --- | --- |
| `/status` | 查看工作区、模型、权限和会话状态 |
| `/permissions` | 查看或调整当前会话的审批边界 |
| `/model` | 查看或选择当前可用模型 |
| `/reasoning` | 调整推理强度（若当前入口支持） |
| `/review` | 对当前改动做代码审查 |
| `/compact` | 压缩长对话上下文 |
| `/init` | 生成或初始化项目说明文件 |
| `/mcp` | 查看 MCP 状态（若配置了 MCP） |
| `/cloud`、`/local` | 在支持的入口中切换云端与本地任务 |

CLI 非交互执行适合脚本和 `tmux`：

```bash
codex exec --cd ~/your-project \
  --sandbox workspace-write \
  --ask-for-approval on-request \
  "运行测试，修复失败项，并说明每项改动的原因"
```

上次任务没有结束时可以使用 `codex exec resume --last` 恢复。无人值守时优先使用 `workspace-write` 和 `on-request`；绕过审批或沙箱的选项只应在隔离环境中使用。更多参数见 [CLI developer commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli)。

## `AGENTS.md`：项目长期规则

Codex 开始工作前会读取适用的 `AGENTS.md`。规则通常按“全局目录 → Git 根目录 → 当前子目录”逐层合并；靠近当前工作目录的规则可以补充或覆盖上层规则，也可以使用同级 `AGENTS.override.md` 做临时覆盖。

项目规则建议至少包含：

| 部分 | 应说明的内容 |
| --- | --- |
| 开始前 | 需要阅读的文档、检查工作区状态、不可覆盖的用户改动 |
| 验证 | 测试、lint、构建和提交前的检查命令 |
| 边界 | `.env`、生产密钥、生成目录、迁移文件等不可随意修改的内容 |
| 输出 | 最终需要报告的文件、命令、结果和未完成项 |

详细的发现和合并规则见 [`AGENTS.md` 官方说明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

## Skill：可复用的工作流

Skill 是带有 `SKILL.md` 的可复用能力包，可以附带脚本、参考资料和模板。适合把发布前检查、接口文档生成或安全扫描等流程固化，避免每次重复粘贴长提示词。

使用 Skill 前应确认：

1. `SKILL.md` 的名称、用途和触发方式清楚；
2. 附带的脚本、依赖和外部访问范围可审查；
3. 放置目录符合当前 Codex 安装渠道的发现规则；
4. 只授予任务需要的权限，不把 Skill 当成任意代码执行器。

在支持的入口中可以用 `$skill-name` 或从 Skill 菜单选择。不同发行版的发现路径可能不同，详细说明见[官方 Skill 指南](https://learn.chatgpt.com/docs/build-skills)。

`AGENTS.md`、Skill 和 MCP 的职责不同：`AGENTS.md` 是项目规则，Skill 是可复用工作流，MCP 是连接外部数据或工具的协议入口。三者都应按最小权限配置。

## 一套安全的执行顺序

1. 开始前运行 `git status`，确认工作区现状；必要时先提交检查点。
2. 先让 Codex 解释计划、依赖和风险，再允许修改文件。
3. 使用工作区写入和按需审批，拒绝不理解的高风险命令。
4. 遇到删除、数据库迁移、生产操作或敏感文件时，先要求说明并确认范围。
5. 每个阶段运行相关测试并检查 `git diff`。
6. 最终确认改动文件、命令、测试结果和未完成项，再决定是否提交。

下一步：

- [从 0 上手](./codex-from-zero)
- [代理、SSH 与 tmux](./codex-remote)
- [故障排查与参考](./codex-troubleshooting)
