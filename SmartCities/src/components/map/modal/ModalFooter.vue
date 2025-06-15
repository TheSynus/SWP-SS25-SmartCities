<template>
  <div class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600 flex-shrink-0">
    <button
      type="button"
      @click="$emit('submit')"
      :disabled="!isFormValid"
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ submitText }}
    </button>
    <button
      type="button"
      @click="$emit('cancel')"
      class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
    >
      {{ cancelText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  isFormValid: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: 'Markierung erstellen'
  },
  cancelText: {
    type: String,
    default: 'Abbrechen'
  }
})

defineEmits(['submit', 'cancel'])
</script>