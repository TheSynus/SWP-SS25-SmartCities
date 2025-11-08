<template>
  <form @submit.prevent="$emit('submit')" class="space-y-6">
    <!-- Name -->
    <div>
      <label
        for="marker-name"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Name der Markierung <span class="text-red-500">*</span>
      </label>
      <input
        id="marker-name"
        v-model="localData.name"
        type="text"
        required
        placeholder="z.B. Hamburger Rathaus"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
               focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
               dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400
               dark:text-white"
      />
    </div>

    <!-- Description -->
    <div>
      <label
        for="marker-description"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Beschreibung
      </label>
      <textarea
        id="marker-description"
        v-model="localData.description"
        rows="3"
        placeholder="Zusätzliche Informationen zur Markierung..."
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
               focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
               dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400
               dark:text-white"
      ></textarea>
    </div>

    <!-- Category -->
    <div>
      <label
        for="marker-category"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Kategorie <span class="text-red-500">*</span>
      </label>
      <select
        id="marker-category"
        v-model="localData.category_id"
        required
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
               focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
               dark:bg-gray-600 dark:border-gray-500 dark:text-white"
      >
        <option :value="null" disabled>Bitte wählen Sie eine Kategorie</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.title }}
        </option>
      </select>
    </div>

    <!-- Coordinates -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label
          for="marker-latitude"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Breitengrad (Latitude) <span class="text-red-500">*</span>
        </label>
        <input
          id="marker-latitude"
          v-model.number="localData.latitude"
          type="number"
          step="any"
          required
          placeholder="z.B. 53.551086"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400
                 dark:text-white"
        />
      </div>

      <div>
        <label
          for="marker-longitude"
          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Längengrad (Longitude) <span class="text-red-500">*</span>
        </label>
        <input
          id="marker-longitude"
          v-model.number="localData.longitude"
          type="number"
          step="any"
          required
          placeholder="z.B. 9.993682"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
                 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400
                 dark:text-white"
        />
      </div>
    </div>

    <!-- Is Public -->
    <div class="flex items-center">
      <input
        id="marker-public"
        v-model="localData.is_public"
        type="checkbox"
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded
               focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800
               focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label
        for="marker-public"
        class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
      >
        Öffentlich sichtbar
      </label>
    </div>

    <!-- Hint when coordinates are from map -->
    <div
      v-if="localData.latitude && localData.longitude"
      class="p-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
    >
      <span class="font-medium">Tipp:</span> Die Koordinaten wurden automatisch von der Karte übernommen.
      Sie können diese bei Bedarf manuell anpassen.
    </div>

    <!-- Error Messages -->
    <div
      v-if="errorMessage"
      class="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
    >
      {{ errorMessage }}
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'error'])

const localData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
