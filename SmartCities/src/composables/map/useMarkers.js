// composables/map/useMarkers.js
import { ref, computed } from 'vue'

export function useMarkers() {
  const markers = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Mock-Daten für Markierungen
  const mockMarkers = [
    {
      id: 1,
      name: 'Ratskeller Hamburg',
      categoryId: 1,
      type: 'point',
      coordinates: { lat: 53.5511, lng: 9.9937 },
      description: 'Traditionelles Restaurant im Hamburger Rathaus',
      address: 'Große Johannisstraße 2, 20457 Hamburg',
      rating: 4.2,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Hotel Atlantic',
      categoryId: 2,
      type: 'point',
      coordinates: { lat: 53.5753, lng: 10.0153 },
      description: 'Luxushotel an der Außenalster',
      address: 'An der Alster 72-79, 20099 Hamburg',
      rating: 4.8,
      createdAt: new Date('2024-01-20')
    },
    {
      id: 3,
      name: 'Speicherstadt',
      categoryId: 3,
      type: 'area',
      coordinates: [
        { lat: 53.5448, lng: 9.9805 },
        { lat: 53.5438, lng: 9.9888 },
        { lat: 53.5421, lng: 9.9875 },
        { lat: 53.5431, lng: 9.9792 }
      ],
      description: 'UNESCO-Weltkulturerbe',
      address: 'Speicherstadt, 20457 Hamburg',
      rating: 4.7,
      createdAt: new Date('2024-01-25')
    },
    {
      id: 4,
      name: 'Planten un Blomen',
      categoryId: 5,
      type: 'area',
      coordinates: [
        { lat: 53.5607, lng: 9.9825 },
        { lat: 53.5634, lng: 9.9901 },
        { lat: 53.5589, lng: 9.9943 },
        { lat: 53.5562, lng: 9.9867 }
      ],
      description: 'Großer Stadtpark mit Wasserspielen',
      address: 'Marseiller Str., 20355 Hamburg',
      rating: 4.5,
      createdAt: new Date('2024-02-01')
    }
  ]

  // Computed property für alle Ergebnisse (für Sidebar)
  const allResults = computed(() => {
    return markers.value.map(marker => ({
      id: marker.id,
      name: marker.name,
      categoryId: marker.categoryId,
      type: marker.type,
      description: marker.description,
      address: marker.address,
      rating: marker.rating,
      coordinates: marker.coordinates
    }))
  })

  const loadMarkers = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 300))
      markers.value = [...mockMarkers]
    } catch (err) {
      error.value = err.message
      console.error('Fehler beim Laden der Markierungen:', err)
    } finally {
      loading.value = false
    }
  }

  const createMarker = async (markerData) => {
    try {
      const newMarkers = []
      
      if (markerData.type === 'point') {
        // Einzelner Punkt
        const newMarker = {
          id: Date.now(),
          ...markerData,
          createdAt: new Date()
        }
        markers.value.push(newMarker)
        newMarkers.push(newMarker)
      } else if (markerData.type === 'area') {
        // Bereich mit mehreren Koordinaten
        const newMarker = {
          id: Date.now(),
          ...markerData,
          createdAt: new Date()
        }
        markers.value.push(newMarker)
        newMarkers.push(newMarker)
      }
      
      return newMarkers
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateMarker = async (id, updates) => {
    try {
      const index = markers.value.findIndex(marker => marker.id === id)
      if (index !== -1) {
        markers.value[index] = { ...markers.value[index], ...updates }
        return markers.value[index]
      }
      throw new Error('Markierung nicht gefunden')
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteMarker = async (id) => {
    try {
      const index = markers.value.findIndex(marker => marker.id === id)
      if (index !== -1) {
        markers.value.splice(index, 1)
        return true
      }
      throw new Error('Markierung nicht gefunden')
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getMarkersByCategory = (categoryId) => {
    return markers.value.filter(marker => marker.categoryId === categoryId)
  }

  return {
    markers,
    allResults,
    loading,
    error,
    loadMarkers,
    createMarker,
    updateMarker,
    deleteMarker,
    getMarkersByCategory
  }
}