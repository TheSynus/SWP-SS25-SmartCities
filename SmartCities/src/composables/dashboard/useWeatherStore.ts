import axios from 'axios'
import { ref } from 'vue'

export type CurrentWind = {
  wind_kph: number          // km/h
  gust_kph: number          // km/h
  wind_deg: number          // 0..360 (aus welcher Richtung)
  wind_dir: string          // z.B. "SSW"
  timestamp: string         // "YYYY-MM-DD HH:mm"
}

export type WeatherPayload = {
  current: CurrentWind
}

// Zustand (ähnlich wie im Nina-Beispiel)
export const weatherData = ref<WeatherPayload | null>(null)
export const weatherIsLoading = ref<boolean>(false)
export const weatherError = ref<string | null>(null)

export function useWeatherStore() {
  const getCurrentWind = async () => {
    weatherIsLoading.value = true
    weatherError.value = null

    try {
      const url = `${import.meta.env.VITE_API_URL}/weather/call`
      const { data } = await axios.get<WeatherPayload>(url)

      // Optionales Logging
      // console.log('Weather', data)

      weatherData.value = data
    } catch (error: any) {
      console.error('Fehler beim Abrufen der Winddaten:', error)
      weatherError.value = error?.message ?? 'Unbekannter Fehler'
      throw error
    } finally {
        console.log('Weather http done')
      weatherIsLoading.value = false
    }
  }

  return {
    getCurrentWind,
  }
}
