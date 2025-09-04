<!-- WindWidget.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

type CurrentWind = {
  wind_speed_ms: number     // m/s
  wind_kph: number          // km/h
  gust_ms: number           // m/s
  gust_kph: number          // km/h
  wind_deg: number          // 0..360 (aus welcher Richtung)
  wind_dir: string          // z.B. "SSW"
  timestamp: string         // "YYYY-MM-DD HH:mm"
}

type Payload = {
  current: CurrentWind
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

const windDeg = computed(() => data.value?.current.wind_deg ?? 0)
const windDirText = computed(() => data.value?.current.wind_dir ?? '-')
const windMs = computed(() =>
  data.value ? Math.round((data.value.current.wind_speed_ms ?? 0) * 10) / 10 : 0
)
const windKph = computed(() =>
  data.value ? Math.round(data.value.current.wind_kph ?? 0) : 0
)
const gustMs = computed(() =>
  data.value ? Math.round((data.value.current.gust_ms ?? 0) * 10) / 10 : 0
)
const gustKph = computed(() =>
  data.value ? Math.round(data.value.current.gust_kph ?? 0) : 0
)

function formatTimestamp(ts?: string) {
  if (!ts) return '-'
  const d = new Date(ts.replace(' ', 'T'))
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
}

onMounted(fetchWeather)
</script>

<template>
  <section class="w-full max-w-full">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <div class="text-sm uppercase tracking-wide opacity-80">Wind</div>
        <div class="mt-0.5 text-6xl font-bold leading-none">
          <span v-if="data">{{ windMs.toFixed(1) }}</span>
          <span class="align-top text-3xl">m/s</span>
        </div>
        <div class="mt-1 text-xs opacity-80">
          ≙ {{ windKph }} km/h
        </div>
      </div>

      <!-- Kompass -->
      <div class="relative">
        <div class="relative w-28 h-28 rounded-full border border-white/20 grid place-items-center">
          <!-- Außenring -->
          <div class="absolute inset-[6px] rounded-full border border-white/10"></div>

          <!-- Himmelsrichtungen -->
          <span class="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] opacity-80">N</span>
          <span class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] opacity-80">E</span>
          <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] opacity-80">S</span>
          <span class="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] opacity-80">W</span>

          <!-- Nadel (SVG rotiert um Mittelpunkt) -->
          <svg
            viewBox="0 0 100 100"
            class="w-24 h-24 text-white/90"
            :style="{ transform: `rotate(${windDeg}deg)` }"
          >
            <!-- Pivot -->
            <circle cx="50" cy="50" r="3.5" class="fill-white/80" />
            <!-- Nadel (nach oben zeigend, 0° = Norden) -->
            <polygon points="50,14 45,52 55,52" class="fill-white/90 transition-transform duration-500" />
            <!-- Gegengewicht -->
            <polygon points="50,86 55,48 45,48" class="fill-white/40" />
          </svg>
        </div>

        <!-- Windrichtung-Label -->
        <div class="mt-2 text-right text-xs opacity-80">
          Richtung: <span class="font-semibold">{{ windDirText }}</span> ({{ windDeg }}°)
        </div>
      </div>
    </div>

    <!-- Böen -->
    <div class="mt-4 grid grid-cols-2 gap-3">
      <div class="rounded-xl bg-white/5 px-3 py-2">
        <div class="text-[11px] uppercase tracking-wide opacity-80">Böen bis</div>
        <div class="mt-0.5 text-xl font-semibold leading-tight">
          {{ gustMs.toFixed(1) }} <span class="text-sm font-medium">m/s</span>
        </div>
        <div class="text-xs opacity-70">≙ {{ gustKph }} km/h</div>
      </div>

      <div class="rounded-xl bg-white/5 px-3 py-2">
        <div class="text-[11px] uppercase tracking-wide opacity-80">Mittelwind</div>
        <div class="mt-0.5 text-xl font-semibold leading-tight">
          {{ windMs.toFixed(1) }} <span class="text-sm font-medium">m/s</span>
        </div>
        <div class="text-xs opacity-70">≙ {{ windKph }} km/h</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-3 text-[11px] opacity-70">
      Stand: {{ data?.current.timestamp ? formatTimestamp(data.current.timestamp) : '-' }}
    </div>

    <div v-if="isLoading" class="mt-2 text-xs text-gray-300">Lade Winddaten…</div>
    <div v-if="error" class="mt-2 text-xs text-red-300">Fehler: {{ error }}</div>
  </section>
</template>

<style scoped>
/* Optional: subtiler Glow fürs Kompass-Zentrum */
svg circle {
  filter: drop-shadow(0 0 2px rgba(255,255,255,0.25));
}
</style>
