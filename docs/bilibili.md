---
title: LLM 架构学习地图
description: 按知识主题梳理五道口纳什的 LLM 架构系列视频
outline: deep
---

<script setup>
import LlmArchitectureVideos from './.vitepress/theme/components/LlmArchitectureVideos.vue'
</script>

# LLM 架构学习地图

本页以 B 站 UP 主 **五道口纳什** 的“LLM 架构”合集为线索，整理大语言模型从核心计算模块到推理系统的关键知识。它不是按发布时间罗列视频，而是把内容重组为一条便于学习和回查的路径。

<div class="creator-bar">
  <div>
    <strong>五道口纳什</strong>
    <span>现代人工智能的概念、原理与工程实践</span>
  </div>
  <div class="creator-links">
    <a href="https://space.bilibili.com/59807853" target="_blank" rel="noreferrer">UP 主主页</a>
    <a href="https://space.bilibili.com/59807853/lists/6439923?type=season" target="_blank" rel="noreferrer">官方合集</a>
  </div>
</div>

::: info 整理说明
视频信息整理自“五道口纳什”的官方“合集·LLM架构”，截至 2026 年 8 月 14 日共 14 条。合集没有标为第 03 集的视频，而是在 01、02 之后收录了 K2 Thinking 和 Muon 优化器两条未编号内容；本页保留原始标题，并按知识主题重新分类。标有“充电专属”的视频需要相应观看权限。
:::

## 什么是 LLM 架构

LLM 架构不只是 Transformer 结构图。要理解一个现代大模型，需要同时回答五类问题：信息如何表示、每一层如何计算、长上下文如何编码、生成时如何高效运行，以及视觉等新模态如何接入。

| 层次 | 关注点 | 典型问题 |
| --- | --- | --- |
| 表示与位置 | Token embedding、RoPE、上下文窗口 | 模型如何区分顺序、距离与长短上下文？ |
| 核心计算块 | Attention、FFN、MoE、RMSNorm、残差与门控 | 参数放在哪里，哪些参数会在一次推理中被激活？ |
| 推理系统 | Prefill、Decode、KV Cache、MTP、推测解码 | 为什么首字延迟和逐 Token 生成是两种不同负载？ |
| 多模态扩展 | Vision Encoder、跨模态对齐、原生多模态 | 图像信息怎样进入语言模型并参与推理？ |
| 训练与表征 | 优化器、梯度、Token 表征漂移 | 训练如何改变模型内部表示，又可能引入哪些异常？ |

### 建议学习顺序

1. 先看 MoE、FFN、Attention 与 RMSNorm，建立模型骨架。
2. 再看 RoPE 与 Attention Head，理解位置信息和注意力模式。
3. 接着学习 Prefill、Decode、KV Cache 与推测解码，把结构连接到推理成本。
4. 然后进入 VLM、Kimi K2.5/K3，观察前沿模型如何组合这些模块。
5. 最后用 Muon 优化器与 Glitch Token 补齐训练和表征视角。

## 分类视频

每个分类都可以横向滚动。点击封面后才会加载 B 站播放器；同一时间只保留一个播放器，避免多个 iframe 同时占用网络和页面资源。

<LlmArchitectureVideos />

## 如何继续深入

看视频时不要只记模块名，建议为每个架构维护一张对照表：参数量与激活参数量、Attention 变体、位置编码、FFN/MoE 结构、归一化位置、训练目标、推理阶段的显存和带宽瓶颈。遇到新模型时，先按这些维度拆解，再判断真正的结构创新在哪里。

<style>
.creator-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 24px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.creator-bar strong,
.creator-bar span {
  display: block;
}

.creator-bar strong {
  margin-bottom: 4px;
  font-size: 18px;
}

.creator-bar span {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.creator-links {
  display: flex;
  flex: 0 0 auto;
  gap: 10px;
}

.creator-links a {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.creator-links a:hover {
  background: var(--vp-c-brand-soft);
}

@media (max-width: 640px) {
  .creator-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .creator-links {
    width: 100%;
  }

  .creator-links a {
    flex: 1;
    text-align: center;
  }
}
</style>
