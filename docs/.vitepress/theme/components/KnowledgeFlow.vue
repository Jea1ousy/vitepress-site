<script setup lang="ts">
defineProps<{
  title: string
  steps: { title: string; detail: string }[]
  caption?: string
}>()
</script>

<template>
  <figure class="knowledge-flow" :aria-label="title">
    <figcaption>
      <strong>{{ title }}</strong>
      <span v-if="caption">{{ caption }}</span>
    </figcaption>
    <ol :style="{ '--flow-columns': steps.length }">
      <li v-for="(step, index) in steps" :key="index">
        <span class="flow-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
        <strong>{{ step.title }}</strong>
        <span class="flow-detail">{{ step.detail }}</span>
      </li>
    </ol>
  </figure>
</template>

<style scoped>
.knowledge-flow {
  margin: 28px 0;
  padding: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.knowledge-flow figcaption > strong {
  display: block;
  color: var(--vp-c-text-1);
  font-size: 16px;
}
.knowledge-flow figcaption > span {
  display: block;
  margin-top: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.7;
}
.knowledge-flow ol {
  display: grid;
  grid-template-columns: repeat(var(--flow-columns), minmax(0, 1fr));
  gap: 22px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}
.knowledge-flow li {
  position: relative;
  margin: 0;
  padding: 14px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  overflow-wrap: anywhere;
}
.knowledge-flow li + li::before {
  position: absolute;
  top: 50%;
  left: -19px;
  color: var(--vp-c-brand-1);
  content: '→';
  transform: translateY(-50%);
}
.flow-number {
  display: block;
  margin-bottom: 8px;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
}
.knowledge-flow li > strong {
  display: block;
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.5;
}
.flow-detail {
  display: block;
  margin-top: 8px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.7;
}
@media (max-width: 640px) {
  .knowledge-flow { padding: 16px; }
  .knowledge-flow ol { grid-template-columns: 1fr; }
  .knowledge-flow li + li::before {
    top: -22px;
    left: 50%;
    content: '↓';
    transform: translateX(-50%);
  }
}
</style>
