// composables/useMarkers.js
import { ref, computed } from 'vue'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

interface Marker {
  id: number
  category_id: number | null
  name: string
  description: string

  // Map-related
  latitude?: string | number | null
  longitude?: string | number | null

  // Metadata
  is_public?: boolean
  created_at?: string | null
}
export function useMarkers() {
  // State
  const markers = ref<Marker[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const searchQuery = ref('')
  const selectedCategory = ref(null)

  /*##########################
    Helper Functions
  ##########################*/
  const handleError = (err: unknown) => {
    const defaultMsg = 'Unbekannter Fehler'

    if (axios.isAxiosError(err) && err.response?.data) {
      const data = err.response.data as { error?: string; message?: string }
      error.value = data.error ?? data.message ?? defaultMsg
    } else if (err instanceof Error) {
      error.value = err.message || defaultMsg
    } else {
      error.value = defaultMsg
    }

    console.error('API Error:', error.value)
  }

  /*##########################
    Fetch All Markers
  ##########################*/
  const fetchMarkers = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`${API_URL}/marker`)
      markers.value = res.data
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Fetch Single Marker by ID
  ##########################*/
  const fetchMarker = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`${API_URL}/marker/${id}`)
      return res.data as Marker
    } catch (err) {
      handleError(err)
      return null
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Create Marker
  ##########################*/
  const createMarker = async (markerData: Marker) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_URL}/marker`, markerData)

      if (res.status === 201 && res.data) {
        await fetchMarkers()
        return true
      }
      return false
    } catch (err) {
      handleError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Update Marker
  ##########################*/
  const updateMarker = async (id: number, markerData: Marker) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.patch(`${API_URL}/marker/${id}`, markerData)

      if (res.status === 200 && res.data) {
        await fetchMarkers()
        return true
      }
      return false
    } catch (err) {
      handleError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Delete Marker
  ##########################*/
  const deleteMarker = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.delete(`${API_URL}/marker/${id}`)

      if (res.status === 204 || res.status === 200) {
        markers.value = markers.value.filter((m: Marker) => m.id !== id)
        return true
      }
      return false
    } catch (err) {
      handleError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  /*##########################
    Computed: Filtered Markers
  ##########################*/
  const filteredMarkers = computed(() => {
    const query = searchQuery.value.toLowerCase()
    const category = selectedCategory.value

    return markers.value.filter((marker) => {
      const matchesQuery =
        !query ||
        marker.name.toLowerCase().includes(query) ||
        marker.description.toLowerCase().includes(query)

      const matchesCategory =
        !category || marker.category_id === category

      return matchesQuery && matchesCategory
    })
  })

  return {
    // State
    markers,
    loading,
    error,
    searchQuery,
    selectedCategory,
    filteredMarkers,

    // Actions
    fetchMarkers,
    fetchMarker,
    createMarker,
    updateMarker,
    deleteMarker,
  }
}