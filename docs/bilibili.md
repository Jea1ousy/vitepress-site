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

## 视频嵌入

将下面的 `BVxxxxxxxxxxx` 替换成真实视频的 BV 号即可。BV 号可以从 B 站视频地址中找到，例如 `https://www.bilibili.com/video/BVxxxxxxxxxxx`。

<div class="bilibili-video-wrap">
  <iframe
    src="https://player.bilibili.com/player.html?bvid=BV1yVNU6xERx&page=1&high_quality=1&danmaku=0"
    title="B 站视频播放器"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

::: warning 播放器提示
示例 BV 号是占位符，不会播放视频。请替换成实际 BV 号；如果播放器被浏览器拦截，可点击视频标题回到 B 站观看。
:::

### 添加多个视频

复制下面的播放器块，为每个视频替换 `bvid` 参数和 `title`：

```html
<div class="bilibili-video-wrap">
  <iframe
    src="https://player.bilibili.com/player.html?bvid=你的BV号&page=1&high_quality=1&danmaku=0"
    title="视频标题"
    loading="lazy"
    allowfullscreen
  ></iframe>
</div>
```

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

.bilibili-video-wrap {
  position: relative;
  width: 100%;
  margin: 24px 0;
  overflow: hidden;
  border-radius: 8px;
  background: #111;
  aspect-ratio: 16 / 9;
}

.bilibili-video-wrap iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

@media (max-width: 640px) {
  .bilibili-profile {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
