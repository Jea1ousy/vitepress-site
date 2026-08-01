---
title: 代理、SSH 与 tmux
description: 在受限网络、远程服务器和断线环境中使用 Codex
outline: deep
---

# 代理、SSH 与 tmux

Codex 的安装、登录、模型请求和第三方 provider 都需要出站网络。本页只说明如何把**已有且获授权的代理**传给进程，不提供任何机场订阅或代理来源。

## 先确认网络边界

优先使用经批准的公司 HTTP(S) 代理、VPN 或本机代理客户端。先用 `curl -I https://chatgpt.com` 检查连通性，再判断是 Codex、DNS、系统时间、防火墙还是出口网络的问题。

桌面应用不一定继承当前 shell 的代理变量。如果 CLI 能访问而桌面应用不能，检查操作系统或应用自己的代理设置，或在同一环境中启动应用。不要把带用户名和密码的代理 URL 放进 shell 历史或项目文件。

## 临时设置代理

### Linux/macOS

假设已有 HTTP 代理 `127.0.0.1:7890`：

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export NO_PROXY=localhost,127.0.0.1

curl -I https://chatgpt.com
codex login
```

只有代理确实提供 SOCKS5 时，才设置 `ALL_PROXY`，例如 `socks5h://127.0.0.1:7891`。不确定协议时不要凭端口号猜测。

### Windows PowerShell

```powershell
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"
curl.exe -I https://chatgpt.com
codex login
```

### 只为 npm 设置代理

如果只有 npm 下载需要代理，可以使用 npm 的代理配置；不再需要时删除持久化设置：

```bash
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890
npm config delete proxy
npm config delete https-proxy
```

## SSH 到服务器时借用本机代理

更稳妥的选择是在服务器上使用经批准的出口代理或 VPN。如果确实要临时转发本机代理，且 SSH 服务端允许 TCP 转发，可以使用反向转发：

```bash
ssh -R 7890:127.0.0.1:7890 ubuntu@SERVER_IP
```

登录服务器后，将 `HTTP_PROXY` 和 `HTTPS_PROXY` 指向服务器侧的 `127.0.0.1:7890`，再用 `curl` 验证。退出 SSH 后转发即失效。

如果仍然失败，检查本机代理是否允许来自 SSH 转发的连接，以及服务器的 `AllowTcpForwarding` 设置。不要把 Codex app-server 或代理端口直接绑定到 `0.0.0.0`。

## SSH + tmux 保持远程任务

先通过 SSH 登录服务器，并确保项目、Git、Codex 和 `tmux` 已安装：

```bash
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 codex-server
tmux new -s codex
cd ~/your-project
codex
```

在 tmux 中按 `Ctrl-b`，松开后按 `d` 分离会话；SSH 断开后，tmux 中的 Codex 仍可继续运行。重新连接时：

```bash
tmux attach -t codex
tmux ls
tmux kill-session -t codex
```

tmux 只负责保持终端会话，不负责管理 Codex 权限、密钥或重试策略。

## SSH 登录与授权

本地 `~/.ssh/config` 建议使用具体的主机别名、用户和密钥，并设置合理的保活参数。远程没有浏览器时，按 CLI 提示把授权步骤转到有浏览器的机器，或使用 API key 管道登录。

不要为了省事复制本机 `~/.codex/auth.json` 到服务器，也不要把它放进镜像或 Git；其中包含访问令牌。

## 桌面应用的远程连接

如果使用支持远程连接的 Codex 桌面应用，可以在本地 SSH 配置中准备 `Host` 别名，再在应用的 Settings → Connections 中启用该 SSH host 并选择远程项目目录。远程主机需要有 `codex`，且应用能够通过 SSH 启动远程 app server。

官方流程和限制见 [Remote connections](https://learn.chatgpt.com/docs/remote-connections)。如果只是想让终端在断线后继续运行，经典 SSH + tmux 通常更简单。

相关内容：

- [Codex 从 0 上手](./codex-from-zero)
- [Codex 日常工作流](./codex-workflow)
- [故障排查与参考](./codex-troubleshooting)
