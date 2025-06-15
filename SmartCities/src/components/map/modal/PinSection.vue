<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white">
      Pin-Markierung
    </h3>

    <!-- Eingabemethode auswählen -->
    <div class="flex space-x-4">
      <label class="flex items-center">
        <input
          type="radio"
          value="address"
          v-model="inputMethod"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Adresse eingeben
        </span>
      </label>
      <label class="flex items-center">
        <input
          type="radio"
          value="coordinates"
          v-model="inputMethod"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          Koordinaten eingeben
        </span>
      </label>
      <label class="flex items-center">
        <input
          type="radio"
          value="csv"
          v-model="inputMethod"
          class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <span class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          CSV-Upload
        </span>
      </label>
    </div>

    <!-- Adresseingabe -->
    <div v-if="inputMethod === 'address'" class="space-y-4">
      <div>
        <label for="address-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Adresse
        </label>
        <div class="relative">
          <input
            id="address-input"
            type="text"
            v-model="addressInput"
            @input="onAddressInput"
            @keydown.enter.prevent="searchAddress"
            placeholder="z.B. Hauptstraße 1, 12345 Berlin"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <button
            type="button"
            @click="searchAddress"
            :disabled="!addressInput.trim() || isSearching"
            class="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-white bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg v-if="isSearching" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Suchergebnisse -->
      <div v-if="searchResults.length > 0" class="space-y-2">
        <label class="block text-sm font-medium text-gray-900 dark:text-white">
          Gefundene Adressen:
        </label>
        <div class="max-h-48 overflow-y-auto space-y-1">
          <button
            type="button"
            v-for="(result, index) in searchResults"
            :key="index"
            @click="selectAddress(result)"
            class="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div class="font-medium">{{ result.display_name }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Lat: {{ result.lat }}, Lng: {{ result.lon }}
            </div>
          </button>
        </div>
      </div>

      <!-- Ausgewählte Adresse -->
      <div v-if="selectedAddress" class="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-700">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <div>
            <div class="text-sm font-medium text-green-800 dark:text-green-200">
              Adresse ausgewählt
            </div>
            <div class="text-sm text-green-700 dark:text-green-300">
              {{ selectedAddress.display_name }}
            </div>
            <div class="text-xs text-green-600 dark:text-green-400 mt-1">
              Koordinaten: {{ coordinates.lat }}, {{ coordinates.lng }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Koordinaten-Eingabe (ursprünglich) -->
    <div v-if="inputMethod === 'coordinates'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="latitude" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Breitengrad (Latitude)
        </label>
        <input
          id="latitude"
          type="number"
          step="any"
          v-model.number="coordinates.lat"
          placeholder="z.B. 52.5200"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div>
        <label for="longitude" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Längengrad (Longitude)
        </label>
        <input
          id="longitude"
          type="number"
          step="any"
          v-model.number="coordinates.lng"
          placeholder="z.B. 13.4050"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
    </div>

    <!-- CSV Upload -->
    <div v-if="inputMethod === 'csv'" class="space-y-4">
      <div>
        <label for="csv-file" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          CSV-Datei mit Pins
        </label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          @change="handleCsvUpload"
          class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        />
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-300">
          CSV sollte Spalten für Titel, Adresse/Koordinaten und Beschreibung enthalten
        </p>
      </div>

      <!-- CSV Vorschau -->
      <div v-if="csvPins.length > 0" class="space-y-2">
        <label class="block text-sm font-medium text-gray-900 dark:text-white">
          Vorschau ({{ csvPins.length }} Pins):
        </label>
        <div class="max-h-32 overflow-y-auto">
          <div
            v-for="(pin, index) in csvPins.slice(0, 5)"
            :key="index"
            class="text-sm p-2 bg-gray-50 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {{ pin.title || `Pin ${index + 1}` }} - {{ pin.lat }}, {{ pin.lng }}
          </div>
          <div v-if="csvPins.length > 5" class="text-sm text-gray-500 dark:text-gray-400 p-2">
            ... und {{ csvPins.length - 5 }} weitere
          </div>
        </div>
      </div>
    </div>

    <!-- Beschreibung (für einzelne Pins) -->
    <div v-if="inputMethod !== 'csv'">
      <label for="description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Beschreibung (optional)
      </label>
      <textarea
        id="description"
        v-model="description"
        rows="3"
        placeholder="Zusätzliche Informationen zum Pin..."
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  coordinates: {
    type: Object,
    default: () => ({ lat: null, lng: null })
  },
  description: {
    type: String,
    default: ''
  },
  csvPins: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:coordinates', 'update:description', 'update:csvPins', 'error'])

// Lokale reactive Daten
const inputMethod = ref('address')
const addressInput = ref('')
const searchResults = ref([])
const selectedAddress = ref(null)
const isSearching = ref(false)

// Computed properties für v-model
const coordinates = computed({
  get: () => props.coordinates,
  set: (value) => emit('update:coordinates', value)
})

const description = computed({
  get: () => props.description,
  set: (value) => emit('update:description', value)
})

const csvPins = computed({
  get: () => props.csvPins,
  set: (value) => emit('update:csvPins', value)
})

// Adresssuche mit Nominatim API (OpenStreetMap)
async function searchAddress() {
  if (!addressInput.value.trim()) return
  
  isSearching.value = true
  searchResults.value = []
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput.value)}&limit=5&addressdetails=1`
    )
    
    if (!response.ok) {
      throw new Error('Fehler bei der Adresssuche')
    }
    
    const results = await response.json()
    searchResults.value = results
    
    if (results.length === 0) {
      emit('error', 'Keine Adresse gefunden. Bitte versuchen Sie eine andere Eingabe.')
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    emit('error', 'Fehler bei der Adresssuche. Bitte versuchen Sie es erneut.')
  } finally {
    isSearching.value = false
  }
}

// Adresse aus Suchergebnissen auswählen
function selectAddress(result) {
  selectedAddress.value = result
  coordinates.value = {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon)
  }
  searchResults.value = []
  addressInput.value = result.display_name
}

// Debounced Address Input
let searchTimeout
function onAddressInput() {
  clearTimeout(searchTimeout)
  selectedAddress.value = null
  searchResults.value = []
  
  // Reset coordinates when typing
  if (inputMethod.value === 'address') {
    coordinates.value = { lat: null, lng: null }
  }
}

// CSV Upload Handler
function handleCsvUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const csv = e.target.result
      const lines = csv.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const pins = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',')
        if (values.length < 2) continue
        
        const pin = {}
        headers.forEach((header, index) => {
          pin[header] = values[index]?.trim()
        })
        
        // Versuche Koordinaten zu extrahieren
        if (pin.lat && pin.lng) {
          pins.push({
            title: pin.title || pin.name || 'Unbenannter Pin',
            lat: parseFloat(pin.lat),
            lng: parseFloat(pin.lng),
            description: pin.description || pin.desc || ''
          })
        } else if (pin.address) {
          // Hier könnte man auch Adressen aus CSV geocoden
          emit('error', 'CSV mit Adressen wird noch nicht unterstützt. Bitte verwenden Sie Koordinaten (lat, lng).')
          return
        }
      }
      
      if (pins.length === 0) {
        emit('error', 'Keine gültigen Pins in der CSV-Datei gefunden.')
        return
      }
      
      csvPins.value = pins
    } catch (error) {
      console.error('CSV parsing error:', error)
      emit('error', 'Fehler beim Lesen der CSV-Datei.')
    }
  }
  
  reader.readAsText(file)
}

// Reset bei Methodenwechsel
watch(inputMethod, (newMethod) => {
  if (newMethod === 'address') {
    coordinates.value = { lat: null, lng: null }
    addressInput.value = ''
    selectedAddress.value = null
    searchResults.value = []
  } else if (newMethod === 'coordinates') {
    selectedAddress.value = null
    searchResults.value = []
  } else if (newMethod === 'csv') {
    coordinates.value = { lat: null, lng: null }
    selectedAddress.value = null
    searchResults.value = []
  }
})
</script>