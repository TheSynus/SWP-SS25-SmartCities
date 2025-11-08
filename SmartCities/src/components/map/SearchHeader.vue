<template>
  <div class="flex-none p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      <input
        :value="query"
        @input="handleInput"
        type="text"
        placeholder="Suche nach Markern..."
        class="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
               focus:ring-2 focus:ring-blue-500 focus:border-transparent
               dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
               transition-colors duration-200"
      />

      <div class="flex gap-2 ml-auto sm:justify-end">
        <FilterSection
          :categories="categories"
          :selected-categories="selectedCategories"
          :loading="categoriesLoading"
          :error="categoriesError"
          @update:selected="handleFilterUpdate"
          @retry="emit('retry-categories')"
        />
        <ActionsButton
          :categories="categories"
          @new-marker="emit('new-marker')"
          @category-editor="emit('category-editor')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import FilterSection from './FilterSection.vue'
import ActionsButton from './ActionsButton.vue'

const props = defineProps({
  query: {
    type: String,
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  },
  categoriesLoading: {
    type: Boolean,
    default: false
  },
  categoriesError: {
    type: [String, null],
    default: null
  }
})

const emit = defineEmits([
  'search',
  'filter-update',
  'new-marker',
  'category-editor',
  'retry-categories'
])

function handleInput(event) {
  emit('search', event.target.value)
}

function handleFilterUpdate(updatedCategories) {
  emit('filter-update', updatedCategories)
}
</script>
