<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Icon -->
    <div class="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <svg 
        v-if="type === 'no-results'"
        class="w-8 h-8 text-gray-400 dark:text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      
      <svg 
        v-else-if="type === 'no-markers'"
        class="w-8 h-8 text-gray-400 dark:text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      
      <svg 
        v-else
        class="w-8 h-8 text-gray-400 dark:text-gray-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
      {{ description }}
    </p>

    <!-- Action Button (optional) -->
    <button
      v-if="showAction"
      @click="$emit('action')"
      class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'no-results',
    validator: (value) => ['no-results', 'no-markers', 'empty', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: 'Try Again'
  },
  showAction: {
    type: Boolean,
    default: false
  }
})

defineEmits(['action'])

// Computed properties for default content based on type
const title = computed(() => {
  if (props.title) return props.title
  
  switch (props.type) {
    case 'no-results':
      return 'Keine Ergebnisse gefunden'
    case 'no-markers':
      return 'Keine Markierungen vorhanden'
    case 'error':
      return 'Fehler beim Laden'
    default:
      return 'Keine Daten verfügbar'
  }
})

const description = computed(() => {
  if (props.description) return props.description
  
  switch (props.type) {
    case 'no-results':
      return 'Versuchen Sie es mit anderen Suchbegriffen oder passen Sie Ihre Filter an.'
    case 'no-markers':
      return 'Fügen Sie Ihre erste Markierung hinzu, indem Sie auf die Karte klicken.'
    case 'error':
      return 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.'
    default:
      return 'Derzeit sind keine Daten verfügbar.'
  }
})
</script>