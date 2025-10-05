<script setup lang="ts">
import { ninaWarnings, useNinaStore } from '@/composables/dashboard/useNinaStore'
import { onMounted } from 'vue'

interface Props {
  heading: string
  disabled?: boolean
  showDeleteButton?: boolean
}

const { getNinaWarnings } = useNinaStore()

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showDeleteButton: false,
})

onMounted(() => {
  getNinaWarnings()
})
</script>

<template>
  <div class="relative">
    <!-- Wrapper für relative Positionierung -->
    <div
      class="block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
      :class="{
        'opacity-50 cursor-not-allowed hover:bg-white dark:hover:bg-gray-800': props.disabled,
      }"
    >
      <!-- Header mit Heading und Warnungsanzahl -->
      <div class="flex justify-between items-start mb-4">
        <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {{ props.heading }}
        </h5>
        <p
          v-if="ninaWarnings.length > 0"
          class="font-normal text-gray-700 dark:text-gray-400 text-sm ml-4"
        >
          {{ ninaWarnings.length }} {{ ninaWarnings.length === 1 ? 'Warnung' : 'Warnungen' }}
        </p>
      </div>

      <!-- Warnungen Liste -->
      <div v-if="ninaWarnings.length > 0" class="space-y-0">
        <a
          v-for="(warning, index) in ninaWarnings"
          :key="warning.url"
          :href="warning.url"
          target="_blank"
          class="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border-b border-gray-200 dark:border-gray-600"
          :class="{
            'pointer-events-none': props.disabled,
            'border-b-0': index === ninaWarnings.length - 1,
          }"
        >
          <span>{{ warning.headline }}</span>
          <svg
            class="w-4 h-4 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m9 5 7 7-7 7"
            />
          </svg>
        </a>
      </div>

      <!-- Keine Warnungen vorhanden -->
      <div v-else class="text-sm text-gray-500 dark:text-gray-400">
        Es liegen keine Warnungen vor.
      </div>

      <!-- Disabled Meldung -->
      <div v-if="props.disabled" class="mt-4 pt-3 border-t border-gray-300 dark:border-gray-600">
        <p class="text-sm text-red-500 dark:text-red-400 font-medium">Bereits vorhanden</p>
      </div>
    </div>
  </div>
</template>
