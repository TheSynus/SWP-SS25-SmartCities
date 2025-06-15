<template>
  <div class="space-y-4">
    <div>
      <label for="csv-file" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        CSV Datei hochladen <span class="text-red-500">*</span>
      </label>
      <input
        type="file"
        id="csv-file"
        ref="csvFileInput"
        @change="handleCsvUpload"
        accept=".csv"
        class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2.5"
      />
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
        CSV Format: lat, lng, title, description (Header erforderlich)
      </p>
    </div>
    
    <!-- CSV Vorschau -->
    <div v-if="csvPins.length > 0" class="p-4 bg-gray-50 rounded-lg dark:bg-gray-600">
      <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
        CSV Vorschau ({{ csvPins.length }} Pins):
      </h4>
      <div class="max-h-32 overflow-y-auto">
        <table class="w-full text-xs text-gray-600 dark:text-gray-300">
          <thead>
            <tr class="border-b dark:border-gray-500">
              <th class="text-left p-1">Lat</th>
              <th class="text-left p-1">Lng</th>
              <th class="text-left p-1">Titel</th>
              <th class="text-left p-1">Beschreibung</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pin, index) in csvPins.slice(0, 5)" :key="index" class="border-b dark:border-gray-700">
              <td class="p-1">{{ pin.lat }}</td>
              <td class="p-1">{{ pin.lng }}</td>
              <td class="p-1">{{ pin.title || '-' }}</td>
              <td class="p-1">{{ pin.description || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="csvPins.length > 5" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          ...und {{ csvPins.length - 5 }} weitere Pins
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  csvPins: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:csvPins', 'error'])

const csvFileInput = ref(null)

function handleCsvUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const csvText = e.target.result
      const lines = csvText.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV muss mindestens Header und eine Datenzeile enthalten')
      }
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['lat', 'lng']
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        throw new Error(`Fehlende CSV Header: ${missingHeaders.join(', ')}`)
      }
      
      const pins = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length < headers.length) continue
        
        const pin = {}
        headers.forEach((header, index) => {
          if (header === 'lat' || header === 'lng') {
            pin[header] = parseFloat(values[index])
            if (isNaN(pin[header])) {
              throw new Error(`Ungültige Koordinaten in Zeile ${i + 1}`)
            }
          } else {
            pin[header] = values[index] || ''
          }
        })
        
        pins.push(pin)
      }
      
      emit('update:csvPins', pins)
      emit('error', '')
    } catch (error) {
      emit('error', 'Fehler beim Laden der CSV Datei: ' + error.message)
      emit('update:csvPins', [])
    }
  }
  reader.readAsText(file)
}

defineExpose({
  resetFileInput: () => {
    if (csvFileInput.value) {
      csvFileInput.value.value = ''
    }
  }
})
</script>