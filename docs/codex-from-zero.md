---
title: Codex 从 0 上手
description: 从安装、登录和订阅，到代理、CCS、Skill、SSH 与 tmux 的 Codex 实战教程
outline: deep
---

# Codex 从 0 上手

> 本文是一篇可以直接放进 VitePress `docs/` 目录的教程。示例以 Linux/macOS shell 为主；Windows 用户可以使用 PowerShell、WSL，或把命令中的路径改成 Windows 路径。
>
> 文档更新时间：2026-08-01。Codex 的版本、模型、套餐、限额和第三方软件界面会变化；涉及价格、权限和安装包时，请以链接到的页面为准。

## 1. 先理解 Codex 的几种使用方式

Codex 是一个可以读取代码、修改文件、运行命令并协助完成软件工程任务的编码代理。常见入口有：

- **桌面应用**：适合在本机选择项目目录、查看差异、审批命令和管理长任务。
- **CLI**：适合终端、服务器、SSH 和 `tmux`。交互模式使用 `codex`，脚本或自动化使用 `codex exec`。
- **IDE 集成**：适合在编辑器里边看代码边发起任务。
- **云端任务**：适合把工作交给云端环境；本地任务与云端任务的文件、权限和网络边界不同。

第一次使用建议从本地项目开始：先让 Codex 解释和检查，再允许它修改；每个阶段都用 Git 保存一个可回退的检查点。

## 2. 使用前的条件检查

### 2.1 账户和计费方式

Codex 可以通过 ChatGPT 登录，也可以通过 API key 登录。两种方式不是同一种计费：

- **ChatGPT 登录**：使用 ChatGPT 账户对应的 Codex 权限和套餐限额。
- **API key 登录**：按 API 项目用量和 API 定价计费；某些云端或账户功能可能不可用。

