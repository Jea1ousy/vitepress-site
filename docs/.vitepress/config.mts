import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "A403 AI 文档",
  description: "A403 AI 文档与更新日志",
  base: '/',
  themeConfig: {
    nav: [
      { text: 'LLM 架构', link: '/bilibili' },
      {
        text: '文档',
        items: [
          { text: '从 0 上手', link: '/codex-from-zero' },
          { text: '日常工作流', link: '/codex-workflow' },
          { text: '代理、SSH 与 tmux', link: '/codex-remote' },
          { text: '第三方 provider', link: '/codex-providers' },
          { text: '故障排查与参考', link: '/codex-troubleshooting' },
          { text: 'Zotero 配置与增强', link: '/zotero' }
        ]
      },
      { text: '更新日志', link: '/changelog' }
    ],

    sidebar: [
      {
        text: '快速开始',
        items: [
          { text: '从 0 上手', link: '/codex-from-zero' },
        ]
      },
      {
        text: '高效协作',
        items: [
          { text: '日常工作流', link: '/codex-workflow' },
        ]
      },
      {
        text: '远程与扩展',
        items: [
          { text: '代理、SSH 与 tmux', link: '/codex-remote' },
          { text: 'CC Switch 与第三方 provider', link: '/codex-providers' },
          { text: '故障排查与参考', link: '/codex-troubleshooting' }
        ]
      },
      {
        text: '知识管理',
        items: [
          { text: 'Zotero 配置与增强', link: '/zotero' }
        ]
      },
      {
        text: '视频资源',
        items: [
          { text: 'LLM 架构学习地图', link: '/bilibili' }
        ]
      }
    ]
  }
})
