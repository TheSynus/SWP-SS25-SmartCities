<template>
  <form @submit.prevent="$emit('submit')" class="space-y-6">
    <!-- Grundinformationen -->
    <BasicInfoSection
      v-model:title="localData.title"
      v-model:category-id="localData.categoryId"
      v-model:appointment-id="localData.appointmentId"
      :categories="categories"
      :appointments="appointments"
    />

    <!-- Markierungstyp -->
    <MarkerTypeSelector v-model:type="localData.type" />

    <!-- Bereich Eingabe (GeoJSON) -->
    <GeoJsonSection
      v-if="localData.type === 'area'"
      v-model:geo-json-data="localData.geoJsonData"
      @error="$emit('error', $event)"
    />

    <!-- Pin Eingabe -->
    <PinSection
      v-if="localData.type === 'pin'"
      v-model:coordinates="localData.coordinates"
      v-model:description="localData.description"
      v-model:csv-pins="localData.csvPins"
      @error="$emit('error', $event)"
    />

    <!-- Error Messages -->
    <div v-if="errorMessage" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
      {{ errorMessage }}
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue'
import BasicInfoSection from './BasicInfoSection.vue'
import MarkerTypeSelector from './MarkerTypeSelector.vue'
import GeoJsonSection from './GeoJsonSection.vue'
import PinSection from './PinSection.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  appointments: {
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