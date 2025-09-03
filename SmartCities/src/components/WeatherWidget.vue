<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface CurrentWeather {
  temp: number
  temp_feels_like: number
  wind_speed: number
  wind_deg: number
  sky: string
  weather_icon: string
  timestamp: string
}

interface HourForecast {
  time: string            // ISO-like "YYYY-MM-DD HH:mm"
  temp_c: number
  wind_ms: number
  wind_deg: number
  chance_of_rain: number
  sky: string
  weather_icon: string
}

interface DaySummary {
  date: string            // "YYYY-MM-DD"
  maxtemp_c: number
  mintemp_c: number
  avgtemp_c: number
  chance_of_rain: number
  sky: string
  weather_icon: string
}

interface ForecastDay {
  date: string
  day: DaySummary
  hours: HourForecast[]
}

interface WeatherPayload {
  current: CurrentWeather
  forecast: ForecastDay[]
}

const isLoading = ref(true)
const error = ref<string | null>(null)
const data = ref<WeatherPayload | null>(null)
const expandedDay = ref<string | null>(null)

async function fetchWeather() {
  isLoading.value = true
  error.value = null

  try {
    console.log('[WeatherWidget] Starte Wetter-Abfrage...')
    const { data: payload } = await axios.get<WeatherPayload>(
      `${import.meta.env.VITE_API_URL}/weather/call`
    )

    if (!payload || !payload.current || !Array.isArray(payload.forecast)) {
      throw new Error('Ungültige Wetterdaten empfangen')
    }

    data.value = payload
    console.log('[WeatherWidget] Wetterdaten empfangen:', payload)
  } catch (err: any) {
    console.error('[WeatherWidget] Fehler beim Laden:', err)
    error.value = err?.message ?? 'Unbekannter Fehler'
  } finally {
    isLoading.value = false
  }
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit'
  })
}

function formatTime(ts: string) {
  // ts ist "YYYY-MM-DD HH:mm"
  const d = new Date(ts.replace(' ', 'T'))
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function toggleHours(date: string) {
  expandedDay.value = expandedDay.value === date ? null : date
}

onMounted(fetchWeather)
</script>

<template>
  <div>
    <div v-if="isLoading" class="text-gray-500 dark:text-gray-400">
      Lade Wetterdaten...
    </div>

    <div v-else-if="error" class="text-red-500 dark:text-red-400">
      Fehler: {{ error }}
    </div>

    <div v-else-if="data" class="space-y-4">
      <!-- Aktuell -->
      <div class="flex flex-col items-start space-y-2">
        <div class="flex items-center space-x-4">
          <img
            :src="data.current.weather_icon"
            :alt="data.current.sky"
            class="w-12 h-12"
          />
          <div>
            <p class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ data.current.temp.toFixed(1) }}°C
            </p>
            <p class="text-sm text-gray-700 dark:text-gray-400 capitalize">
              {{ data.current.sky }}
            </p>
          </div>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Gefühlte Temperatur: {{ data.current.temp_feels_like.toFixed(1) }}°C<br />
          Wind: {{ data.current.wind_speed.toFixed(1) }} m/s ({{ data.current.wind_deg }}°)
        </div>
        <div class="text-xs text-gray-400 mt-2">
          Stand: {{ new Date(data.current.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) }}
        </div>
      </div>

      <!-- 3-Tage-Übersicht -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          v-for="d in data.forecast"
          :key="d.date"
          class="rounded-xl border border-gray-200 dark:border-gray-800 p-3 hover:shadow-sm transition"
        >
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium text-gray-800 dark:text-gray-200">
              {{ formatDay(d.date) }}
            </div>
            <img :src="d.day.weather_icon" :alt="d.day.sky" class="w-10 h-10" />
          </div>
          <div class="mt-2 text-sm text-gray-700 dark:text-gray-300">
            <div class="flex items-baseline space-x-2">
              <span class="text-lg font-semibold">{{ d.day.maxtemp_c.toFixed(1) }}°</span>
              <span class="opacity-70">/ {{ d.day.mintemp_c.toFixed(1) }}°</span>
            </div>
            <div class="capitalize">{{ d.day.sky }}</div>
            <div class="opacity-80">Regenrisiko: {{ d.day.chance_of_rain }}%</div>
          </div>
          <button
            class="mt-3 text-xs underline text-blue-600 dark:text-blue-400"
            @click="toggleHours(d.date)"
          >
            {{ expandedDay === d.date ? 'Stunden verbergen' : 'Stunden anzeigen' }}
          </button>

          <div v-if="expandedDay === d.date" class="mt-3 space-y-2 max-h-64 overflow-auto pr-1">
            <div
              v-for="h in d.hours"
              :key="h.time"
              class="flex items-center justify-between text-xs border-b border-gray-100 dark:border-gray-800 pb-2"
            >
              <div class="w-14 shrink-0">{{ formatTime(h.time) }}</div>
              <div class="flex items-center space-x-2 grow px-2">
                <img :src="h.weather_icon" :alt="h.sky" class="w-6 h-6" />
                <span class="capitalize truncate">{{ h.sky }}</span>
              </div>
              <div class="w-12 text-right">{{ h.temp_c.toFixed(0) }}°C</div>
              <div class="w-16 text-right">{{ h.wind_ms.toFixed(1) }} m/s</div>
              <div class="w-10 text-right">{{ h.chance_of_rain }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
