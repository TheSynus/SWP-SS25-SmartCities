<script setup lang="ts">
interface Props {
  heading: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="block max-w-sm p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
  >
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
      {{ props.heading }}
    </h5>
    <p class="font-normal text-gray-700 dark:text-gray-400">
      Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse
      chronological order.
    </p>
  </div>
</template>
