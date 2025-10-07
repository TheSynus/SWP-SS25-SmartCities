<script setup lang="ts">
import type { Card } from '@/models/card'
import { ref, onMounted, nextTick } from 'vue' // ⬅️ nextTick hinzufügen
import HomeView from '@/components/cards/HomeView.vue'

interface Props {
  cards: Array<Card>
}

const props = defineProps<Props>()

const scrollContainer = ref<HTMLElement>()

const handleTabChange = () => {
  // Nach DOM-Update die Scroll-Position zurücksetzen
  nextTick(() => {
    const el = scrollContainer.value
    if (!el) return
    // zuverlässig nach ganz oben springen
    if ('scrollTo' in el) {
      el.scrollTo({ top: 0, behavior: 'auto' })
    }
  })
}

onMounted(() => {
  const container = scrollContainer.value
  if (!container) return

  let isScrolling = false
  let startY = 0
  let scrollTop = 0

  const handleMouseDown = (e: MouseEvent) => {
    isScrolling = true
    startY = e.clientY
    scrollTop = container.scrollTop
    container.style.cursor = 'grabbing'
    container.style.userSelect = 'none'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isScrolling) return
    e.preventDefault()
    const y = e.clientY
    const deltaY = startY - y
    container.scrollTop = scrollTop + deltaY
  }

  const handleMouseUp = () => {
    isScrolling = false
    container.style.cursor = 'grab'
    container.style.userSelect = 'auto'
  }

  const handleMouseLeave = () => {
    isScrolling = false
    container.style.cursor = 'grab'
    container.style.userSelect = 'auto'
  }

  container.addEventListener('mousedown', handleMouseDown)
  container.addEventListener('mousemove', handleMouseMove)
  container.addEventListener('mouseup', handleMouseUp)
  container.addEventListener('mouseleave', handleMouseLeave)

  container.style.cursor = 'grab'

  return () => {
    container.removeEventListener('mousedown', handleMouseDown)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('mouseup', handleMouseUp)
    container.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<template>
  <div
    class="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]"
  >
    <div class="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-gray-100 dark:bg-gray-900">
      <div
        ref="scrollContainer"
        class="w-full h-full overflow-y-auto scrollbar-hide touch-pan-y"
        style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch"
      >
        <HomeView :cards="props.cards" :scale="0.75" @tab-changed="handleTabChange" />
      </div>
    </div>
  </div>
</template>
