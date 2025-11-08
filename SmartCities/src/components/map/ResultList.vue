<template>
  <div class="flex-1 min-h-0 flex flex-col">
    <!-- Results List -->
    <div
      v-if="searchResults.length > 0 && !loading"
      class="flex-1 min-h-0 overflow-y-auto"
    >
      <ul class="space-y-2 p-4">
        <ResultItem
          v-for="result in searchResults"
          :key="result.id"
          :item="result"
          :category="getCategoryById(result.category_id)"
          @click="$emit('result-select', result)"
        />
      </ul>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <svg
          class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Markierungen werden geladen...
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <EmptyState
        :type="emptyStateType"
        :title="emptyStateTitle"
        :description="emptyStateDescription"
        :show-action="showEmptyAction"
        :action-text="emptyActionText"
        @action="handleEmptyAction"
      />
    </div>

    <!-- Results Counter -->
    <div
      v-if="searchResults.length > 0 && !loading"
      class="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    >
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ searchResults.length }} {{ searchResults.length === 1 ? 'Ergebnis' : 'Ergebnisse' }} gefunden
        <span v-if="totalResults && totalResults > searchResults.length">
          von {{ totalResults }} insgesamt
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ResultItem from './ResultItem.vue'
import EmptyState from './EmptyState.vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  },
  searchResults: {
    type: Array,
    default: () => []
  },
  query: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalResults: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['result-select', 'retry', 'clear-filters'])

// Get category by ID (using DB field names)
const getCategoryById = (categoryId) => {
  if (!categoryId) return null
  const category = props.categories.find(cat => cat.id === categoryId)
  return category || null
}

// Empty State Logic
const emptyStateType = computed(() => {
  if (props.query && props.searchResults.length === 0) return 'no-results'

  // Check if filters are active
  const hasActiveFilters = props.selectedCategories &&
                          props.selectedCategories.length > 0 &&
                          props.selectedCategories.length < props.categories.length

  if (hasActiveFilters && props.searchResults.length === 0) return 'no-results'

  return 'no-markers'
})

const emptyStateTitle = computed(() => {
  if (props.query && props.searchResults.length === 0) {
    return 'Keine Ergebnisse gefunden'
  }

  const hasActiveFilters = props.selectedCategories &&
                          props.selectedCategories.length > 0 &&
                          props.selectedCategories.length < props.categories.length

  if (hasActiveFilters && props.searchResults.length === 0) {
    return 'Keine Markierungen in dieser Kategorie'
  }

  return 'Keine Markierungen vorhanden'
})

const emptyStateDescription = computed(() => {
  if (props.query && props.searchResults.length === 0) {
    return `Keine Ergebnisse für "${props.query}". Versuchen Sie andere Suchbegriffe oder passen Sie Ihre Filter an.`
  }

  const hasActiveFilters = props.selectedCategories &&
                          props.selectedCategories.length > 0 &&
                          props.selectedCategories.length < props.categories.length

  if (hasActiveFilters && props.searchResults.length === 0) {
    return 'Versuchen Sie andere Kategorien auszuwählen oder fügen Sie eine neue Markierung in dieser Kategorie hinzu.'
  }

  return 'Fügen Sie Ihre erste Markierung hinzu, indem Sie auf die Karte klicken oder den "+" Button verwenden.'
})

const showEmptyAction = computed(() => {
  // Show action if search query exists or filters are active
  if (props.query && props.searchResults.length === 0) return true

  const hasActiveFilters = props.selectedCategories &&
                          props.selectedCategories.length > 0 &&
                          props.selectedCategories.length < props.categories.length

  return hasActiveFilters && props.searchResults.length === 0
})

const emptyActionText = computed(() => {
  if (props.query && props.searchResults.length === 0) {
    return 'Filter zurücksetzen'
  }

  const hasActiveFilters = props.selectedCategories &&
                          props.selectedCategories.length > 0 &&
                          props.selectedCategories.length < props.categories.length

  if (hasActiveFilters && props.searchResults.length === 0) {
    return 'Alle Kategorien anzeigen'
  }

  return 'Markierung hinzufügen'
})

const handleEmptyAction = () => {
  if (props.query || (props.selectedCategories &&
                      props.selectedCategories.length > 0 &&
                      props.selectedCategories.length < props.categories.length)) {
    emit('clear-filters')
  }
}
</script>
