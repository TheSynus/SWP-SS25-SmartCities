<template>
  <div class="space-y-4">
    <div>
      <label for="geojson-file" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        GeoJSON Datei hochladen <span class="text-red-500">*</span>
      </label>
      <input
        type="file"
        id="geojson-file"
        ref="geojsonFileInput"
        @change="handleGeoJsonUpload"
        accept=".geojson,.json"
        class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2.5"
      />
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
        Unterstützte Formate: .geojson, .json
      </p>
    </div>
    
    <!-- GeoJSON Vorschau -->
    <div v-if="geoJsonData" class="p-4 bg-gray-50 rounded-lg dark:bg-gray-600">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">GeoJSON Vorschau:</h4>
      <div class="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded border max-h-32 overflow-y-auto">
        <pre>{{ JSON.stringify(geoJsonData, null, 2).substring(0, 500) }}{{ JSON.stringify(geoJsonData, null, 2).length > 500 ? '...' : '' }}</pre>
      </div>
      <p class="text-sm text-green-600 dark:text-green-400 mt-2">
        ✓ GeoJSON erfolgreich geladen ({{ getGeoJsonFeatureCount() }} Features)
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  geoJsonData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:geoJsonData', 'error'])

const geojsonFileInput = ref(null)

function handleGeoJsonUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const geoJson = JSON.parse(e.target.result)
      
      // Basic GeoJSON validation
      if (!geoJson.type || !geoJson.features) {
        throw new Error('Ungültiges GeoJSON Format')
      }
      
      emit('update:geoJsonData', geoJson)
      emit('error', '')
    } catch (error) {
      emit('error', 'Fehler beim Laden der GeoJSON Datei: ' + error.message)
      emit('update:geoJsonData', null)
    }
  }
  reader.readAsText(file)
}

function getGeoJsonFeatureCount() {
  if (!props.geoJsonData || !props.geoJsonData.features) {
    return 0
  }
  return props.geoJsonData.features.length
}

defineExpose({
  resetFileInput: () => {
    if (geojsonFileInput.value) {
      geojsonFileInput.value.value = ''
    }
  }
})
</script>