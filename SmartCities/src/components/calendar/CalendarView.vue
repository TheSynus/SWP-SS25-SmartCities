// === CALENDAR VIEW COMPONENT ===
// components/CalendarView.vue
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

// Types
interface Event {
  id: string | number
  title: string
  date: string
  category: string
  repeat: string
  location: string
  description: string
  endDate: string
}

// Props
interface Props {
  currentDate: Date
  selectedDate: string | null
  month: string
  year: number
  daysInMonth: (date: Date) => number
  firstDayOffset: (date: Date) => number
  isToday: (dayNumber: number) => boolean
  getDateString: (dayNumber: number) => string
  getEventsForDay: (dayNumber: number) => Event[]
  getCategoryColor: (category: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  currentDate: () => new Date(),
  selectedDate: null,
  month: '',
  year: () => new Date().getFullYear(),
  daysInMonth: () => (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
  firstDayOffset: () => (date: Date) => {
    const jsDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return (jsDay + 6) % 7
  },
  isToday: () => (dayNumber: number) => false,
  getDateString: () => (dayNumber: number) => '',
  getEventsForDay: () => (dayNumber: number) => [],
  getCategoryColor: () => (category: string) => 'bg-gray-500'
})

// Emits
const emit = defineEmits<{
  'previous-month': []
  'next-month': []
  'select-date': [dayNumber: number]
}>()

// Methods
function handlePreviousMonth() {
  emit('previous-month')
}

function handleNextMonth() {
  emit('next-month')
}

function handleSelectDate(dayNumber: number) {
  emit('select-date', dayNumber)
  console.log("DEBUG: CalendarView")
}

</script>

<template>
  <section
    class="flex-[1.7] bg-white/10 p-6 rounded-lg shadow flex flex-col gap-6 relative overflow-hidden"
  >
    <div class="p-6 bg-white/5 rounded-lg border border-white/10">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-4">
        <button @click="handlePreviousMonth" class="p-2 hover:text-blue-400">
          <ChevronLeft class="w-5 h-5 stroke-[1.5]" />
        </button>
        <h3 class="text-lg font-semibold capitalize">{{ month }} {{ year }}</h3>
        <button @click="handleNextMonth" class="p-2 hover:text-blue-400">
          <ChevronRight class="w-5 h-5 stroke-[1.5]" />
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-4 text-center text-sm">
        <!-- Weekday Headers -->
        <div
          v-for="day in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']"
          :key="day"
          class="font-semibold text-blue-300"
        >
          {{ day }}
        </div>

        <!-- Empty cells for month offset -->
        <div v-for="n in (props.firstDayOffset?.(props.currentDate) || 0)" :key="'offset-' + n"></div>

        <!-- Calendar Days -->
        <div
          v-for="n in (props.daysInMonth?.(props.currentDate) || 0)"
          :key="'day-' + n"
          @click="handleSelectDate(n)"
          class="relative p-1 h-20 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer transition-all flex flex-col"
          :class="{
            'ring-2 ring-offset-2 ring-[#228B22]': props.isToday?.(n),
            'bg-blue-600/40 ring-2 ring-blue-400': props.selectedDate === props.getDateString?.(n),
          }"
        >
          <!-- Day Number -->
          <div class="text-center font-semibold mb-1">{{ n }}</div>
          
          <!-- Events for this day -->
          <div class="flex-1 overflow-hidden">
            <template v-for="(event, index) in (props.getEventsForDay?.(n) || [])" :key="event.id + '-label'">
              <!-- Show only the first event -->
              <div
                v-if="index === 0"
                class="text-xs px-1 py-0.5 mb-0.5 rounded text-white truncate"
                :class="props.getCategoryColor?.(event.category) || 'bg-gray-500'"
              >
                {{ event.title }}
              </div>
            </template>
            
            <!-- Show additional event count -->
            <div
              v-if="(props.getEventsForDay?.(n) || []).length > 1"
              class="text-xs text-yellow-300 px-1 font-medium"
            >
              + {{ (props.getEventsForDay?.(n) || []).length - 1 }} weitere
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>