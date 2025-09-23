<script setup lang="ts">
import WeatherWidget from './WeatherWidget.vue'

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
    class="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6"
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