套餐是否包含 Codex、可用模型、并发和使用限额会随套餐和时间变化。请查看 [ChatGPT 套餐页面](https://chatgpt.com/pricing)、[Codex 使用说明](https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan)，不要把教程中的旧价格或旧限额当成当前承诺。

### 2.2 本机或服务器

建议准备：

1. 能正常访问项目目录，并有读写权限。
2. Git（强烈建议）。
3. 使用 npm 安装时，需要较新的 Node.js 与 npm；也可以使用官方独立安装脚本，减少对 Node 的依赖。
4. 远程长期运行时安装 `tmux`。
5. 能通过 HTTPS 访问登录和包下载所需的站点。如果网络受限，先配置一个你有权使用的公司代理、VPN 或本地代理客户端；本文不提供任何机场订阅。

先检查环境：

```bash
git --version
node --version       # 使用 npm 安装时检查
npm --version        # 使用 npm 安装时检查
curl -I https://chatgpt.com
```

服务器上还可以检查时间和 DNS。登录失败、下载超时，不一定是 Codex 本身故障，常见原因是系统时间、DNS、防火墙或出口网络。

### 2.3 最小权限原则

让 Codex 工作在一个专用项目目录中，先提交 Git，再逐步扩大权限。默认使用工作区写入和按需审批；除非是在隔离的临时 runner 中，否则不要使用会绕过审批和沙箱的选项。

## 3. 安装 Codex

### 3.1 桌面应用

从 [ChatGPT 下载页](https://chatgpt.com/download) 安装桌面应用，或从 [Codex Get Started](https://chatgpt.com/codex/get-started/) 进入 Codex。首次打开后登录 ChatGPT，选择一个项目目录即可开始。

### 3.2 macOS/Linux 独立安装（推荐先试）

官方 CLI 页面提供独立安装脚本：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
codex --version
codex --help
```

如果你所在组织不允许直接执行远程脚本，可以先下载脚本、检查来源和内容，再在本机执行。脚本和安装方式以 [Codex CLI 官方文档](https://learn.chatgpt.com/docs/codex/cli) 为准。

### 3.3 npm 安装（跨平台兼容方案）

使用 npm 的官方包：

```bash
npm install -g @openai/codex
codex --version
```

升级：

```bash
npm update -g @openai/codex
# 某些版本也支持：
codex --upgrade
```

如果终端提示 `codex: command not found`，检查全局 npm bin 是否在 `PATH` 中：

```bash
npm prefix -g
which codex       # Windows PowerShell 可用：Get-Command codex
```

如果出现 `Unexpected token '.'`、`module.enableCompileCache?.()` 等语法错误，通常是 Node.js 太旧，无法解析当前 CLI 使用的语法。升级到受支持的 Node.js LTS，或改用上面的独立安装方式；不要只重装 Codex 而继续使用旧 Node。

### 3.4 登录与登出

交互式登录：

```bash
codex login
codex login status
```

浏览器打开后选择 **Sign in with ChatGPT**。远程服务器没有图形界面时，按 CLI 提示在有浏览器的机器完成授权；如果无法完成浏览器授权，可以改用 API key 登录。

API key 登录（按用量计费）：

```bash
export OPENAI_API_KEY='sk-...'
printenv OPENAI_API_KEY | codex login --with-api-key
codex login status
```

PowerShell：

```powershell
$env:OPENAI_API_KEY = "sk-..."
$env:OPENAI_API_KEY | codex login --with-api-key
```

不要把 key 写进 Git、截图、工单或公开的 shell 历史。完成一次性登录后，可以清理环境变量：

```bash
unset OPENAI_API_KEY
codex logout
```

更完整的认证差异见 [官方认证文档](https://learn.chatgpt.com/docs/auth)。API key 可在 [OpenAI API keys](https://platform.openai.com/api-keys) 管理；API 价格见 [API pricing](https://platform.openai.com/pricing)。

## 4. 第一次在项目中使用

```bash
cd ~/your-project
git status
git add -A && git commit -m "checkpoint before codex"
codex
```

第一次任务不要只说“帮我改好”。给出目标、约束和验收标准：

```text
目标：为这个项目增加一个 /health 接口。
约束：保持现有 API 风格，不引入新的运行时依赖。
验收：补充单元测试；运行现有测试和 lint；最后列出改动文件、命令和结果。
```

让 Codex 先说明计划，再开始修改。检查差异和测试结果后再提交：

```bash
git diff
git status
git add -A && git commit -m "feat: add health endpoint"
```

在项目根目录运行 `/init`，可以让 Codex 生成或初始化 `AGENTS.md`。把构建、测试、代码风格、目录约定和“不要修改”的边界写进去，后续任务会更稳定。

## 5. 目标模式、计划模式和常用命令

### 5.1 `/plan`：计划模式

当任务有多个步骤、跨多个目录或验收标准不清楚时输入：

```text
/plan
```

让 Codex 先拆解问题、指出风险和需要确认的假设。计划确认后再执行。计划模式解决的是“这一次任务如何做”。

### 5.2 `/goal`：目标模式

目标模式适合持续数小时或跨多次交互的工作：

```text
/goal
```

然后写清楚长期目标和完成条件，例如：

```text
把旧版 Vue 页面迁移到当前组件库。
完成条件：所有路由可打开、测试通过、无新增 lint 错误，并在最终消息列出未完成项。
```

`/goal` 解决的是“任务最终要达到什么状态”，可以与 `/plan` 一起使用：先用 `/plan` 设计路径，再用 `/goal` 保持长期完成条件。参考 [官方长任务指南](https://learn.chatgpt.com/docs/long-running-work)。

### 5.3 交互模式的常用斜杠命令

不同版本和入口可能略有差异，可在 Codex 中输入 `/` 查看菜单。常用命令包括：

| 命令 | 用途 |
| --- | --- |
| `/status` | 查看当前工作区、模型、权限和会话状态 |
| `/permissions` | 查看或调整当前会话的审批边界 |
| `/model` | 查看或选择当前可用模型 |
| `/reasoning` | 调整推理强度（若当前入口支持） |
| `/review` | 对当前改动做代码审查 |
| `/compact` | 压缩长对话上下文 |
| `/init` | 生成或初始化项目说明文件 |
| `/mcp` | 查看 MCP 状态（若配置了 MCP） |
| `/cloud`、`/local` | 在支持的入口中切换云端/本地任务 |

CLI 非交互执行适合脚本和 `tmux`：

```bash
codex exec --cd ~/your-project \
  --sandbox workspace-write \
  --ask-for-approval on-request \
  "运行测试，修复失败项，并说明每项改动的原因"
```

上次任务没有结束时可以恢复：

```bash
codex exec resume --last
```

无人值守时优先使用 `workspace-write` 和 `on-request`。`--yolo` 或绕过审批/沙箱的选项会显著增加误删文件、泄露密钥和执行危险命令的风险，只应在隔离环境中使用。更多参数见 [CLI developer commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli)。

## 6. `AGENTS.md` 与 Skill

### 6.1 `AGENTS.md`：项目的长期规则

Codex 开始工作前会读取适用的 `AGENTS.md`。规则通常按“全局目录 → Git 根目录 → 当前子目录”逐层合并；更近的目录可以补充或覆盖更上层规则。还可以使用同级的 `AGENTS.override.md` 做临时覆盖。

一个实用的项目文件：

```markdown
# AGENTS.md

## 开始前
- 先阅读 README 和 package.json。
- 修改前运行 git status；不要覆盖用户未提交的改动。

## 验证
- 提交前运行 npm test 和 npm run lint。
- 任何行为变化都要补测试。

## 边界
- 不要修改 .env、生产密钥和生成目录。
- 不要删除迁移文件；如需变更先解释原因。
```

详细的发现和合并规则见 [AGENTS.md 官方说明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

### 6.2 Skill：可复用的工作流

Skill 是带有 `SKILL.md` 的可复用能力包，可以附带脚本、参考资料和模板。它适合把“发布前检查”“生成接口文档”“跑一套安全扫描”这类流程固化，而不是把长提示词每次重新粘贴。

一个最小 Skill 示例（目录名可以自定义）：

```text
release-check/
└── SKILL.md
```

```markdown
---
name: release-check
description: 发布前检查测试、构建产物和敏感文件
---

# Release check

1. 阅读仓库 README 和发布脚本。
2. 运行项目规定的测试、lint 和 build 命令。
3. 检查 git diff、未跟踪文件和可能被误提交的密钥文件。
4. 输出通过/失败、命令、关键日志和剩余风险；不要自动发布。
```

将 Skill 放到当前安装渠道使用的 skills 目录，重启 Codex，在支持的入口中用 `$release-check` 或从 Skill/斜杠菜单选择它。不同发行版的发现路径可能不同；不要把 Skill 当成任意代码执行器，先阅读其中的脚本和依赖。[官方 Skill 指南](https://learn.chatgpt.com/docs/build-skills) 说明了 `SKILL.md`、渐进式披露和资源目录的组织方式。

不再需要某个 Skill 时，可以在 `~/.codex/config.toml` 中禁用它：

```toml
[[skills.config]]
path = "/path/to/skill/SKILL.md"
enabled = false
```

修改配置后重启 Codex。Skill、`AGENTS.md`、MCP 的作用不同：`AGENTS.md` 是项目规则，Skill 是可复用工作流，MCP 是连接外部数据或工具的协议入口；三者都应按最小权限配置。

## 7. 用 CCS/CC Switch 切换第三方订阅

### 7.1 先澄清“CCS”指什么

中文语境里“CCS”可能指两种不同项目：

1. **CC Switch（推荐按本节理解）**：`farion1231/cc-switch` 的桌面应用，用来管理 Claude、Codex 等工具的 provider 配置。
2. **`kaitranntt/ccs`**：另一个命令行账号/配置切换器。

两者不是同一个软件。只从 [CC Switch 官方仓库](https://github.com/farion1231/cc-switch) 或 [GitHub Releases](https://github.com/farion1231/cc-switch/releases) 下载；发行页也提醒要警惕冒充软件、收费下载和索要凭据的站点。

### 7.2 CC Switch 桌面版的安全流程

以下流程按 CC Switch 的 Codex 官方登录保留指南整理，界面名称可能随版本改变：

1. **先完成 Codex 官方登录**：在 CC Switch 的 Codex 面板切换到 OpenAI Official，启动 Codex，用自己的 ChatGPT 账户完成登录。
2. **打开官方登录保留**：在 CC Switch 的 Settings → General → Codex App Enhancements 中开启 “Keep official login when switching third-party providers”（中文界面名称可能不同）。
3. **添加第三方 provider**：在 Codex 面板用预设或 Custom provider 填入服务商要求的 endpoint、模型名和 API key。不要把 ChatGPT OAuth token 当成第三方 API key。
4. **判断是否需要本地路由**：直接兼容 OpenAI Responses API 的 provider 通常不需要；只有 Chat Completions 等协议时，按 CC Switch 的 Routing → Local Routing 启动本地转换服务并开启 Codex takeover。
5. **重启 Codex**：切换 provider、路由或模型目录后重启 Codex，让配置重新加载。
6. **验证**：在 CC Switch 查看当前 provider 和日志，在 Codex 中看 `/status`，再用一个无敏感信息的小任务确认请求确实走到了预期服务商。

CC Switch 的指南描述了这样的分工：官方登录凭据保存在 Codex 的 `~/.codex/auth.json`，第三方 provider 配置和 key 在 `~/.codex/config.toml` 的 provider 配置中。不同版本或操作系统路径可能不同，**不要手动复制、上传或分享 `auth.json`**。它包含访问令牌，不是普通配置文件。

恢复官方 provider：切换回 OpenAI Official，关闭不再需要的本地路由，重启 Codex，再用 `/status` 和小任务验证。不要把第三方 provider 与官方 ChatGPT 订阅混为一谈：第三方 API 的用量、条款和隐私政策由第三方服务商负责。

CC Switch 官方中文指南：[Codex 官方登录保留指南](https://github.com/farion1231/cc-switch/blob/main/docs/guides/codex-official-auth-preservation-guide-zh.md)。涉及 OAuth 反向代理的方案可能违反服务条款；不要为了“保留登录”去导出或转发令牌。

### 7.3 如果你说的是命令行 `kaitranntt/ccs`

这是另一个第三方项目，先阅读其源码、许可证和安全说明：

```bash
npm install -g @kaitranntt/ccs
ccs codex
ccs codex --accounts
ccs codex --use <account-name>
```

命令以 [项目仓库](https://github.com/kaitranntt/ccs) 和 [CLI 文档](https://ccs-7e541244.mintlify.app/reference/cli-commands) 为准。不要把两个项目的配置文件、登录目录或命令混用。

## 8. 代理与网络前置条件（不包含机场订阅）

Codex 的安装、登录、模型请求和第三方 provider 都需要出站网络。你可以使用已有的公司 HTTP(S) 代理、VPN 或本机代理客户端；请确认你拥有使用权，并遵守单位、服务商和 OpenAI 的条款。下面只说明如何把**已有的代理端口**传给进程。

### 8.1 Linux/macOS 临时设置

假设本机已有 HTTP 代理 `127.0.0.1:7890`，SOCKS5 代理 `127.0.0.1:7891`：

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
# 只有代理确实提供 SOCKS5 时才设置：
export ALL_PROXY=socks5h://127.0.0.1:7891
export NO_PROXY=localhost,127.0.0.1

curl -I https://chatgpt.com
npm view @openai/codex version
codex login
```

`HTTP_PROXY`、`HTTPS_PROXY` 和 `ALL_PROXY` 是常见的程序约定；某个桌面应用不一定继承当前 shell。若 CLI 能访问而桌面应用不能，配置操作系统/应用代理，或在同一环境启动应用。不要把带用户名密码的代理 URL 提交到 shell 历史或项目文件。

### 8.2 Windows PowerShell 临时设置

```powershell
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
curl.exe -I https://chatgpt.com
npm view @openai/codex version
codex login
```

### 8.3 npm 下载单独设置

如果只是 npm 下载需要代理：

```bash
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890
npm install -g @openai/codex
```

不再需要时删除持久化设置：

```bash
npm config delete proxy
npm config delete https-proxy
```

### 8.4 SSH 到服务器时借用本机代理

更安全的选择通常是在服务器上使用经批准的出口代理或 VPN。如果确实要临时把本机代理转给服务器，并且 SSH 服务端允许 TCP 转发：

```bash
# 本地机器：本地代理监听 127.0.0.1:7890
ssh -R 7890:127.0.0.1:7890 ubuntu@SERVER_IP

# SSH 登录后的服务器 shell
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
curl -I https://chatgpt.com
```

这不会把代理端口公开到公网，但会让服务器上的进程通过你的本机代理出网。退出 SSH 后转发即失效；如果 `curl` 仍失败，检查本机代理是否允许来自 SSH 转发的连接以及服务器的 `AllowTcpForwarding` 设置。不要把 Codex app-server 或代理端口直接绑定到 `0.0.0.0`。

## 9. 通过 SSH 和 tmux 远程使用 Codex

### 9.1 常规 SSH + tmux

```bash
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 ubuntu@SERVER_IP

# Ubuntu/Debian
sudo apt update
sudo apt install -y tmux git

tmux new -s codex
cd ~/your-project
codex
```

在 tmux 中按 `Ctrl-b`，松开后按 `d` 可以分离会话，SSH 断开后 Codex 仍在运行。重新连接：

```bash
tmux attach -t codex
tmux ls
tmux kill-session -t codex
```

长任务示例：

```bash
tmux new -s codex-build
cd ~/your-project
codex exec --cd . \
  --sandbox workspace-write \
  --ask-for-approval on-request \
  "运行测试并修复失败项；不要修改 .env 或生成目录"
```

分离后可随时 `tmux attach -t codex-build` 查看输出。tmux 只是保持终端会话，并不会替 Codex 管理权限、密钥或重试。

### 9.2 SSH 登录授权

本地 SSH 配置建议使用具体别名和密钥：

```sshconfig
Host codex-server
  HostName server.example.com
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519
  ServerAliveInterval 60
  ServerAliveCountMax 3
```

然后：

```bash
ssh codex-server
codex login
```

如果远程没有浏览器，按 CLI 提示把授权步骤转到有浏览器的机器；也可以使用 API key 管道登录。不要为了省事把本机 `~/.codex/auth.json` 复制到服务器，更不要把它放进镜像或 Git。

### 9.3 桌面应用的官方 SSH 远程连接

如果使用支持远程连接的 Codex 桌面应用，可以在本地 `~/.ssh/config` 写一个具体的 `Host` 别名，在应用 Settings → Connections 中启用该 SSH host，再选择远程项目目录。远程主机上需要有 `codex`，并且 Codex 能通过 SSH 启动远程 app server；不要把 app-server transport 直接暴露到公网。

```sshconfig
Host devbox
  HostName devbox.example.com
  User you
  IdentityFile ~/.ssh/id_ed25519
```

官方流程和限制见 [Remote connections](https://learn.chatgpt.com/docs/remote-connections)。如果只是想让终端在断线后继续运行，经典 SSH + tmux 更简单。

## 10. 一套可复制的安全工作流

```bash
cd ~/your-project
git status
git add -A && git commit -m "checkpoint before codex"

tmux new -s codex
codex
```

在 Codex 中：

```text
/plan
目标：……
约束：……
验收：测试、构建、文档和最终报告必须完成。
```

执行过程中：

1. 先读计划和 `git diff`，拒绝不理解的高风险命令。
2. 需要跨多个阶段时用 `/goal` 保存完成条件。
3. 遇到不确定的依赖、删除、数据库迁移或生产操作，先让 Codex 解释并请求确认。
4. 每个阶段运行测试并提交检查点。
5. 最终让 Codex 输出改动文件、运行过的命令、测试结果和未完成项。

## 11. 常见故障排查

### `codex: command not found`

确认安装成功、全局 npm bin 在 `PATH`，或使用官方独立安装脚本。重开终端后再运行 `codex --version`。

### `Unexpected token '.'` 或类似语法错误

Node.js 版本过旧。升级 Node.js LTS，确认 `node --version` 后再重装；也可以使用独立安装方式。

### 浏览器登录打不开或超时

先运行 `curl -I https://chatgpt.com`，确认 DNS、时间、出口和代理；通过 SSH 远程时完成本机浏览器授权，或改用 API key。不要复制 `auth.json`。

### CLI 能用，桌面应用不能用

桌面应用可能没有继承当前 shell 的代理变量，或使用了不同的登录账户/工作区。检查应用自己的网络代理、账户和 `/status`。

### CC Switch 切换后模型不见了或请求失败

确认 provider 的协议类型和 endpoint；Chat Completions provider 可能需要 Local Routing。切换路由/模型后重启 Codex，并查看 CC Switch 日志和 `/status`。恢复官方 provider 时关闭本地路由再测试。

### tmux 会话找不到

确认使用的是同一个 Linux 用户：`tmux ls`。root 和普通用户的会话彼此不可见；使用 `tmux attach -t <name>`，不要把整个会话目录复制给另一个用户。

## 12. 官方与项目参考

### OpenAI 官方

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

### 第三方项目

- [CC Switch 源码](https://github.com/farion1231/cc-switch) · [Releases](https://github.com/farion1231/cc-switch/releases) · [Codex 官方登录保留指南](https://github.com/farion1231/cc-switch/blob/main/docs/guides/codex-official-auth-preservation-guide-zh.md)
- [另一种 CCS：kaitranntt/ccs](https://github.com/kaitranntt/ccs) · [CLI 文档](https://ccs-7e541244.mintlify.app/reference/cli-commands)
- [tmux Wiki](https://github.com/tmux/tmux/wiki)

> 第三方 provider、CC Switch 和 CCS 不属于 OpenAI 官方产品。安装前检查源码、发行页、许可证、更新记录和权限；不要把 API key、OAuth token 或 `auth.json` 交给不可信软件。
