/ === FILTER DISPLAY COMPONENT ===
// components/FilterDisplay.vue
<script setup lang="ts">
import { computed } from 'vue'

// Types
interface FilterData {
  date: string
  category: string
  location: string
  searchText: string
}

// Props
interface Props {
  filterData: FilterData
  selectedDate: string | null
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: ''
})

// Emits
const emit = defineEmits<{
  'reset-all': []
  'reset-filter': [key: keyof FilterData | 'selectedDate']
}>()

// Computed
const activeFilters = computed(() => {
  const filters: Array<{
    key: keyof FilterData | 'selectedDate'
    label: string
    value: string
    icon: string
    type: 'date' | 'text' | 'calendar'
  }> = []

  // Calendar Date Filter (has priority)
  if (props.selectedDate) {
    filters.push({
      key: 'selectedDate',
      label: 'Kalenderdatum',
      value: formatDate(props.selectedDate),
      icon: '📅',
      type: 'calendar'
    })
  }

  // Regular Date Filter (only if no calendar date)
  if (props.filterData.date && !props.selectedDate) {
    filters.push({
      key: 'date',
      label: 'Datum',
      value: formatDate(props.filterData.date),
      icon: '📅',
      type: 'date'
    })
  }

  // Category Filter
  if (props.filterData.category) {
    filters.push({
      key: 'category',
      label: 'Kategorie',
      value: props.filterData.category,
      icon: '🏷️',
      type: 'text'
    })
  }

  // Location Filter
  if (props.filterData.location.trim()) {
    filters.push({
      key: 'location',
      label: 'Ort',
      value: props.filterData.location,
      icon: '📍',
      type: 'text'
    })
  }

  // Search Text Filter
  if (props.filterData.searchText.trim()) {
    filters.push({
      key: 'searchText',
      label: 'Suche',
      value: props.filterData.searchText,
      icon: '🔍',
      type: 'text'
    })
  }

  return filters
})

const filterCount = computed(() => activeFilters.value.length)

// Methods
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

function handleResetAll() {
  emit('reset-all')
}

function handleResetFilter(key: keyof FilterData | 'selectedDate') {
  emit('reset-filter', key)
}

function getFilterTypeClass(type: string): string {
  switch (type) {
    case 'calendar':
      return 'bg-green-600/20 border-green-500/30 text-green-300'
    case 'date':
      return 'bg-blue-600/20 border-blue-500/30 text-blue-300'
    default:
      return 'bg-blue-600/20 border-blue-500/30 text-blue-300'
  }
}
</script>

<template>
  <div 
    v-if="filterCount > 0"
    class="mb-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30"
    :class="props.class"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-blue-300">
          Aktive Filter
        </span>
        <span class="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full">
          {{ filterCount }}
        </span>
      </div>
      <button
        @click="handleResetAll"
        class="text-xs text-gray-400 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10"
        title="Alle Filter löschen"
        aria-label="Alle Filter löschen"
      >
        ✕ Alle löschen
      </button>
    </div>

    <!-- Filter Tags -->
    <div class="space-y-2">
      <div
        v-for="filter in activeFilters"
        :key="filter.key"
        class="flex items-center justify-between gap-2 p-2 rounded border transition-all duration-200"
        :class="getFilterTypeClass(filter.type)"
      >
        <!-- Filter Info -->
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-sm">{{ filter.icon }}</span>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium opacity-80">
              {{ filter.label }}
            </div>
            <div class="text-sm font-medium truncate" :title="filter.value">
              {{ filter.value }}
            </div>
          </div>
        </div>

        <!-- Remove Button -->
        <button
          @click="handleResetFilter(filter.key)"
          class="text-xs opacity-60 hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-white/10"
          :title="`${filter.label}-Filter entfernen`"
          :aria-label="`${filter.label}-Filter entfernen`"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-3 pt-2 border-t border-blue-500/20">
      <div class="text-xs text-blue-300/80">
        <span v-if="filterCount === 1">
          Ein Filter aktiv
        </span>
        <span v-else>
          {{ filterCount }} Filter aktiv
        </span>
        · Klicken Sie auf ✕ zum Entfernen einzelner Filter
      </div>
    </div>
  </div>
</template>
