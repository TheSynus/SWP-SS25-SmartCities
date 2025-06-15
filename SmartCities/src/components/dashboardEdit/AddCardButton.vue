<script setup lang="ts">
// Event definieren
const emit = defineEmits<{
  click: []
}>()

// Click Handler
const handleClick = () => {
  emit('click')
}
</script>

<template>
  <button
    @click="handleClick"
    class="flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
    type="button"
    title="Karte hinzufügen"
  >
    <svg
      class="w-6 h-6"
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
        d="M5 12h14m-7-7v14"
      />
    </svg>
  </button>
</template>
