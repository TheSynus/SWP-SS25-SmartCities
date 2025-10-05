<script setup lang="ts">
interface Props {
  position?: 'fixed' | 'absolute' | 'relative' | 'sticky'
  activeTab?: string
}
const props = withDefaults(defineProps<Props>(), {
  position: 'fixed',
  activeTab: 'home',
})

const emit = defineEmits<{
  tabChange: [tabName: string]
}>()

const handleTabClick = (tabName: string) => {
  emit('tabChange', tabName)
}

const isActive = (tabName: string) => {
  return props.activeTab === tabName
}
</script>

<template>
  <div
    :class="[
      // Basis
      'inset-x-0 bottom-0 z-50 w-full h-16 border-t',
      // leichte Transparenz + Blur (nett, aber optional)
      'bg-white/90 dark:bg-gray-900/90 supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-gray-900/70 backdrop-blur',
      'border-gray-200 dark:border-gray-700',
      // Safe area
      'pb-[env(safe-area-inset-bottom)]',
      // Positionierung
      position === 'fixed'
        ? 'fixed'
        : position === 'absolute'
          ? 'absolute'
          : position === 'relative'
            ? 'relative'
            : position === 'sticky'
              ? 'sticky'
              : '',
    ]"
  >
    <div class="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
      <button
        type="button"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-white dark:hover:bg-gray-700 group"
        @click="handleTabClick('myCity')"
      >
        <svg
          class="w-5 h-5 mb-2 transition-colors duration-200"
          :class="
            isActive('myCity')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"
          />
        </svg>
        <span
          class="text-sm transition-colors duration-200"
          :class="
            isActive('myCity')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
        >
          Stadt
        </span>
      </button>

      <button
        type="button"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-white dark:hover:bg-gray-700 group"
        @click="handleTabClick('map')"
      >
        <svg
          class="w-5 h-5 mb-2 transition-colors duration-200"
          :class="
            isActive('map')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          />
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.8 13.938h-.011a7 7 0 1 0-11.464.144h-.016l.14.171c.1.127.2.251.3.371L12 21l5.13-6.248c.194-.209.374-.429.54-.659l.13-.155Z"
          />
        </svg>
        <span
          class="text-sm transition-colors duration-200"
          :class="
            isActive('map')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
        >
          Karte
        </span>
      </button>

      <button
        type="button"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-white dark:hover:bg-gray-700 group"
        @click="handleTabClick('calendar')"
      >
        <svg
          class="w-5 h-5 mb-2 transition-colors duration-200"
          :class="
            isActive('calendar')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
          />
        </svg>
        <span
          class="text-sm transition-colors duration-200"
          :class="
            isActive('calendar')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
        >
          Kalender
        </span>
      </button>

      <button
        type="button"
        class="inline-flex flex-col items-center justify-center px-5 hover:bg-white dark:hover:bg-gray-700 group"
        @click="handleTabClick('more')"
      >
        <svg
          class="w-5 h-5 mb-2 transition-colors duration-200"
          :class="
            isActive('more')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-width="2"
            d="M6 12h.01m6 0h.01m5.99 0h.01"
          />
        </svg>
        <span
          class="text-sm transition-colors duration-200"
          :class="
            isActive('more')
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500'
          "
        >
          mehr
        </span>
      </button>
    </div>
  </div>
</template>
