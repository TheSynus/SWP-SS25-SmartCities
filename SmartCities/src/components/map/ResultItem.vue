<template>
  <li
    class="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200
           hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600
           dark:hover:bg-gray-600 transition-colors cursor-pointer hover:shadow-sm"
    @click="$emit('click')"
  >
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <!-- Marker Name -->
      <span class="text-gray-900 dark:text-white font-medium text-sm sm:text-base">
        {{ item.name }}
      </span>

      <!-- Category Badge with Color -->
      <span
        v-if="category"
        class="text-xs text-white px-3 py-1 rounded-full self-start sm:self-center font-medium"
        :style="{ backgroundColor: category.color || '#808080' }"
      >
        {{ category.title }}
      </span>
      <span
        v-else
        class="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600
               px-2 py-1 rounded-full self-start sm:self-center"
      >
        Unbekannt
      </span>
    </div>

    <!-- Additional Info -->
    <div
      v-if="item.description || item.latitude || item.is_public"
      class="mt-2 space-y-1"
    >
      <!-- Description -->
      <p v-if="item.description" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
        {{ item.description }}
      </p>

      <!-- Coordinates -->
      <p v-if="item.latitude && item.longitude" class="text-xs text-gray-500 dark:text-gray-500">
        📍 {{ parseFloat(item.latitude).toFixed(4) }}, {{ parseFloat(item.longitude).toFixed(4) }}</p>

      <!-- Public Badge -->
      <div v-if="item.is_public" class="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
        </svg>
        <span>Öffentlich</span>
      </div>

      <!-- Created Date -->
      <p v-if="item.created_at" class="text-xs text-gray-400 dark:text-gray-500">
        Erstellt: {{ formatDate(item.created_at) }}
      </p>
    </div>
  </li>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  category: {
    type: [Object, null],
    default: null
  }
})

defineEmits(['click'])

// Helper: Format date
function formatDate(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return ''
  }
}
</script>

<style scoped>
/* Line clamp for description */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
