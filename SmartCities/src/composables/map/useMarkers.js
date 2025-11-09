// composables/useMarkers.js
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export function useMarkers() {
  // State
  const markers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const searchQuery = ref('')
  const selectedCategory = ref(null) // Kategorie-ID oder null für alle

  /*##########################
    Helper Functions
  ##########################*/
  const handleError = (err) => {
    if (err.response && err.response.data) {
      error.value = err.response.data.error || err.response.data.message
    } else {
      error.value = err.message || 'Unbekannter Fehler'
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
  const fetchMarker = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.get(`${API_URL}/marker/${id}`)
      return res.data // einzelner Marker
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
  const createMarker = async (markerData) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.post(`${API_URL}/marker`, markerData)

      // Backend liefert kein Marker-Objekt zurück, daher reload nötig:
      if (res.status === 201) {
        await fetchMarkers()
      }

      return true
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
  const updateMarker = async (id, markerData) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.patch(`${API_URL}/marker/${id}`, markerData)

      // Backend liefert kein Objekt zurück → neu laden
      if (res.status === 200) {
        await fetchMarkers()
      }

      return true
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
  const deleteMarker = async (id) => {
    loading.value = true
    error.value = null
    try {
      const res = await axios.delete(`${API_URL}/marker/${id}`)
      if (res.status === 200 || res.status === 204) {
        markers.value = markers.value.filter((m) => m.id !== id)
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
    Filtered & Searched Markers
  ##########################*/
  const filteredMarkers = computed(() => {
    return markers.value.filter((m) => {
      const matchesCategory =
        selectedCategory.value === null || m.category_id === selectedCategory.value
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      return matchesCategory && matchesSearch
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
