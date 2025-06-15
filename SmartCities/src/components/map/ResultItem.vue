<!-- ResultItem.vue -->

<template>
  <li
    class="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors cursor-pointer hover:shadow-sm"
    @click="$emit('click')"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <span class="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
        {{ item.name }}
      </span>
      <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full self-start sm:self-center">
        {{ categoryName }}
      </span>
    </div>
    
    <!-- Additional Info -->
    <div 
      v-if="item.description || item.coordinates" 
      class="mt-2 text-xs text-gray-600 dark:text-gray-400"
    >
      <p v-if="item.description" class="mb-1">
        {{ item.description }}
      </p>
      <p v-if="item.address" class="text-gray-500">
        {{ item.address}} 
      </p>
    </div>
  </li>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  },
  categoryName: {
    type: String,
    required: true
  }
})

defineEmits(['click'])
</script>