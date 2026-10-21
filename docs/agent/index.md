---
title: AI Agent 学习地图
description: 以 Missing Semester 与《深入理解 AI Agent》为主线的智能体学习路线：工具基座、核心公式、上下文、记忆、MCP、Coding Agent、评估与多智能体。
outline: [2, 3]
---

# AI Agent 学习地图

为什么同一个模型，在不同人手里产出差这么多？差别不在模型，在模型之外的部分：给它看什么上下文、给它什么工具、怎么验证与纠错。这套知识库沿**工具基座 → 核心原理 → 上下文与记忆 → 工具生态 → 实战 → 评估 → 扩展**展开，把两份优秀资料串成一条可动手的学习路线。

本专题的两条主线：

| 资料 | 定位 | 适合谁 | 形式 |
| --- | --- | --- | --- |
| [Missing Semester（2026 版）](https://missing-semester-cn.github.io/) | 工具基座与智能体使用工作流——**怎么用好** | 所有人，不需要编程基础 | MIT 一月短课，视频 + 讲义（CC BY-NC-SA） |
| [《深入理解 AI Agent：设计原理与工程实践》](https://github.com/bojieli/ai-agent-book)（李博杰） | 原理与工程实践——**怎么造** | 能读写中等复杂度 Python | 开源书（Apache 2.0），10 章 + 109 个实验 |

两份资料恰好互补：课程解决"用智能体的人需要什么底子"，书回答"造智能体的人需要什么理论"。作者的公式**Agent = LLM + 上下文 + 工具**贯穿全部八篇。

<KnowledgeFlow title="智能体的最小循环" :steps="[
  { title: '目标', detail: '任务随系统提示与约定进入上下文' },
  { title: '推理', detail: '模型基于当前上下文决定下一步' },
  { title: '行动', detail: '通过工具改变外部世界' },
  { title: '观察', detail: '结果回填上下文，循环直到完成' }
]" caption="循环本身很简单，可靠性来自循环之外：上下文工程、工具接口、验证与护栏。" />

## 基础篇：先会用，再理解

| 章节 | 你需要回答的核心问题 | 建议优先级 |
| --- | --- | --- |
| [01 · 工具基座与智能体编程](./tools) | 智能体时代，命令行、Git 和调试为什么更重要的？ | P0 |
| [02 · 核心公式与 Harness 工程](./core) | Agent 由什么组成，Harness 管到哪，护栏怎么分层？ | P0 |
| [03 · 上下文工程](./context) | 每一轮该让模型看到什么，长了怎么省、怎么放？ | P0 |
| [04 · 记忆与知识库](./memory) | 跨会话的积累怎么写入、检索、更新和遗忘？ | P0 |
| [05 · 工具生态与 MCP](./mcp) | 工具怎么选、怎么接、怎么设计模型友好的接口？ | P0 |
| [06 · Coding Agent](./coding-agent) | 为什么代码是"能创造新工具的工具"，怎么造一个？ | P0 |
| [07 · 评估、后训练与持续进化](./eval-evolution) | 怎么度量好坏，怎么让智能体随使用变强？ | P0 |
| [08 · 交互扩展与多智能体](./interaction-multiagent) | 通用性从哪来，什么时候值得上多智能体？ | P1 |

P0 表示建议按序完成；P1 表示可在实战后回来补。每篇都标注了对应的书章与课程讲次，便于回到原文深入。

## 高频问题直达

| 常见提问 | 去哪里看 |
| --- | --- |
| 有了智能体还需要学命令行吗？ | [工具基座](./tools#still-need-shell) |
| 一个最小工具调用智能体有多少代码？ | [智能体到底在做什么](./tools#how-agents-work) |
| Harness 和环境的边界怎么划？ | [Harness 到底管什么](./core#harness) |
| 上下文为什么是"只追加、全量重放"的？ | [ReAct 循环](./core#react) |
| 模型变强后 Harness 会被淘汰吗？ | [Harness 的未来](./core#harness-future) |
| 系统提示里为什么不能放时间戳？ | [KV Cache 与前缀稳定](./context#kv-cache) |
| 压缩历史会丢什么，怎么补救？ | [上下文压缩](./context#compaction) |
| `AGENTS.md` 应该写什么？ | [项目约定文件](./context#agents-md) |
| 长上下文会取代 RAG 吗？ | [RAG 与长上下文](./memory#long-context-vs-rag) |
| MCP 到底解决了什么问题？ | [MCP 的 M+N](./mcp#mcp) |
| 为什么 coding agent 最先成熟？ | [代码是能创造工具的工具](./coding-agent#production-anatomy) |
| 为什么 TDD 和智能体特别契合？ | [反馈回路](./coding-agent#feedback-loops) |
| 小评估集先建多少条任务？ | [最小评估集](./eval-evolution#minimal-eval) |
| RL 会让模型不再需要工具吗？ | [SFT 还是 RL](./eval-evolution#sft-vs-rl) |
| 多智能体一定比单个强吗？ | [多智能体的取舍](./interaction-multiagent#single-vs-multi) |

## 建议学习路线

### 路线一：会用（所有岗位，约一周）

1. **第 1—2 天：** 过一遍 Missing Semester 讲次表，按缺口补命令行、Git 与调试，重点做[智能体编程](https://missing-semester-cn.github.io/2026/agentic-coding/)一讲的练习。
2. **第 3—4 天：** 读 [02 核心公式](./core)与[03 上下文工程](./context)，对照自己正在用的智能体工具检查：前缀稳定吗？约定文件写了吗？
3. **第 5—7 天：** 把[工具基座](./tools)的工作流用到真实项目：搭反馈回路、写 `AGENTS.md`、试一次子智能体。本站 [Codex 系列](/codex-from-zero)可作为具体工具的实操手册。

### 路线二：会造（工程师，四到六周）

1. 跟书第 1—5 章 + 本站 [02—06 篇](./core)对照阅读，**每章做一个实验**。
2. 里程碑：第 1—5 章结束后，产出一个自己写的、能跑通真实任务的最小 coding agent。
3. 用[评估](./eval-evolution#minimal-eval)给这个 agent 建十几条任务的评估集，进入"评估驱动迭代"。

### 路线三：会评会进化（深入，长期）

- 书第 7、9 章与本站 [07 篇](./eval-evolution)：把评估集扩到几十条，加入分位数与封留集。
- 书第 6、10 章与本站 [08 篇](./interaction-multiagent)：按需扩展交互模态或多智能体编排。
- 第 8 章（模型后训练）按岗位决定深度：应用工程师了解概念即可，训练岗精读实验。

"先把书看薄，再把书看厚，再把书看薄"——书作者的这句读者总结，就是路线二该有的节奏。

## 内容边界与资料使用

- **整理日期：2026-10-21。** 两份资料都在快速更新（书为 2.0 版、课程为 2026 版），本专题是导读与重组，具体细节以原文为准。
- **书的实验**支持 Python 3.11—3.13，用 `uv sync --locked --extra ch1` 按章装依赖；思考题参考答案在书的 [reference-answers](https://github.com/bojieli/ai-agent-book/blob/main/book/reference-answers.md)。
- **课程教材**为 CC BY-NC-SA 开源，视频在官方渠道；中文站由社区翻译维护。
- 各篇中的机制讲解尽量与具体产品解耦；涉及具体工具行为（确认策略、上下文上限、定价）时，以你当时所用版本为准复核。

可以从 [01 · 工具基座与智能体编程](./tools)开始，也可以先跳到[核心公式](./core)建立理论框架。
