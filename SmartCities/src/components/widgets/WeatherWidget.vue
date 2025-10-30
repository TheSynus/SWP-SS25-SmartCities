<script setup lang="ts">
import { computed, onMounted } from 'vue'
import {
  useWeatherStore,
  weatherFullData,
  weatherFullIsLoading,
  weatherFullError,
} from '../../composables/dashboard/useWeatherStore'

const { getWeather } = useWeatherStore()

const current = computed(() => weatherFullData.value?.current)
const today = computed(() => weatherFullData.value?.today)
const next12 = computed(() => weatherFullData.value?.next12 ?? [])
const isLoading = weatherFullIsLoading
const error = weatherFullError

function formatTime(ts: string) {
  const d = new Date(ts.replace(' ', 'T'))
  return d.toLocaleTimeString('de-DE', { hour: '2-digit' }).replace(':00', '')
}

onMounted(getWeather)
</script>

<template>
  <section class="w-full max-w-full ">
    <div class="flex items-start justify-between">
      <div>
        <div class="mt-0.5 text-6xl font-bold leading-none">
          <span v-if="current">{{ Math.round(current.temp) }}</span>
          <span class="align-top text-3xl">°</span>
        </div>
      </div>

      <div class="flex flex-col items-end gap-1">
        <img v-if="current" :src="current.weather_icon" :alt="current.sky" class="w-12 h-12" />
        <div class="text-xs opacity-80">
          H: {{ today?.high_c?.toFixed(0) ?? '-' }}°
          &nbsp;&nbsp; T: {{ today?.low_c?.toFixed(0) ?? '-' }}°
        </div>
      </div>
    </div>

    <div class="mt-4 -mx-1">
      <div class="flex overflow-x-auto gap-3 snap-x snap-mandatory pb-1 px-1" style="-webkit-overflow-scrolling: touch;">
        <div v-for="h in next12" :key="h.time" class="basis-1/6 shrink-0 grow-0 snap-start px-2 py-3 text-center">
          <img :src="h.weather_icon" :alt="h.sky" class="mx-auto w-7 h-7 mb-1.5" />
          <div class="text-base font-semibold">{{ Math.round(h.temp_c) }}°</div>
          <div class="text-xs opacity-80 mt-0.5">{{ formatTime(h.time) }}</div>
        </div>
      </div>
    </div>

    <div class="mt-3 text-[11px] opacity-70">
      Stand: {{ current?.timestamp
        ? new Date(current.timestamp.replace(' ', 'T')).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr'
        : '-' }}
    </div>

    <div v-if="isLoading" class="mt-2 text-xs text-gray-300">Lade Wetterdaten…</div>
    <div v-if="error" class="mt-2 text-xs text-red-300">Fehler: {{ error }}</div>
  </section>
</template>
