<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'


interface WeatherData {
  temp: number
  temp_feels_like: number
  wind_speed: number
  wind_deg: number
  sky: string
  weather_icon: string
  timestamp: string
}

const isLoading = ref(true)
const error = ref<string | null>(null)
const weatherData = ref<WeatherData | null>(null)

async function fetchWeather() {
  isLoading.value = true
  error.value = null

  try {
    console.log('[WeatherWidget] Starte Wetter-Abfrage...')
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/weather/call`)

    if (!response.data) {
      throw new Error(`HTTP Error ${response.status}`)
    }

    const data = await response.data()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Leere Wetterdaten empfangen')
    }

    weatherData.value = data[0]
    console.log('[WeatherWidget] Wetterdaten empfangen:', data[0])
  } catch (err: any) {
    console.error('[WeatherWidget] Fehler beim Laden:', err)
    error.value = err.message || 'Unbekannter Fehler'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchWeather)
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-gray-500 dark:text-gray-400">Lade Wetterdaten...</div>
    <div v-else-if="error" class="text-red-500 dark:text-red-400">Fehler: {{ error }}</div>
    <div v-else-if="weatherData" class="flex flex-col items-start space-y-2">
      <div class="flex items-center space-x-4">
        <img
          :src="`https://openweathermap.org/img/wn/${weatherData.weather_icon}@2x.png`"
          :alt="weatherData.sky"
          class="w-12 h-12"
        />
        <div>
          <p class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ weatherData.temp.toFixed(1) }}°C
          </p>
          <p class="text-sm text-gray-700 dark:text-gray-400 capitalize">
            {{ weatherData.sky }}
          </p>
        </div>
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        Gefühlte Temperatur: {{ weatherData.temp_feels_like.toFixed(1) }}°C<br />
        Wind: {{ weatherData.wind_speed }} m/s ({{ weatherData.wind_deg }}°)
      </div>
      <div class="text-xs text-gray-400 mt-2">
        Stand: {{ new Date(weatherData.timestamp).toLocaleTimeString() }}
      </div>
    </div>
  </div>
</template>
