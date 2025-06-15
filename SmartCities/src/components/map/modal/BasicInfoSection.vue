<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Titel -->
    <div>
      <label for="title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Titel <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="title"
        :value="title"
        @input="$emit('update:title', $event.target.value)"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        placeholder="Markierung Titel"
        required
      />
    </div>
    
    <!-- Kategorie -->
    <div>
      <label for="category" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Kategorie <span class="text-red-500">*</span>
      </label>
      <select
        id="category"
        :value="categoryId"
        @change="$emit('update:categoryId', $event.target.value)"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        required
      >
        <option value="">Kategorie wählen</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>
  </div>

  <!-- Optionaler Termin -->
  <div class="mt-6">
    <label for="appointment" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
      Termin verknüpfen (optional)
    </label>
    <select
      id="appointment"
      :value="appointmentId"
      @change="$emit('update:appointmentId', $event.target.value)"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
    >
      <option value="">Kein Termin</option>
      <option
        v-for="appointment in appointments"
        :key="appointment.id"
        :value="appointment.id"
      >
        {{ appointment.title }} - {{ formatDate(appointment.date) }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  categoryId: {
    type: [String, Number],
    default: ''
  },
  appointmentId: {
    type: [String, Number],
    default: ''
  },
  categories: {
    type: Array,
    default: () => []
  },
  appointments: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:title', 'update:categoryId', 'update:appointmentId'])

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('de-DE')
}
</script>