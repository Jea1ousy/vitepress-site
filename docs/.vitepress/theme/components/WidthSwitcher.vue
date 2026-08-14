<script setup lang="ts">
import { onMounted, ref } from 'vue'

type WidthMode = 'narrow' | 'medium' | 'full'

const storageKey = 'a403-doc-width'
const activeMode = ref<WidthMode>('narrow')

const modes: Array<{ id: WidthMode; label: string; title: string }> = [
  { id: 'narrow', label: '窄', title: '窄版正文' },
  { id: 'medium', label: '中', title: '中等宽度正文' },
  { id: 'full', label: '全', title: '全宽正文' }
]

function setMode(mode: WidthMode) {
  activeMode.value = mode
  document.documentElement.dataset.siteWidth = mode

  try {
    window.localStorage.setItem(storageKey, mode)
  } catch {
    // Storage can be unavailable in private browsing contexts.
  }
}

onMounted(() => {
  let savedMode: string | null = null

  try {
    savedMode = window.localStorage.getItem(storageKey)
  } catch {
    // Fall back to the default mode when storage is unavailable.
  }

  setMode(savedMode === 'medium' || savedMode === 'full' ? savedMode : 'narrow')
})
</script>

<template>
  <div class="width-switcher" role="group" aria-label="页面宽度">
    <button
      v-for="mode in modes"
      :key="mode.id"
      type="button"
      :class="{ active: activeMode === mode.id }"
      :aria-pressed="activeMode === mode.id"
      :title="mode.title"
      @click="setMode(mode.id)"
    >
      {{ mode.label }}
    </button>
  </div>
</template>
