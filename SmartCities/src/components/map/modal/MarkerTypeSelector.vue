<template>
  <div>
    <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      Markierungstyp <span class="text-red-500">*</span>
    </label>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex items-center p-4 border border-gray-200 rounded-lg dark:border-gray-700">
        <input
          id="type-area"
          type="radio"
          value="area"
          :checked="type === 'area'"
          @change="$emit('update:type', $event.target.value)"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label for="type-area" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Bereich (GeoJSON)
        </label>
      </div>
      <div class="flex items-center p-4 border border-gray-200 rounded-lg dark:border-gray-700">
        <input
          id="type-pin"
          type="radio"
          value="pin"
          :checked="type === 'pin'"
          @change="$emit('update:type', $event.target.value)"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label for="type-pin" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Pin/Punkte
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'pin'
  }
})

defineEmits(['update:type'])
</script>