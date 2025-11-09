<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '../models/card'
import DashboardContent from './DashboardContent.vue'
import MoreContent from './MoreContent.vue'
import BottomNavigation from './BottomNavigation.vue'
import MapSearchPage from '../views/MapSearchPage.vue'
import CalendarView from '@/components/calendar/CalendarView.vue'
import CalendarEditView from '@/views/CalendarEditView.vue'
import CalendarEditViewMobile from '@/views/CalendarEditViewMobile.vue'




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
  <div class="min-h-screen flex flex-col ">
    <main class="flex-1 flex flex-col overflow-hidden">
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
        <div v-else-if= "activeTab === 'map'">
            <MapSearchPage />
        </div>
<div v-else-if="activeTab === 'calendar'">
  <CalendarEditViewMobile />
    </div>

        <div v-else-if="activeTab === 'more'">
          <MoreContent />
        </div>
        <div v-else>
          {{ activeTab }}
        </div>
      </div>
    </main>
    
    <BottomNavigation
      position="sticky"
      class="shrink-0 z-50 relative"
      :active-tab="activeTab"
      @tab-change="handleTabChange"
    />
  </div>
</template>
