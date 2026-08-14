<script setup lang="ts">
import { ref } from 'vue'

type Video = {
  bvid: string
  title: string
  cover: string
  duration: string
  published: string
  access?: '充电专属'
}

type VideoGroup = {
  id: string
  title: string
  description: string
  videos: Video[]
}

const activeBvid = ref<string | null>(null)

const groups: VideoGroup[] = [
  {
    id: 'model-backbone',
    title: '一、模型骨架：MoE、FFN 与归一化',
    description: '从参数量、激活参数量和计算路径入手，建立 Dense 与稀疏 MoE 模型的整体认识。',
    videos: [
      {
        bvid: 'BV1P5nfz6Eto',
        title: '[LLM Architect] 01 MoE 初步，参数量计算，Qwen3-30B-A3B，GQA 与 Sparse MoE',
        cover: 'https://i2.hdslb.com/bfs/archive/724b9b3a7cbb11130e33adac3dadf7b95aa73dff.jpg@672w_378h_1c.avif',
        duration: '15:30',
        published: '2025-09-28'
      },
      {
        bvid: 'BV1ty4TzSEpg',
        title: '[LLM Architect] 02 Qwen3 Dense vs. MoE，MoE 等效宽度，Attention vs. FFN，RMSNorm',
        cover: 'https://i2.hdslb.com/bfs/archive/c136cdaf0bec0b93a946e827cf8c5ff056eb6e1e.jpg@672w_378h_1c.avif',
        duration: '19:03',
        published: '2025-10-12',
        access: '充电专属'
      }
    ]
  },
  {
    id: 'attention-position',
    title: '二、注意力与位置编码',
    description: '理解 RoPE 的几何含义、长距离衰减，以及 Attention Head 在实际模型中的典型行为。',
    videos: [
      {
        bvid: 'BV1cv2XBAEsA',
        title: '[LLM Architect] 04 RoPE 的几何视角，Qwen3 计算细节与 Interleaved 版本对比',
        cover: 'https://i2.hdslb.com/bfs/archive/65e96338a61b92f61df24e6965d62f2f6d5eef82.jpg@672w_378h_1c.avif',
        duration: '18:23',
        published: '2025-12-06'
      },
      {
        bvid: 'BV1qVmYBzE2d',
        title: '[LLM Architect] 05 RoPE Attention 远程衰减、Base 与 Context Window',
        cover: 'https://i2.hdslb.com/bfs/archive/9c5247bd26887af18bdbac509114f3789d7571cf.jpg@672w_378h_1c.avif',
        duration: '16:52',
        published: '2025-12-14',
        access: '充电专属'
      },
      {
        bvid: 'BV16xB6B3EVi',
        title: '[LLM Architect] 06 Attention Head 模式：Attention Sink、PTH、Induction Head',
        cover: 'https://i2.hdslb.com/bfs/archive/f987446bda8e822887b57bdbb19a68e086c59ea8.jpg@672w_378h_1c.avif',
        duration: '19:04',
        published: '2025-12-27'
      }
    ]
  },
  {
    id: 'inference-system',
    title: '三、推理过程与系统效率',
    description: '把模型内部结构连接到生成过程，理解交错推理、Prefill/Decode、KV Cache 与推测解码。',
    videos: [
      {
        bvid: 'BV1AMCdBqEe1',
        title: '[Reasoning Model] K2 Thinking：Interleaved Thinking 与 Turn',
        cover: 'https://i2.hdslb.com/bfs/archive/d32bef57a7e94178742521d3ea7a7e79c7dc90dd.jpg@672w_378h_1c.avif',
        duration: '14:53',
        published: '2025-11-16'
      },
      {
        bvid: 'BV1APAuzpEHY',
        title: '[LLM Architect] 09 Prefill 与 Decode、KV Cache、GEMM/GEMV、算力与带宽',
        cover: 'https://i2.hdslb.com/bfs/archive/4cb16e93eec92ab79c69bb81f0abe992c06fe8fd.jpg@672w_378h_1c.avif',
        duration: '34:01',
        published: '2026-03-22'
      },
      {
        bvid: 'BV1naJp6EEey',
        title: '[LLM Architect] 11 探测解码分布一致性、MTP 与 Self-Speculative Decoding',
        cover: 'https://i2.hdslb.com/bfs/archive/18a32dfba1e06c5d888d927586d72e8dde611866.jpg@672w_378h_1c.avif',
        duration: '25:09',
        published: '2026-06-13',
        access: '充电专属'
      }
    ]
  },
  {
    id: 'multimodal-frontier',
    title: '四、多模态与前沿模型',
    description: '从 VLM 的通用结构进入 Kimi K2.5/K3，观察视觉编码、MLA/KDA、Latent MoE 和门控机制如何组合。',
    videos: [
      {
        bvid: 'BV1jJfDBUEcR',
        title: '[LLM Architect] 07 VLM 架构：Gemini、Qwen3-VL 与 Kimi K2.5',
        cover: 'https://i2.hdslb.com/bfs/archive/b2309878ecdbf407ea7a5a6d7dc17362ccbb0b96.jpg@672w_378h_1c.avif',
        duration: '17:25',
        published: '2026-02-03'
      },
      {
        bvid: 'BV1nvcuz5Ewj',
        title: '[LLM Architect] 08 Kimi K2.5 论文导读：原生多模态与 Agent Swarm',
        cover: 'https://i2.hdslb.com/bfs/archive/c33785d03e4e2ed462f5e94cef142a73283af62f.jpg@672w_378h_1c.avif',
        duration: '58:20',
        published: '2026-02-09'
      },
      {
        bvid: 'BV1VpMB6nEvH',
        title: '[LLM Architect] 12 Kimi K3：KDA、MLA、Latent MoE、MoonViT 与残差注意力',
        cover: 'https://i2.hdslb.com/bfs/archive/4e840dd5c423894771020ba5d1fc4c7d204a4efe.jpg@672w_378h_1c.avif',
        duration: '32:40',
        published: '2026-08-05'
      },
      {
        bvid: 'BV1UNur6pEkZ',
        title: '[LLM Architect] 13 Kimi K3 门控机制：Gated MLA、KDA、SiTU-GLU 与 SwiGLU',
        cover: 'https://i2.hdslb.com/bfs/archive/88d7a5bc055a1e7fc3bbddadb6a8a83141997d1b.jpg@672w_378h_1c.avif',
        duration: '16:46',
        published: '2026-08-11'
      }
    ]
  },
  {
    id: 'training-representation',
    title: '五、训练优化与内部表征',
    description: '从优化器和异常 Token 两端观察训练如何塑造模型参数与词嵌入空间。',
    videos: [
      {
        bvid: 'BV18sgtzKEVQ',
        title: '[Kimi] Muon Optimizer：梯度白化、正交化、Newton-Schulz 与 SVD',
        cover: 'https://i2.hdslb.com/bfs/archive/d82b5dee2b13242b2352eabdb4d87dc2b7d949b4.jpg@672w_378h_1c.avif',
        duration: '21:48',
        published: '2025-07-20'
      },
      {
        bvid: 'BV1qZRZBcEiH',
        title: '[LLM Architect] 10 Glitch Token、词嵌入漂移及 SFT/RL 的梯度视角',
        cover: 'https://i2.hdslb.com/bfs/archive/bafc9cf6763e647f2bc34a0c884ba30e3016df4a.jpg@672w_378h_1c.avif',
        duration: '24:47',
        published: '2026-05-10'
      }
    ]
  }
]

