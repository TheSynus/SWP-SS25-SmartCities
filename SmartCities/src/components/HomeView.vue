<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '../models/card'
import DashboardContent from './DashboardContent.vue'
import MoreContent from './MoreContent.vue'
import BottomNavigation from './BottomNavigation.vue'

interface Props {
  cards: Array<Card>
  scale: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  tabChanged: [tabName: string]
}>()

const activeTab = ref('myCity')

const handleTabChange = (tabName: string) => {
  activeTab.value = tabName
  console.log('Tab changed to:', tabName)

  emit('tabChanged', tabName)
}
</script>

<template>
  <div
    :class="[
      'relative mx-auto h-full w-full max-w-md flex flex-col items-stretch min-h-screen',
      'bg-gray-50 dark:bg-gray-900',
    ]"
  >
    <!-- Skalierter Content-Bereich -->
    <div class="flex-1 p-2.5">
      <div
        class="h-full"
        :style="
          props.scale !== 1
            ? {
                transform: `scale(${props.scale})`,
                transformOrigin: 'top left',
                width: `${100 / props.scale}%`,
                height: `${100 / props.scale}%`,
              }
            : {}
        "
      >
        <div v-if="activeTab === 'myCity'">
          <DashboardContent :cards="props.cards" :show-add-buttons="false" />
        </div>
        <div v-else-if="activeTab === 'more'">
          <MoreContent />
        </div>
        <div v-else>
          {{ activeTab }}
        </div>
      </div>
    </div>

    <!-- BottomNav klebt unten innerhalb des Scroll-Containers -->
    <BottomNavigation
      position="sticky"
      class="shrink-0"
      :active-tab="activeTab"
      @tab-change="handleTabChange"
    />
  </div>
</template>
