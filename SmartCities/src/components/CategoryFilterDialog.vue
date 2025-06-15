<template>
  <!-- Flowbite Dropdown -->
  <div
    id="filter-dropdown"
    class="z-10 hidden w-80 bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700"
  >
    <!-- Dropdown header -->
    <div class="px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">
      <div class="flex items-center justify-between">
        <span class="font-semibold">Kategorien auswählen</span>
        <button
          @click="close"
          type="button"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-6 h-6 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Dropdown body -->
    <div class="px-4 py-3">
      <div class="space-y-2 max-h-64 overflow-auto">
        <div
          v-for="category in localCategories"
          :key="category.id"
          class="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <input
            :id="`dropdown-category-${category.id}`"
            type="checkbox"
            :checked="category.active"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            @change="toggleCategory(category)"
          />
          <span
            class="inline-block w-4 h-4 rounded-full ml-2 mr-3 cursor-pointer"
            :style="{ backgroundColor: category.color }"
            @click="toggleCategory(category)"
          ></span>
          <label
            :for="`dropdown-category-${category.id}`"
            class="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer flex-grow"
          >
            {{ category.name }}
          </label>
        </div>
      </div>
    </div>
    
    <!-- Dropdown footer -->
    <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
      <div class="flex items-center justify-end space-x-2">
        <button
          @click="close"
          type="button"
          class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-3 py-1.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600"
        >
          Abbrechen
        </button>
        <button
          @click="apply"
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Anwenden
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update:selected'])

const localCategories = reactive([])

// Kategorien beim ersten Laden und bei Änderungen synchronisieren
watch(
  () => props.categories,
  (newCategories) => {
    localCategories.splice(0, localCategories.length, ...newCategories.map(cat => ({ ...cat })))
  },
  { immediate: true }
)

function toggleCategory(category) {
  const found = localCategories.find(c => c.id === category.id)
  if (found) {
    found.active = !found.active
  }
}

function close() {
  emit('close')
}

function apply() {
  const selectedCategories = localCategories.filter(c => c.active)
  emit('update:selected', selectedCategories)
  emit('close')
}
</script>