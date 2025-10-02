<script setup lang="ts">
import type { Card } from '@/models/card'
import DashboardContent from '../DashboardContent.vue'
import BottomNavigation from '../BottomNavigation.vue'
import { ref, onMounted, computed } from 'vue'

interface Props {
  cards: Array<Card>
}

const props = defineProps<Props>()

const scrollContainer = ref<HTMLElement>()

// Tabs: 'myCity' | 'Karte' | 'Kalender' | 'Sonstiges'
const activeTab = ref<'myCity' | 'map' | 'calendar' | 'more'>('myCity')

const validTabs = new Set(['myCity', 'map', 'calendar', 'more'])

const handleTabChange = (tabName: string) => {
  // nur erlaubte Tabs setzen
  if (validTabs.has(tabName)) {
    activeTab.value = tabName as typeof activeTab.value
    console.log('Tab changed to:', tabName)
  } else {
    console.warn(`Unbekannter Tab: ${tabName}`)
  }
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
  <div
    class="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]"
  >
    <!-- Phone Hardware -->
    <div class="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-gray-100 dark:bg-gray-900">
      <div
        ref="scrollContainer"
        class="w-full h-full overflow-y-auto scrollbar-hide touch-pan-y relative"
        style="scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch"
      >
        <!-- Content: myCity zeigt DashboardContent; andere Tabs zeigen Placeholder -->
        <template v-if="activeTab === 'myCity'">
          <div class="transform scale-75 origin-top-left w-[363px] h-[763px] p-4">
            <DashboardContent :cards="props.cards" :show-add-buttons="false" />
          </div>

          
        </template>
        <template v-else>
          <div class="w-full h-full flex items-center justify-center">
            <h2 class="text-2xl font-semibold text-white">
              {{ activeTab }}
            </h2>
          </div>
        </template>

        <!-- Bottom Navigation Component -->
        <BottomNavigation
          position="absolute"
          :active-tab="activeTab"
          @tab-change="handleTabChange"
        />
      </div>
    </div>
  </div>
</template>
