import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "A403 AI 文档",
  description: "A403 AI 文档与更新日志",
  base: '/',
  themeConfig: {
    nav: [
      {
        text: '文档',
        items: [
          { text: '从 0 上手', link: '/codex-from-zero' },
          { text: '日常工作流', link: '/codex-workflow' },
          { text: '代理、SSH 与 tmux', link: '/codex-remote' },
          { text: '第三方 provider', link: '/codex-providers' },
          { text: '故障排查与参考', link: '/codex-troubleshooting' }
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
      }
    ]
  }
})
