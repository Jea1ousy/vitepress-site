import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "A403 AI 文档",
  lang: 'zh-CN',
  description: "A403 AI 文档、Android 与移动端开发知识库",
  base: '/',
  themeConfig: {
    nav: [
      { text: 'LLM 架构', link: '/bilibili' },
      { text: '移动端八股', link: '/mobile/', activeMatch: '^/mobile/' },
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

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            tokenize(text) {
              const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
              return Array.from(segmenter.segment(text))
                .filter(part => part.isWordLike)
                .map(part => part.segment)
            }
          }
        },
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详细内容',
            resetButtonTitle: '清空搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关结果',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    outline: { label: '本页目录', level: [2, 3] },
    sidebarMenuLabel: '章节目录',
    returnToTopLabel: '回到顶部',
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebar: {
      '/mobile/': [
        { text: 'Android 与移动端八股', items: [
          { text: '学习地图与题目索引', link: '/mobile/' }
        ] },
        { text: '01 · 语言与系统基础', collapsed: false, items: [
          { text: 'Java、Kotlin 与运行时', link: '/mobile/language' },
          { text: '组件、生命周期与后台任务', link: '/mobile/components' },
          { text: 'Handler、Binder 与系统启动', link: '/mobile/framework' }
        ] },
        { text: '02 · UI 与并发', collapsed: false, items: [
          { text: 'View、事件分发与渲染', link: '/mobile/view' },
          { text: '协程、Flow 与并发', link: '/mobile/coroutines' },
          { text: 'Jetpack Compose', link: '/mobile/compose' }
        ] },
        { text: '03 · 工程与质量', collapsed: false, items: [
          { text: '架构、Jetpack 与可测试性', link: '/mobile/architecture' },
          { text: '网络、图片与本地存储', link: '/mobile/network-storage' },
          { text: '启动、卡顿、内存与稳定性', link: '/mobile/performance' },
          { text: '构建、发布、适配与安全', link: '/mobile/engineering' }
        ] },
        { text: '04 · 移动端拓展与实战', collapsed: false, items: [
          { text: 'iOS 与 Swift 基础', link: '/mobile/ios' },
          { text: 'Flutter、React Native 与 KMP', link: '/mobile/cross-platform' },
          { text: '场景设计与面试自测', link: '/mobile/scenarios' }
        ] }
      ],
      '/': [
        {
          text: '快速开始',
          items: [{ text: '从 0 上手', link: '/codex-from-zero' }]
        },
        {
          text: '高效协作',
          items: [{ text: '日常工作流', link: '/codex-workflow' }]
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
          items: [{ text: 'Zotero 配置与增强', link: '/zotero' }]
        },
        {
          text: '视频资源',
          items: [{ text: 'LLM 架构学习地图', link: '/bilibili' }]
        }
      ]
    }
  }
})
