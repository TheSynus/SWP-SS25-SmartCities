<script setup lang="ts">
import WeatherWidget from './WeatherWidget.vue'
import WindWidget from './WindWidget.vue'

interface Props {
  heading: string
  disabled?: boolean
  showDeleteButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showDeleteButton: false,
})
</script>

<template>
  <!-- Wrapper für relative Positionierung -->
  <div
    class="block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
    :class="{
      'opacity-50 cursor-not-allowed hover:bg-white dark:hover:bg-gray-800': props.disabled,
    }"
  >
    <div class="flex justify-between">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {{ props.heading }}
      </h5>
    </div>

    <WeatherWidget></WeatherWidget>

    <!-- Disabled Meldung -->
    <div v-if="props.disabled" class="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
      <p class="text-sm text-red-500 dark:text-red-400 font-medium">Bereits vorhanden</p>
    </div>
  </div>
</template>
