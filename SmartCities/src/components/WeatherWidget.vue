<!-- WeatherWidget.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

type CurrentWeather = {
  temp: number
  temp_feels_like: number
  wind_speed: number
  wind_deg: number
  sky: string
  weather_icon: string
  timestamp: string
}

type HourItem = {
  time: string        // "YYYY-MM-DD HH:mm"
  temp_c: number
  sky: string
  weather_icon: string
}

type TodayHiLo = {
  high_c?: number
  low_c?: number
}


type Payload = {
  current: CurrentWeather
  today: TodayHiLo
  next12: HourItem[]
}

const isLoading = ref(true)
const error = ref<string | null>(null)
const data = ref<Payload | null>(null)

async function fetchWeather() {
  isLoading.value = true
  error.value = null
  try {
    const { data: payload } = await axios.get<Payload>(
      `${import.meta.env.VITE_API_URL}/weather/call`
    )
    data.value = payload
  } catch (e: any) {
    error.value = e?.message ?? 'Unbekannter Fehler'
  } finally {
    isLoading.value = false
  }
}

function formatTime(ts: string) {
  // "YYYY-MM-DD HH:mm" -> "HH Uhr"
  const d = new Date(ts.replace(' ', 'T'))
  return d.toLocaleTimeString('de-DE', { hour: '2-digit' }).replace(':00', '')
}

onMounted(fetchWeather)
</script>

<template>
  <!-- Kachel: volle Breite des Containers, keine Überläufe -->
  <section class="w-full max-w-full ">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <div class="mt-0.5 text-6xl font-bold leading-none">
          <span v-if="data">{{ Math.round(data.current.temp) }}</span>
          <span class="align-top text-3xl">°</span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-1">
        <img
          v-if="data"
          :src="data.current.weather_icon"
          :alt="data.current.sky"
          class="w-12 h-12"
        />
        <div class="text-xs opacity-80">
          H: {{ data?.today.high_c?.toFixed(0) ?? '-' }}°
          &nbsp;&nbsp; T: {{ data?.today.low_c?.toFixed(0) ?? '-' }}°
        </div>
      </div>
    </div>

    <!-- Forecast: horizontales Scrollen; kompaktere Items -->
    <div class="mt-4 -mx-1"> <!-- negative Margin = randloser Scroll innerhalb der Kachel -->
      <div
        class="flex overflow-x-auto gap-3 snap-x snap-mandatory pb-1 px-1"
        style="-webkit-overflow-scrolling: touch;"
      >
        <div
          v-for="h in data?.next12 || []"
          :key="h.time"
          class="basis-1/6 shrink-0 grow-0 snap-start px-2 py-3 text-center"
        >
          <img :src="h.weather_icon" :alt="h.sky" class="mx-auto w-7 h-7 mb-1.5" />
          <div class="text-base font-semibold">{{ Math.round(h.temp_c) }}°</div>
          <div class="text-xs opacity-80 mt-0.5">{{ formatTime(h.time) }}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-3 text-[11px] opacity-70">
      Stand: {{ data?.current.timestamp
        ? new Date(data.current.timestamp.replace(' ', 'T')).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' } ) + ' Uhr'
        : '-' }}
    </div>

    <div v-if="isLoading" class="mt-2 text-xs text-gray-300">Lade Wetterdaten…</div>
    <div v-if="error" class="mt-2 text-xs text-red-300">Fehler: {{ error }}</div>
  </section>
</template>


<style scoped>
/* Optional: schönerer Scrollbar-Look (nur Webkit-Browser) */
div::-webkit-scrollbar {
  height: 8px;
}
div::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
}
</style>
