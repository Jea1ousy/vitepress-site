---
title: Codex 从 0 上手
description: 从安装、登录到第一次在项目中使用 Codex 的快速入门
outline: deep
---

# Codex 从 0 上手

这组文档面向第一次使用 Codex 的开发者，先完成本地安装和登录，再按需阅读工作流、远程使用、第三方 provider 与故障排查。版本、模型、套餐、限额和第三方软件界面会变化；涉及价格、权限和安装包时，请以链接到的官方页面为准。

## 阅读路线

- 本文：安装、登录与首次任务
- [日常工作流：计划、AGENTS.md 与 Skill](./codex-workflow)
- [代理、SSH 与 tmux](./codex-remote)
- [CC Switch 与第三方 provider](./codex-providers)
- [故障排查与参考资料](./codex-troubleshooting)

## 1. 先了解 Codex 的使用入口

Codex 可以读取代码、修改文件、运行命令并协助完成软件工程任务。常见入口有：

- **桌面应用**：适合在本机选择项目目录、查看差异、审批命令和管理长任务。
- **CLI**：适合终端、服务器、SSH 和 `tmux`；交互模式使用 `codex`，脚本或自动化使用 `codex exec`。
- **IDE 集成**：适合在编辑器里查看代码并发起任务。
- **云端任务**：适合把工作交给云端环境；本地任务与云端任务的文件、权限和网络边界不同。

第一次使用建议从本地项目开始：先让 Codex 解释和检查，再允许它修改；每个阶段都用 Git 保存可回退的检查点。

## 2. 使用前检查

### 账户和计费方式

Codex 可以通过 ChatGPT 登录，也可以通过 API key 登录，两种方式对应不同的权限和计费：

- **ChatGPT 登录**：使用 ChatGPT 账户对应的 Codex 权限和套餐限额。
- **API key 登录**：按 API 项目用量和 API 定价计费；部分云端或账户功能可能不可用。

套餐是否包含 Codex、可用模型、并发和使用限额会随套餐和时间变化，请查看 [ChatGPT 套餐页面](https://chatgpt.com/pricing) 与 [Codex 使用说明](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)。

### 本机或服务器

建议准备：

1. 对项目目录有读写权限。
2. Git。
3. 使用 npm 安装时，准备受支持的 Node.js 与 npm；也可以使用官方独立安装方式。
4. 远程长期运行时安装 `tmux`。
5. 能通过 HTTPS 访问登录和包下载所需的站点。网络受限时，只使用你有权使用的公司代理、VPN 或本地代理客户端。

可以先检查：

```bash
git --version
node --version
npm --version
curl -I https://chatgpt.com
```

登录失败或下载超时时，同时检查系统时间、DNS、防火墙和出口网络。

### 最小权限原则

让 Codex 工作在专用项目目录中，先提交 Git，再逐步扩大权限。优先使用工作区写入和按需审批；除非是在隔离的临时 runner 中，否则不要使用绕过审批或沙箱的选项。

## 3. 安装 Codex

### 桌面应用

从 [ChatGPT 下载页](https://chatgpt.com/download) 安装桌面应用，或从 [Codex Get Started](https://chatgpt.com/codex/get-started/) 进入 Codex。首次打开后登录 ChatGPT，选择项目目录即可开始。

### macOS/Linux 独立安装

官方 CLI 页面提供独立安装脚本：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex --version
```

如果组织不允许直接执行远程脚本，先下载并检查脚本来源和内容，再在本机执行。安装方式以 [Codex CLI 官方文档](https://learn.chatgpt.com/docs/codex/cli) 为准。

### npm 安装

```bash
npm install -g @openai/codex
codex --version
```

升级可以使用 `npm update -g @openai/codex`；如果当前版本支持，也可以使用 `codex --upgrade`。

如果提示 `codex: command not found`，检查全局 npm bin 是否在 `PATH` 中：

```bash
npm prefix -g
which codex
```

Windows PowerShell 可用 `Get-Command codex`。如果出现 `Unexpected token '.'` 或类似语法错误，通常是 Node.js 太旧，应先升级到受支持的 Node.js LTS。

## 4. 登录

### ChatGPT 登录

```bash
codex login
codex login status
```

浏览器打开后选择 **Sign in with ChatGPT**。远程服务器没有图形界面时，按 CLI 提示在有浏览器的机器完成授权；无法完成浏览器授权时，再考虑 API key 登录。

### API key 登录

API key 按用量计费。按 CLI 提示将 key 通过标准输入传入，并在完成一次性登录后清理环境变量；不要把 key 写进 Git、截图、工单或公开的 shell 历史。

更完整的认证差异见 [官方认证文档](https://learn.chatgpt.com/docs/auth)。API key 可在 [OpenAI API keys](https://platform.openai.com/api-keys) 管理，价格见 [API pricing](https://platform.openai.com/pricing)。

## 5. 第一次在项目中使用

进入项目并先创建检查点：

```bash
cd ~/your-project
git status
git add -A && git commit -m "checkpoint before codex"
codex
```

给任务时明确说明目标、约束和验收标准，至少要求 Codex：

- 先解释计划和可能的风险，再开始修改；
- 保持现有代码风格，不引入未批准的依赖；
- 运行相关测试、lint 或构建，并说明结果；
- 最后列出修改文件、执行过的命令和未完成项。

修改后先检查 `git diff` 和 `git status`，确认无误再提交。也可以在项目根目录运行 `/init`，生成或初始化 `AGENTS.md`，把构建、测试、代码风格和不可修改的边界写入项目规则。

## 下一步

- 想把任务拆得更清楚：阅读[日常工作流](./codex-workflow)。
- 想在服务器或断线环境运行：阅读[代理、SSH 与 tmux](./codex-remote)。
- 想切换第三方 provider：先阅读[CC Switch 与第三方 provider](./codex-providers)中的安全说明。
- 遇到安装、登录或远程问题：查看[故障排查与参考](./codex-troubleshooting)。
