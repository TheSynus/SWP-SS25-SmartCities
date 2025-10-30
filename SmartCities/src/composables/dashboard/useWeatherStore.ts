import axios from 'axios'
import { ref } from 'vue'

/** ---------- Wind-Teil (für WindWidget.vue) ---------- */
export type CurrentWind = {
  wind_kph: number          // km/h
  gust_kph: number          // km/h
  wind_deg: number          // 0..360
  wind_dir: string          // z.B. "SSW"
  timestamp: string         // "YYYY-MM-DD HH:mm"
}
export type WeatherWindPayload = {
  current: CurrentWind
}

/** Alias, damit bestehende Imports wie `WeatherPayload` weiterhin funktionieren */
export type WeatherPayload = WeatherWindPayload

export const weatherData = ref<WeatherWindPayload | null>(null)
export const weatherIsLoading = ref<boolean>(false)
export const weatherError = ref<string | null>(null)

/** ---------- Wetter-Teil (für WeatherWidget.vue) ---------- */
export type CurrentWeather = {
  temp: number
  temp_feels_like: number
  wind_speed: number
  wind_deg: number
  sky: string
  weather_icon: string
  timestamp: string
}
export type HourItem = {
  time: string        // "YYYY-MM-DD HH:mm"
  temp_c: number
  sky: string
  weather_icon: string
}
export type TodayHiLo = {
  high_c?: number
  low_c?: number
}
export type WeatherFullPayload = {
  current: CurrentWeather
  today: TodayHiLo
  next12: HourItem[]
}

export const weatherFullData = ref<WeatherFullPayload | null>(null)
export const weatherFullIsLoading = ref<boolean>(false)
export const weatherFullError = ref<string | null>(null)

/** ---------- API-Calls ---------- */
export function useWeatherStore() {
  /** Winddaten laden (für WindWidget) */
  const getCurrentWind = async () => {
    weatherIsLoading.value = true
    weatherError.value = null
    try {
      const url = `${import.meta.env.VITE_API_URL}/weather/call`
      const { data } = await axios.get<WeatherWindPayload>(url)
      weatherData.value = data
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Winddaten:', error)
      weatherError.value = error?.message ?? 'Unbekannter Fehler'
      throw error
    } finally {
      weatherIsLoading.value = false
    }
  }

  /** Vollständige Wetterdaten laden (für WeatherWidget) */
  const getWeather = async () => {
    weatherFullIsLoading.value = true
    weatherFullError.value = null
    try {
      const url = `${import.meta.env.VITE_API_URL}/weather/call`
      const { data } = await axios.get<WeatherFullPayload>(url)
      weatherFullData.value = data
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Wetterdaten:', error)
      weatherFullError.value = error?.message ?? 'Unbekannter Fehler'
      throw error
    } finally {
      weatherFullIsLoading.value = false
    }
  }

  return {
    getCurrentWind,
    getWeather,
  }
}