function playerUrl(bvid: string) {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0`
}

function videoUrl(bvid: string) {
  return `https://www.bilibili.com/video/${bvid}`
}
</script>

<template>
  <div class="video-library">
    <section v-for="group in groups" :id="group.id" :key="group.id" class="video-group">
      <header class="group-header">
        <h3>{{ group.title }}</h3>
        <p>{{ group.description }}</p>
      </header>

      <div class="video-scroller">
        <article v-for="video in group.videos" :key="video.bvid" class="video-card">
          <div class="video-media">
            <iframe
              v-if="activeBvid === video.bvid"
              :src="playerUrl(video.bvid)"
              :title="video.title"
              allowfullscreen
              referrerpolicy="no-referrer-when-downgrade"
            />
            <button
              v-else
              class="video-cover"
              type="button"
              :aria-label="`播放：${video.title}`"
              @click="activeBvid = video.bvid"
            >
              <img :src="video.cover" :alt="video.title" loading="lazy" referrerpolicy="no-referrer" />
              <span class="play-control" aria-hidden="true" />
              <span class="duration">{{ video.duration }}</span>
            </button>
          </div>

          <div class="video-body">
            <div class="video-tags">
              <span>{{ video.published }}</span>
              <span v-if="video.access" class="access-tag">{{ video.access }}</span>
            </div>
            <h4>{{ video.title }}</h4>
            <div class="video-footer">
              <code>{{ video.bvid }}</code>
              <a :href="videoUrl(video.bvid)" target="_blank" rel="noreferrer">B 站观看</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.video-library {
  margin-top: 24px;
}

.video-group {
  margin: 0 0 36px;
}

.group-header h3 {
  margin: 0 0 6px;
  font-size: 20px;
}

.group-header p {
  margin: 0;
  max-width: 720px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.video-scroller {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding: 2px 2px 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
}

.video-card {
  flex: 0 0 min(360px, 84vw);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  scroll-snap-align: start;
}

.video-media {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
}

.video-media iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.video-cover {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: #111;
  cursor: pointer;
}

.video-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 180ms ease;
}

.video-cover:hover img {
  transform: scale(1.02);
}

.video-cover::after {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  content: '';
}

.play-control {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  width: 46px;
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.68);
  transform: translate(-50%, -50%);
}

.play-control::after {
  position: absolute;
  top: 50%;
  left: 53%;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  border-left: 11px solid #fff;
  content: '';
  transform: translate(-40%, -50%);
}

.duration {
  position: absolute;
  z-index: 1;
  right: 8px;
  bottom: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  font-size: 12px;
}

.video-body {
  padding: 13px 14px 14px;
}

.video-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.access-tag {
  padding: 1px 6px;
  border: 1px solid var(--vp-c-warning-2);
  border-radius: 4px;
  color: var(--vp-c-warning-1);
}

.video-body h4 {
  display: -webkit-box;
  min-height: 66px;
  margin: 8px 0 12px;
  overflow: hidden;
  font-size: 15px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.video-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.video-footer code {
  color: var(--vp-c-text-2);
}

.video-footer a {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .video-group {
    margin-bottom: 30px;
  }

  .group-header h3 {
    font-size: 18px;
  }
}
</style>
