import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import WidthSwitcher from './components/WidthSwitcher.vue'
import KnowledgeFlow from './components/KnowledgeFlow.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('KnowledgeFlow', KnowledgeFlow)
  },
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(WidthSwitcher)
    })
}
