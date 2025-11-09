<template>
  <div class="flex-none p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      <input
        :value="query"
        @input="handleInput"
        type="text"
        placeholder="Suche nach Markierungen..."
        class="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
               focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
               dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400
               dark:text-white"
      />

      <div class="flex gap-2 ml-auto sm:justify-end">
        <FilterSection
          ref="filterSection"
          :categories="categories"
          :selected-categories="selectedCategories"
          @update:selected="handleFilterUpdate"
          @dropdown-opened="handleFilterOpened"
        />
        <div v-if="isAdmin">
          <ActionsButton
            ref="actionsButton"
            :categories="categories"
            @new-marker="emit('new-marker')"
            @category-editor="emit('category-editor')"
            @dropdown-opened="handleActionsOpened"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FilterSection from './FilterSection.vue'
import ActionsButton from './ActionsButton.vue'
import { useAdmin } from '@/composables/admin/useAdmin'

const { isAdmin } = useAdmin()

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
  }
})

const emit = defineEmits([
  'search',
  'filter-update',
  'new-marker',
  'category-editor'
])

const filterSection = ref(null)
const actionsButton = ref(null)

function handleInput(event) {
  emit('search', event.target.value)
}

function handleFilterUpdate(updatedCategories) {
  emit('filter-update', updatedCategories)
}

// Close other dropdowns when one opens
function handleFilterOpened() {
  if (actionsButton.value) {
    actionsButton.value.closeDropdown()
  }
}

function handleActionsOpened() {
  if (filterSection.value) {
    filterSection.value.closeDropdown()
  }
}
</script>
