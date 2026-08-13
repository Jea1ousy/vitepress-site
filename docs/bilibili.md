---
title: B 站 UP 主
description: 访问 UP 主主页并在文档中播放 B 站视频
outline: deep
---

# B 站 UP 主

这里收录与本项目相关的 B 站 UP 主主页和视频。主页使用外链卡片，视频使用 B 站官方播放器地址嵌入。

## UP 主主页

<div class="bilibili-profile">
  <div>
    <span class="bilibili-kicker">BILIBILI CREATOR</span>
    <h2>88461692</h2>
    <p>打开 B 站主页查看 UP 主资料、投稿和最新动态。</p>
  </div>
  <a
    class="bilibili-profile-link"
    href="https://space.bilibili.com/88461692?spm_id_from=333.337.0.0"
    target="_blank"
    rel="noreferrer"
  >
    访问主页 <span aria-hidden="true">↗</span>
  </a>
</div>

::: tip 为什么主页使用外链
B 站个人空间通常会通过 `X-Frame-Options` 或 `Content-Security-Policy` 禁止被其他网站 iframe 嵌入。使用外链可以避免出现空白框，同时保留完整的主页功能。
:::

## 投稿视频

视频卡片可以横向滚动，适合集中展示多个投稿；点击卡片中的播放按钮后，在当前卡片内播放。

<div class="bilibili-video-scroller">
  <article class="bilibili-video-card">
    <div class="bilibili-video-frame">
      <iframe
        src="https://player.bilibili.com/player.html?bvid=BV1yVNU6xERx&page=1&high_quality=1&danmaku=0"
        title="B 站视频 BV1yVNU6xERx"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
    <div class="bilibili-video-meta">
      <strong>BV1yVNU6xERx</strong>
      <a href="https://www.bilibili.com/video/BV1yVNU6xERx" target="_blank" rel="noreferrer">在 B 站打开 ↗</a>
    </div>
  </article>

  <!-- 复制上面的 article，并替换 bvid、title 和链接，即可继续添加投稿。 -->
</div>

::: tip 添加投稿
将新的 BV 号复制到 `.bilibili-video-scroller` 中，卡片会自动排列为横向列表。B 站接口有访问频率限制，因此页面使用手动维护的 BV 号，不会虚构或缓存投稿数据。
:::

<style>
.bilibili-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.bilibili-kicker {
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.bilibili-profile h2 {
  margin: 8px 0 4px;
}

.bilibili-profile p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.bilibili-profile-link {
  flex: 0 0 auto;
  padding: 10px 16px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: none;
}

.bilibili-profile-link:hover {
  background: var(--vp-c-brand-soft);
}

.bilibili-video-scroller {
  display: flex;
  gap: 16px;
  margin: 24px 0;
  padding: 4px 4px 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.bilibili-video-card {
  flex: 0 0 min(420px, 82vw);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  scroll-snap-align: start;
}

.bilibili-video-frame {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #111;
}

.bilibili-video-frame iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.bilibili-video-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  font-size: 13px;
}

.bilibili-video-meta a {
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .bilibili-profile {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
