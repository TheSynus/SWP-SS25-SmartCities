<template>
  <div
    class="w-full order-2 lg:order-2 lg:flex lg:flex-col lg:flex-1 lg:min-h-0"
    :class="isModalOpen ? 'lg:w-full' : 'lg:w-1/3'"
  >
    <div
      class="bg-white rounded-lg shadow-md flex flex-col overflow-hidden
             dark:bg-gray-800 border border-gray-200 dark:border-gray-700
             p-2 sm:p-4 lg:flex-1 lg:min-h-0"
    >
      <SearchHeader
        :query="query"
        :categories="categories"
        :selected-categories="selectedCategories"
        :categories-loading="categoriesLoading"
        :categories-error="categoriesError"
        @search="emit('search', $event)"
        @filter-update="emit('filter-update', $event)"
        @new-marker="emit('new-marker')"
        @category-editor="emit('category-editor')"
        @retry-categories="emit('retry-categories')"
      />

      <ResultList
        :categories="categories"
        :search-results="searchResults"
        :selected-categories="selectedCategories"
        :query="query"
        :loading="loading"
        :total-results="totalResults"
        @result-select="emit('result-select', $event)"
        @retry="emit('retry')"
        @clear-filters="emit('clear-filters')"
      />
    </div>
  </div>
</template>

<script setup>
import ResultList from './ResultList.vue'
import SearchHeader from './SearchHeader.vue'

const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false
  },
  query: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  searchResults: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  categoriesLoading: {
    type: Boolean,
    default: false
  },
  categoriesError: {
    type: [String, null],
    default: null
  },
  totalResults: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'search',
  'result-select',
  'new-marker',
  'category-editor',
  'filter-update',
  'retry',
  'retry-categories',
  'clear-filters'
])
</script>
