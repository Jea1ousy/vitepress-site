import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "A403 AI 文档",
  description: "Codex 从 0 上手、工作流与远程使用指南",
  base: '/docs/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/codex-from-zero' },
      { text: '日常工作流', link: '/codex-workflow' },
      { text: '远程使用', link: '/codex-remote' },
      { text: '第三方 provider', link: '/codex-providers' }
    ],

    sidebar: [
      {
        text: 'Codex 教程',
        items: [
          { text: '从 0 上手', link: '/codex-from-zero' },
          { text: '日常工作流', link: '/codex-workflow' },
          { text: '代理、SSH 与 tmux', link: '/codex-remote' },
          { text: 'CC Switch 与第三方 provider', link: '/codex-providers' },
          { text: '故障排查与参考', link: '/codex-troubleshooting' }
        ]
      }
    ]
  }
})
