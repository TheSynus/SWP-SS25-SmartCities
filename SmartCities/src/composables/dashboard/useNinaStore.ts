import type { NinaWarning } from '@/models/nina'
import axios from 'axios'
import { ref } from 'vue'

export const ninaWarnings = ref<NinaWarning[]>([])

export function useNinaStore() {
  const getNinaWarnings = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/nina/call`
      const response = await axios.get(url)

      console.log('Nina', response.data)

      ninaWarnings.value = response.data
    } catch (error) {
      console.error('Fehler beim Abrufen der Nina Warnings:', error)
      throw error
    }
  }

  return {
    getNinaWarnings,
  }
}
