---
title: Codex 故障排查与参考
description: 安装、登录、网络、provider 和远程使用的常见问题
outline: deep
---

# Codex 故障排查与参考

先确认问题发生在哪一层：安装、登录、网络、provider、项目权限，还是远程终端。每次只改变一个变量，并保留 `git status`、命令输出和相关日志，方便定位。

## 常见问题

| 现象 | 优先检查 |
| --- | --- |
| `codex: command not found` | 安装是否成功、全局 npm bin 是否在 `PATH`；重开终端后运行 `codex --version`，或改用官方独立安装方式。 |
| `Unexpected token '.'` 等语法错误 | Node.js 版本过旧；升级到受支持的 Node.js LTS 后再安装。 |
| 浏览器登录打不开或超时 | 用 `curl -I https://chatgpt.com` 检查 DNS、系统时间、出口和代理；远程环境完成本机浏览器授权，或改用 API key。不要复制 `auth.json`。 |
| CLI 能用，桌面应用不能用 | 桌面应用可能没有继承 shell 的代理变量，或使用了不同的账户、工作区和权限；检查应用自己的网络设置与 `/status`。 |
| CC Switch 切换后模型消失或请求失败 | 检查 provider 的协议类型和 endpoint；Chat Completions provider 可能需要 Local Routing。切换路由或模型后重启 Codex，并查看日志与 `/status`。 |
| tmux 会话找不到 | 确认使用的是同一个 Linux 用户并运行 `tmux ls`；root 和普通用户的会话彼此不可见。 |

## 排查顺序

1. 运行 `codex --version`，确认安装和 Node.js 基础环境。
2. 运行 `codex login status`，确认登录账户和认证状态。
3. 用 `curl -I https://chatgpt.com` 检查网络，再检查代理变量或应用代理设置。
4. 在 Codex 中运行 `/status`，确认项目目录、模型、权限和 provider。
5. 用不包含密钥和业务数据的小任务复现，最后再检查 `git diff` 和日志。

## 官方资料

- [Codex CLI](https://learn.chatgpt.com/docs/codex/cli)
- [认证方式](https://learn.chatgpt.com/docs/auth)
- [Codex 与 ChatGPT 套餐](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)
- [长时间运行的工作](https://learn.chatgpt.com/docs/long-running-work)
- [斜杠命令](https://learn.chatgpt.com/docs/reference/slash-commands)
- [`AGENTS.md`](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [构建 Skill](https://learn.chatgpt.com/docs/build-skills)
- [CLI 命令参考](https://learn.chatgpt.com/docs/developer-commands?surface=cli)
- [高级配置](https://learn.chatgpt.com/docs/config-file/config-advanced)
- [环境变量](https://learn.chatgpt.com/docs/config-file/environment-variables)
- [SSH 远程连接](https://learn.chatgpt.com/docs/remote-connections)
- [ChatGPT 套餐](https://chatgpt.com/pricing) · [API pricing](https://platform.openai.com/pricing) · [API keys](https://platform.openai.com/api-keys)

## 第三方资料

- [CC Switch 源码](https://github.com/farion1231/cc-switch) · [Releases](https://github.com/farion1231/cc-switch/releases) · [Codex 官方登录保留指南](https://github.com/farion1231/cc-switch/blob/main/docs/guides/codex-official-auth-preservation-guide-zh.md)
- [另一种 CCS：kaitranntt/ccs](https://github.com/kaitranntt/ccs) · [CLI 文档](https://ccs-7e541244.mintlify.app/reference/cli-commands)
- [tmux Wiki](https://github.com/tmux/tmux/wiki)

第三方 provider、CC Switch 和 CCS 不属于 OpenAI 官方产品。不要把 API key、OAuth token、代理凭据或 `auth.json` 交给不可信软件。

返回：[Codex 从 0 上手](./codex-from-zero)
