---
title: Zotero 配置与增强
description: 配置 Zotero Connector、翻译、LLM 服务和 Notion 同步，建立顺手的文献工作流
outline: deep
---

# Zotero 配置与增强

Zotero 负责保存文献、PDF、元数据和批注，Notion 适合做项目视图、阅读清单和长期知识整理，LLM 则用来辅助翻译、总结、比较和提问。建议先把 **Zotero 作为文献的主库**，再把处理结果同步到其他工具，避免多个地方同时修改同一份元数据。

## 推荐的完整流程

| 阶段 | 工具 | 主要产物 |
| --- | --- | --- |
| 发现文献 | 浏览器 + Zotero Connector | 条目、元数据和 PDF |
| 整理文献 | Zotero 集合、标签、重复项检测 | 干净的文献库 |
| 阅读处理 | Zotero PDF 阅读器 + Translate | 翻译、批注和笔记 |
| AI 辅助 | `llm-for-zotero` 或其他 LLM 服务 | 摘要、问答、对比和研究笔记 |
| 项目管理 | Notero + Notion | 阅读状态、项目视图和任务关联 |

完整链路可以理解为：

```text
网页 → Connector → Zotero → 阅读/翻译/LLM → Zotero 笔记 → Notero → Notion
```

## 先做好基础配置

### 安装桌面端和同步

