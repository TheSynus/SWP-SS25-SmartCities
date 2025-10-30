<!-- WindWidget.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  useWeatherStore,
  weatherData,
  weatherIsLoading,
  weatherError,
  type WeatherPayload
} from '../../composables/dashboard/useWeatherStore'

// Store-Funktion zum Laden
const { getCurrentWind } = useWeatherStore()

// Alias-Refs für Template-Komfort (optional)
const isLoading = weatherIsLoading
const error = weatherError
const data = weatherData as unknown as { value: WeatherPayload | null }

const windDeg = computed(() => data.value?.current.wind_deg ?? 0)
const windDirText = computed(() => data.value?.current.wind_dir ?? '-')
const windKph = computed(() =>
  data.value ? Math.round(data.value.current.wind_kph ?? 0) : 0
)
const gustKph = computed(() =>
  data.value ? Math.round(data.value.current.gust_kph ?? 0) : 0
)
const current = computed(() => data.value?.current ?? null)


function formatTimestamp(ts?: string) {
  if (!ts) return '-'
  const d = new Date(ts.replace(' ', 'T'))
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
}

onMounted(getCurrentWind)
</script>

<template>
  <section class="w-full max-w-full">
    <!-- Linke Spalte (Titel + Kästen) & rechter Kompass nebeneinander -->
    <div class="flex flex-col sm:flex-row items-start justify-between gap-6">
      <!-- Links: Titel + Karten -->
      <div class="flex-1">
        <div class="mt-4 flex flex-col gap-3 sm:max-w-xs">
          <!-- Geschwindigkeit -->
          <div class="rounded-xl bg-white/5 px-3 py-2">
            <div class="text-[11px] uppercase tracking-wide opacity-80">Geschwindigkeit</div>
            <div class="mt-0.5 text-xl font-semibold leading-tight">
              {{ windKph.toFixed(1) }} <span class="text-sm font-medium">km/h</span>
            </div>
          </div>

          <!-- Böen bis -->
          <div class="rounded-xl bg-white/5 px-3 py-2">
            <div class="text-[11px] uppercase tracking-wide opacity-80">Böen bis</div>
            <div class="mt-0.5 text-xl font-semibold leading-tight">
              {{ gustKph.toFixed(1) }} <span class="text-sm font-medium">km/h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rechts: Kompass (etwas tiefer gesetzt) -->
      <div class="relative sm:mt-8 lg:mt-10">
        <div class="relative w-28 h-28 rounded-full border border-white/20 grid place-items-center">
          <!-- Außenring -->
          <div class="absolute inset-[6px] rounded-full border border-white/10"></div>

          <!-- Himmelsrichtungen -->
          <span class="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] opacity-80">N</span>
          <span class="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] opacity-80">E</span>
          <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] opacity-80">S</span>
          <span class="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] opacity-80">W</span>

          <!-- Nadel -->
          <svg
            viewBox="0 0 100 100"
            class="w-24 h-24 text-white/90"
            :style="{ transform: `rotate(${windDeg}deg)` }"
          >
            <circle cx="50" cy="50" r="3.5" class="fill-white/80" />
            <polygon points="50,14 45,52 55,52" class="fill-white/90 transition-transform duration-500" />
            <polygon points="50,86 55,48 45,48" class="fill-white/40" />
          </svg>
        </div>

        <!-- Windrichtung-Label -->
        <div class="mt-2 text-right text-xs opacity-80">
          Richtung: <span class="font-semibold">{{ windDirText }}</span> ({{ windDeg }}°)
        </div>
      </div>
    </div>

    <!-- Footer -->
   <div class="mt-3 text-[11px] opacity-70">
     Stand: {{ current?.timestamp ? formatTimestamp(current.timestamp) : '-' }}
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
