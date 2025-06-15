<script setup lang="ts">
import DashboardContent from '../DashboardContent.vue';
import { ref, onMounted } from 'vue'

interface Props {
  cards: Array<{ id: number; name: string }>
}

const props = defineProps<Props>()

const scrollContainer = ref<HTMLElement>()

onMounted(() => {
  const container = scrollContainer.value
  if (!container) return

  let isScrolling = false
  let startY = 0
  let scrollTop = 0

  // Mouse events für Desktop-Swiping
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

  // Event Listeners hinzufügen
  container.addEventListener('mousedown', handleMouseDown)
  container.addEventListener('mousemove', handleMouseMove)
  container.addEventListener('mouseup', handleMouseUp)
  container.addEventListener('mouseleave', handleMouseLeave)

  // Initial cursor setzen
  container.style.cursor = 'grab'

  // Cleanup
  return () => {
    container.removeEventListener('mousedown', handleMouseDown)
    container.removeEventListener('mousemove', handleMouseMove)
    container.removeEventListener('mouseup', handleMouseUp)
    container.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<template>
 <div class="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
    <div class="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
    <div class="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
    <div class="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
    <div class="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
    <div class="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-gray-100 dark:bg-gray-900">
      <!-- DashboardContent mit Touch-Scrolling -->
      <div
        ref="scrollContainer"
        class="w-full h-full p-4 overflow-y-auto scrollbar-hide touch-pan-y"
        style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch;"
      >
        <DashboardContent
          :cards="props.cards"
          :show-add-buttons="false"
        />
      </div>
    </div>
  </div>
</template>
