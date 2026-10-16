import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const directory = fileURLToPath(new URL('../docs/mobile/', import.meta.url))
const topics = fs.readdirSync(directory)
  .filter(name => name.endsWith('.md'))
  .flatMap(name => {
    const source = fs.readFileSync(directory + name, 'utf8')
    const heading = source.match(/^# (\d{2}) · (.+)$/m)
    if (!heading) return []
    const questions = Array.from(source.matchAll(/^### (.+?) \{#([a-z0-9-]+)\}\s*$/gm))
      .map(match => ({ title: match[1], anchor: match[2] }))
    return [{ number: Number(heading[1]), title: heading[2], slug: name.slice(0, -3), questions }]
  })
  .sort((a, b) => a.number - b.number)

const total = topics.reduce((sum, topic) => sum + topic.questions.length, 0)
const output = [
  '---',
  'title: 移动端八股全部题目索引',
  'description: 按专题浏览 Android、Kotlin、并发、渲染、网络存储、性能、音视频、iOS 与跨端开发问答。',
  'outline: [2, 2]',
  'search: false',
  '---',
  '',
  '# 全部题目索引',
  '',
  `共 **${topics.length} 个专题、${total} 道问答**。点击问题直达答案；可用顶部搜索回查关键词，也可回到[学习地图](./)按顺序学习。`,
  '',
  '基础篇建立整体认识，进阶篇继续展开实现、失败路径与工程取舍。问题序号用于本页阅读，分享时请使用具体问题链接。',
  ''
]
let number = 0
for (const topic of topics) {
  output.push(`## ${String(topic.number).padStart(2, '0')} · ${topic.title} {#${topic.slug}}`, '')
  for (const question of topic.questions) {
    output.push(`${++number}. [${question.title}](./${topic.slug}#${question.anchor})`)
  }
  output.push('')
}
fs.writeFileSync(directory + 'questions.md', output.join('\n'), 'utf8')
console.log(`Mobile index: ${topics.length} topics, ${total} questions`)
