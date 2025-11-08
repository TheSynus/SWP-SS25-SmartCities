<template>
  <div class="flex-none p-3 sm:p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
      <input
        :value="query"
        @input="handleInput"
        type="text"
        placeholder="Suche..."
        class="flex-grow ..."
      />

      <!-- this is the only important change -->
      <div class="flex gap-2 ml-auto sm:justify-end">
        <FilterSection
          :categories="categories"
          :selected-categories="selectedCategories"
          @update:selected="handleFilterUpdate"
        />
        <div v-if="isAdmin">
          <ActionsButton
            :categories="categories"
            @new-marker="emit('new-marker')"
            @category-editor="emit('category-editor')"
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

const actionsBtn = ref(null)

function handleInput(event) {
  emit('search', event.target.value)
}

function handleFilterUpdate(updatedCategories) {
  emit('filter-update', updatedCategories)
}
</script>