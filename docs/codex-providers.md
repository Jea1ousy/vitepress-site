---
title: CC Switch 与第三方 provider
description: 了解 CC Switch、第三方 provider 切换和凭据安全边界
outline: deep
---

# CC Switch 与第三方 provider

本页只讨论如何理解和安全使用第三方 provider 配置。CC Switch、其他 CCS 项目和第三方服务商都不是 OpenAI 官方产品；使用前应自行检查源码、发行页、许可证、更新记录、权限和隐私政策。

## 先区分两个“CCS”

中文语境里的“CCS”可能指两个不同项目：

1. **CC Switch**：[`farion1231/cc-switch`](https://github.com/farion1231/cc-switch) 的桌面应用，用来管理 Claude、Codex 等工具的 provider 配置。
2. **`kaitranntt/ccs`**：另一个命令行账号或配置切换器。

两者不是同一个软件。CC Switch 只从[官方仓库](https://github.com/farion1231/cc-switch)或 [GitHub Releases](https://github.com/farion1231/cc-switch/releases) 获取；不要从搜索广告、收费下载站或索要凭据的页面安装。

## CC Switch 的安全切换流程

以下流程按 CC Switch 的 Codex 官方登录保留指南整理，界面名称可能随版本变化：

1. 在 CC Switch 的 Codex 面板切换到 **OpenAI Official**，启动 Codex，并先完成自己的 ChatGPT 登录。
2. 在 Settings → General → Codex App Enhancements 中开启保留官方登录的选项，英文通常为 “Keep official login when switching third-party providers”。
3. 添加第三方 provider 时，只填入服务商要求的 endpoint、模型名和 API key；不要把 ChatGPT OAuth token 当成第三方 API key。
4. 只有 provider 使用 Chat Completions 等不直接兼容的协议时，才按 CC Switch 文档判断是否需要 Routing → Local Routing 和 Codex takeover。
5. 切换 provider、路由或模型后重启 Codex，让配置重新加载。
6. 在 CC Switch 查看 provider 和日志，在 Codex 中查看 `/status`，再用无敏感信息的小任务确认请求走向。

## 凭据和配置边界

CC Switch 指南将官方登录凭据和第三方 provider 配置分开管理：官方登录通常位于 Codex 的 `~/.codex/auth.json`，provider 配置和 key 通常位于 `~/.codex/config.toml` 的对应配置中；实际路径会因版本和操作系统变化。

无论路径如何，都不要手动复制、上传或分享 `auth.json`。它包含访问令牌，不是普通配置文件。API key、OAuth token 和代理凭据也不应提交到 Git、截图、工单或公共日志。

恢复官方 provider 时，切回 OpenAI Official，关闭不再需要的本地路由，重启 Codex，再用 `/status` 和小任务验证。第三方 API 的用量、条款和隐私政策由第三方服务商负责，不等同于 ChatGPT 官方订阅。

涉及 OAuth 反向代理的方案可能违反服务条款；不要为了“保留登录”导出或转发令牌。参考 [CC Switch 的 Codex 官方登录保留指南](https://github.com/farion1231/cc-switch/blob/main/docs/guides/codex-official-auth-preservation-guide-zh.md)。

## 如果你指的是 `kaitranntt/ccs`

这是另一个第三方项目。不要把它与 CC Switch 的配置文件、登录目录或命令混用；使用前先阅读其[项目仓库](https://github.com/kaitranntt/ccs)、许可证和 [CLI 文档](https://ccs-7e541244.mintlify.app/reference/cli-commands)，并自行评估凭据风险。

相关内容：

- [Codex 从 0 上手](./codex-from-zero)
- [Codex 日常工作流](./codex-workflow)
- [故障排查与参考](./codex-troubleshooting)