先从 [Zotero 官网](https://www.zotero.org/download/) 安装桌面端，创建或登录 Zotero 账号，然后在 Zotero 的同步设置中配置账号。

Zotero 的同步分成两部分：

- **数据同步**：条目、标签、集合、笔记和链接等数据。官方文档说明这部分免费且不限制容量。
- **文件同步**：PDF、图片、音频和视频等附件。可以使用 Zotero Storage，也可以按官方支持的方式配置 WebDAV。

不要把 Zotero 数据目录直接放进 OneDrive、Dropbox 或其他普通网盘目录，让多个客户端同时同步数据库文件容易造成损坏。跨设备使用时，优先使用 Zotero 自己的数据同步和文件同步；另外保留定期备份。

参考：[Zotero 同步说明](https://www.zotero.org/support/sync)。

### 插件安装原则

Zotero 插件通常以 `.xpi` 文件发布。安装方式是：

1. 从插件作者的 GitHub Releases 或项目主页下载 `.xpi`。
2. 打开 Zotero → **工具** → **插件**。
3. 将 `.xpi` 拖入插件窗口，或点击右上角齿轮 → **从文件安装附加组件**。
4. 重启 Zotero，并确认插件版本与当前 Zotero 大版本匹配。

Zotero 官方提醒，插件可以访问 Zotero 数据和本机，因此只从自己信任的项目安装，并先检查源码、发布记录、许可证和权限。[官方插件说明](https://www.zotero.org/support/plugins)

## Zotero Connector：把网页资料保存得更干净

### 安装

从 [Zotero Connector 下载页](https://www.zotero.org/download/connectors) 为 Chrome、Edge、Firefox 或 Safari 安装对应扩展。桌面端和 Connector 最好同时安装并保持更新。

### 推荐用法

1. 先在 Zotero 中建立集合，例如 `Inbox`、`待读`、`已阅读`。
2. 在浏览器打开论文的**文章页、期刊页或数据库条目页**，不要优先从 PDF 直链开始。
3. 点击浏览器工具栏中的 Zotero 图标，选择保存到哪个集合。
4. 保存完成后，在 Zotero 中检查标题、作者、年份、期刊、DOI 和附件。
5. 对网页资料，按需要保存网页快照；对论文资料，确认 PDF 是否已经作为子附件挂在正确的父条目下。

Connector 会根据网页上的 translator 自动识别文章、图书、搜索结果或网页。文章页通常比手动下载 PDF 后再导入拥有更好的元数据；如果只有 PDF，可以在 Zotero 中右键选择 **检索 PDF 元数据**，但仍要人工核对结果。[添加条目](https://www.zotero.org/support/adding_items_to_zotero) · [检索 PDF 元数据](https://www.zotero.org/support/retrieve_pdf_metadata)

### Connector 不识别网页时

- 确认页面是具体的文章或书目页面，而不是登录页、搜索结果中间页或 PDF 直链。
- 点击 Connector 图标，先保存为网页，再补充元数据。
- 通过 DOI、ISBN 或 PMID 使用 Zotero 的 **通过标识符添加条目**。
- 检查 Connector 的扩展权限、代理和机构访问配置。

Connector 也支持在 Zotero 桌面端未运行时保存到 zotero.org 在线文库，但长期使用仍建议运行桌面端并开启同步，避免只保存到了在线库而没有及时下载到本机。[Connector 说明](https://www.zotero.org/support/connector)

## Translate for Zotero：阅读时翻译并沉淀批注

这里说的 Translate 插件通常指 [Translate for Zotero（Zotero PDF Translate）](https://github.com/windingwind/zotero-pdf-translate)，不是 Zotero 自带的网页 translator。它可以翻译 PDF、EPUB、网页、标题、摘要、批注和笔记，并支持多种翻译服务。

### 安装

1. 从 [项目 Releases](https://github.com/windingwind/zotero-pdf-translate/releases) 下载最新稳定版 `.xpi`。
2. 在 Zotero 中通过 **工具 → 插件 → 齿轮 → 从文件安装附加组件** 安装。
3. 重启 Zotero。
4. 打开 **编辑 → 设置 → Translate**，先确认目标语言和服务。

插件版本更新较快，安装前先看 Release 页面标注的 Zotero 兼容范围。不要把旧教程中的菜单名称、快捷键或配置字段当成永久不变的接口。

### 建议的初始设置

先采用保守设置，确认流程可用后再开启自动化：

- **Automatically Translate Selection**：刚开始可以关闭，避免每次选中文字都产生请求。
- **Enable Reader Selection Pop-up**：保留，适合快速查看短句。
- **Add Translation to Note**：保留，确认当前笔记编辑器处于激活状态后再使用。
- **Automatically Translate Annotation**：建议先关闭，避免批量同步时产生大量请求或覆盖不想改动的批注。
- **Dictionary**：保留，用于单词级查询；长句使用翻译服务。

阅读时选中 PDF、EPUB 或网页中的文本即可查看翻译。重要内容建议使用“原文 + 翻译 + 自己的判断”写入 Zotero 笔记，不要只保留机器翻译。

### 翻译服务怎么选

Translate 插件默认可以使用 Google Translate 等无需密钥的服务，也支持 DeepL、Microsoft、腾讯、阿里、GPT、Gemini、Claude 和自定义 GPT 兼容服务等。不同服务的密钥格式、计费和地区可用性不同，具体以插件当前设置页和服务商文档为准。

建议按场景选择：

| 场景 | 建议 |
| --- | --- |
| 快速看懂一段话 | 先用无需密钥的服务 |
| 术语和学术表达 | 使用稳定的翻译 API，并维护术语表 |
| 需要解释上下文 | 使用 LLM 翻译，但限制文本长度并检查原文 |
| 未发表论文或敏感材料 | 优先使用本地模型或确认服务商的数据保留策略 |

API key 只填在本机插件设置中，不要写进文档、截图、Git 仓库或共享配置文件。

## LLM 服务：从翻译升级到论文问答

如果只需要翻译，Translate 插件已经够用；如果希望对当前论文提问、总结图表、比较多篇文献或把回答写回笔记，可以考虑 [llm-for-zotero](https://github.com/yilewang/llm-for-zotero)。它的[中文文档](https://yilewang.github.io/llm-for-zotero/zh/)目前提供了 API、本地 OpenAI 兼容服务、WebChat、Codex App Server 和 Claude Code 等配置路径。

### 安装和第一次配置

1. 从 [llm-for-zotero Releases](https://github.com/yilewang/llm-for-zotero/releases) 下载 `.xpi`。
2. 在 Zotero 的插件管理器中安装并重启。
3. 打开 **首选项 → llm-for-zotero**。
4. 选择服务商，填写基础 URL、API key 和模型名。
5. 点击 **测试连接**，再打开一篇 PDF，点击阅读器右侧的 LLM Assistant 图标。
6. 先用一段公开论文做摘要和问答测试，确认模型、上下文和引用跳转正常后再处理自己的资料。

### 选择后端

| 需求 | 配置路径 | 注意事项 |
| --- | --- | --- |
| 使用云端 API | 选择对应服务商，填写 Base URL、key、model | 确认协议是 Responses、Chat Completions 或服务商原生协议 |
| 使用本地模型 | 连接 Ollama、LM Studio、vLLM 等 OpenAI 兼容接口 | 本地服务也要确认是否会把请求转发到外部 |
| 已有 ChatGPT Plus | 优先研究 Codex App Server 配置 | 不要复制 `~/.codex/auth.json` 或 OAuth token 到插件 |
| 不想单独管理 API key | 使用项目支持的 WebChat 路径 | 依赖浏览器登录状态和对应扩展，稳定性取决于项目实现 |

不要因为某个服务商“看起来兼容 OpenAI”就盲目把地址拼成 `/v1`。Base URL、协议、模型名和请求格式必须以服务商文档及插件设置说明为准。

### 推荐的 LLM 用法

- 先问“这篇论文的研究问题、方法、数据和主要结论是什么”，再追问证据所在页码。
- 让模型区分“原文明确说了什么”和“根据原文推断出的内容”。
- 对图表使用支持视觉输入的模型，并保留原图或页码。
- 让模型把结论写入 Zotero 笔记，再由自己确认后同步到 Notion。
- 不把模型生成的摘要直接当作文献事实；引用、数字、实验条件和局限性必须回到原文核对。

如果开启 Agent 或写入文库的功能，先关闭删除、批量改元数据等高风险操作；需要写入时使用人工确认和小范围测试集合。LLM 的权限边界应与 Zotero 插件权限分开看待。

## Notero：把 Zotero 条目同步到 Notion

[Notero](https://github.com/dvanoni/notero) 适合把 Zotero 条目、元数据和笔记同步到 Notion 数据库，用 Notion 的筛选、看板、项目关联和视图管理阅读进度。

### 当前推荐的连接方式

Notero 新版本使用 Notion 的授权流程，通常不需要像旧教程那样手动复制内部 Integration Token。旧版本配置过内部 Integration 的用户，可以在 Notero 设置中使用 **Upgrade Connection** 切换到新的连接方式。[以项目 README 为准](https://github.com/dvanoni/notero#connect-to-notion)

配置步骤：

1. 从 [Notero Releases](https://github.com/dvanoni/notero/releases) 或项目下载页获取 `.xpi`。
2. 在 Zotero 的 **工具 → 插件** 中安装。当前最新版本要求 Zotero 7 或更高版本；如果使用 Zotero 6，需要安装对应的旧版 Notero。
3. 打开 **工具 → Notero Preferences**。
4. 点击 **Connect to Notion**，选择工作区。
5. 选择使用模板数据库，或连接一个已有数据库。
6. 在 Notion 授权页点击允许，再返回 Zotero 完成连接。
7. 选择需要监控的 Zotero 集合，先只选一个测试集合。
8. 用右键菜单执行 **Sync to Notion**，确认一条记录无误后再开启自动同步。

如果浏览器授权后 Zotero 没有自动打开，按 Notero 页面提示复制 connection token，粘贴到 Notero Preferences 中完成连接。

### 推荐的 Notion 数据库

先使用 Notero 的基础模板，再按项目需要增加自己的字段。常见字段如下：

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| Name | Title | 文献标题 |
| Authors | Text | 作者 |
| Year | Number | 发表年份 |
| Abstract | Text | 摘要 |
| Tags | Multi-select | Zotero 标签 |
| DOI | URL | DOI 链接 |
| URL | URL | 原文或出版商链接 |
| Zotero URI | URL | 回到 Zotero 或 Zotero Web |
| Status | Select | 待读、阅读中、已读、已整理 |
| Project | Relation 或 Multi-select | 关联项目 |

`Citation Key` 字段只有在使用兼容的引用键方案时才需要；如果准备使用 Better BibTeX，要先确认它与当前 Zotero 大版本兼容。数据库字段名称和类型变化后，先在测试条目上同步，避免旧页面无法更新。

### Notero 的边界

Notero 的默认方向是 **Zotero → Notion**，不是完整的双向同步。建议把 Zotero 作为书目和 PDF 的源头，Notion 作为阅读状态、项目关系和整理视图。

另外，Notion API 不能直接上传本地 PDF，也不能使用 `file:` 链接打开本机文件。因此：

- PDF 和附件继续由 Zotero 管理。
- Notion 中使用 DOI、URL、Zotero URI 或 File Path 作为回链。
- PDF 批注要先在 Zotero 中执行 **从批注添加笔记**，再让 Notero 同步这条笔记。
- 初次同步只选择一个小集合；确认字段映射、重复条目和笔记格式后，再扩大范围。

Notero 官方 README 还列出了“找不到数据库”“页面已归档”“字段不存在”等常见错误及处理方式，遇到同步异常优先对照[项目 FAQ](https://github.com/dvanoni/notero#frequently-asked-questions)。

## 其他值得安装的增强项

插件不需要一次装满。按工作方式选择：

- **Better BibTeX**：需要 LaTeX、Markdown、Pandoc 或稳定 citation key 时再装。[项目主页](https://github.com/retorquere/zotero-better-bibtex)当前主线面向 Zotero 8 和 Zotero 9 beta，Zotero 7 要使用兼容的旧版并查看对应 Release 说明。
- **Better Notes**：需要更复杂的笔记模板、Markdown 导出或笔记管理时再考虑。[项目主页](https://github.com/windingwind/zotero-better-notes)。
- **Zotero 内置 PDF 阅读器**：优先熟悉内置高亮、批注、从批注生成笔记和全文搜索，再决定是否安装更多 PDF 插件。
- **Zotero 官方 Word、LibreOffice 和 Google Docs 集成**：这些通常随 Zotero 提供，不要为了引用功能重复安装来路不明的插件。

### 推荐的最小组合

如果想先得到明显的体验提升，可以按下面的顺序安装：

1. Zotero 桌面端 + Connector。
2. Zotero 官方同步，并确认 PDF 文件同步策略。
3. Translate for Zotero。
4. `llm-for-zotero`，先配置一个自己能控制数据流的模型服务。
5. Notero，先同步一个测试集合。
6. 只有在确实需要 citation key、LaTeX 或复杂笔记时，再增加 Better BibTeX 或 Better Notes。

## 安全检查清单

- 插件只从作者仓库或 Releases 下载，并检查是否支持当前 Zotero 版本。
- API key、Notion connection token、OAuth 凭据和本地配置不要提交到 Git 或发到截图中。
- 处理未发表论文、审稿材料或包含个人信息的 PDF 前，先确认 LLM 服务的数据保留和训练政策。
- “本地模型”不等于绝对离线；检查本地服务、代理和插件是否会转发请求。
- Notion 适合做索引和项目视图，不要把唯一的 PDF 原件只放在 Notion 链接里。
- 大规模同步前先备份 Zotero 数据，并用小集合验证字段映射和回链。

相关章节：

- [Codex 日常工作流](./codex-workflow)
- [CC Switch 与第三方 provider](./codex-providers)
- [故障排查与参考](./codex-troubleshooting)
