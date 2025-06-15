// composables/useMarkerAPI.js
import { ref } from 'vue'

export function useMarkerAPI() {
  const loading = ref(false)
  const error = ref(null)
  
  // API Base URL - später durch echte Backend-URL ersetzen
  const API_BASE_URL = 'https://api.your-backend.com'
  
  // Auth Token Helper (für später)
  function getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  // Dummy Daten
  const dummyCategories = [
    { 
      id: 1, 
      name: 'Restaurants', 
      color: '#FF6B6B', 
      icon: 'utensils',
      count: 25
    },
    { 
      id: 2, 
      name: 'Hotels', 
      color: '#4ECDC4', 
      icon: 'bed',
      count: 12
    },
    { 
      id: 3, 
      name: 'Sehenswürdigkeiten', 
      color: '#45B7D1', 
      icon: 'camera',
      count: 18
    },
    { 
      id: 4, 
      name: 'Shopping', 
      color: '#96CEB4', 
      icon: 'shopping-bag',
      count: 8
    },
    { 
      id: 5, 
      name: 'Nightlife', 
      color: '#FFEAA7', 
      icon: 'music',
      count: 15
    },
    { 
      id: 6, 
      name: 'Transport', 
      color: '#DDA0DD', 
      icon: 'car',
      count: 6
    },
    { 
      id: 7, 
      name: 'Gesundheit', 
      color: '#74B9FF', 
      icon: 'heart',
      count: 10
    },
    { 
      id: 8, 
      name: 'Sport & Freizeit', 
      color: '#00B894', 
      icon: 'activity',
      count: 14
    }
  ]

  const dummyMarkers = [
    {
      id: 1,
      name: 'Hamburger Rathaus',
      description: 'Historisches Rathaus im Zentrum Hamburgs mit beeindruckender Architektur',
      categoryId: 3,
      coordinates: { lat: 53.5511, lng: 9.9937 },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      userId: 1,
      isPublic: true,
      tags: ['historisch', 'architektur', 'zentrum']
    },
    {
      id: 2,
      name: 'Miniatur Wunderland',
      description: 'Die größte Modelleisenbahn der Welt in der Speicherstadt',
      categoryId: 3,
      coordinates: { lat: 53.5438, lng: 9.9881 },
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z',
      userId: 1,
      isPublic: true,
      tags: ['familie', 'unterhaltung', 'speicherstadt']
    },
    {
      id: 3,
      name: 'Zur Letzten Instanz',
      description: 'Traditionelles deutsches Restaurant mit regionaler Küche',
      categoryId: 1,
      coordinates: { lat: 53.5489, lng: 9.9892 },
      createdAt: '2024-01-13T19:30:00Z',
      updatedAt: '2024-01-13T19:30:00Z',
      userId: 2,
      isPublic: true,
      tags: ['deutsch', 'traditional', 'gemütlich']
    },
    {
      id: 4,
      name: 'Hotel Atlantic',
      description: 'Luxushotel an der Außenalster mit Blick aufs Wasser',
      categoryId: 2,
      coordinates: { lat: 53.5578, lng: 10.0067 },
      createdAt: '2024-01-12T16:45:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
      userId: 1,
      isPublic: true,
      tags: ['luxus', 'alster', 'business']
    },
    {
      id: 5,
      name: 'Hauptbahnhof Hamburg',
      description: 'Zentraler Bahnhof der Stadt mit Verbindungen in alle Richtungen',
      categoryId: 6,
      coordinates: { lat: 53.5528, lng: 10.0067 },
      createdAt: '2024-01-11T12:15:00Z',
      updatedAt: '2024-01-11T12:15:00Z',
      userId: 3,
      isPublic: true,
      tags: ['transport', 'zentral', 'bahnhof']
    },
    {
      id: 6,
      name: 'Mönckebergstraße',
      description: 'Haupteinkaufsstraße Hamburgs mit vielen Geschäften',
      categoryId: 4,
      coordinates: { lat: 53.5511, lng: 10.0000 },
      createdAt: '2024-01-10T15:20:00Z',
      updatedAt: '2024-01-10T15:20:00Z',
      userId: 2,
      isPublic: true,
      tags: ['shopping', 'zentrum', 'einkaufen']
    },
    {
      id: 7,
      name: 'Reeperbahn',
      description: 'Hamburgs berühmte Amüsiermeile mit Bars und Clubs',
      categoryId: 5,
      coordinates: { lat: 53.5496, lng: 9.9599 },
      createdAt: '2024-01-09T22:00:00Z',
      updatedAt: '2024-01-09T22:00:00Z',
      userId: 1,
      isPublic: true,
      tags: ['nightlife', 'entertainment', 'st-pauli']
    },
    {
      id: 8,
      name: 'Speicherstadt',
      description: 'UNESCO-Welterbe und größter Lagerhauskomplex der Welt',
      categoryId: 3,
      coordinates: { lat: 53.5438, lng: 9.9881 },
      createdAt: '2024-01-08T11:00:00Z',
      updatedAt: '2024-01-08T11:00:00Z',
      userId: 3,
      isPublic: true,
      tags: ['unesco', 'historisch', 'hafencity']
    },
    {
      id: 9,
      name: 'Planten un Blomen',
      description: 'Großer Stadtpark mit botanischen Gärten und Wasserspielen',
      categoryId: 8,
      coordinates: { lat: 53.5606, lng: 9.9822 },
      createdAt: '2024-01-07T14:30:00Z',
      updatedAt: '2024-01-07T14:30:00Z',
      userId: 2,
      isPublic: true,
      tags: ['park', 'natur', 'erholung']
    },
    {
      id: 10,
      name: 'Universitätsklinikum Hamburg',
      description: 'Großes Universitätskrankenhaus mit allen Fachbereichen',
      categoryId: 7,
      coordinates: { lat: 53.5969, lng: 9.9689 },
      createdAt: '2024-01-06T09:00:00Z',
      updatedAt: '2024-01-06T09:00:00Z',
      userId: 1,
      isPublic: true,
      tags: ['medizin', 'notfall', 'universitätsklinikum']
    }
  ]

  // Marker abrufen
  async function fetchMarkers(filters = {}) {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API Call - später durch echten Fetch ersetzen
      await new Promise(resolve => setTimeout(resolve, 800))
      
      /* 
      // Später zu verwenden:
      const queryParams = new URLSearchParams()
      
      if (filters.query) queryParams.append('query', filters.query)
      if (filters.categoryIds?.length) queryParams.append('categoryIds', filters.categoryIds.join(','))
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder)
      if (filters.limit) queryParams.append('limit', filters.limit)
      if (filters.offset) queryParams.append('offset', filters.offset)
      
      const response = await fetch(`${API_BASE_URL}/markers?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.markers || data
      */
      
      // Dummy Daten filtern
      let filteredMarkers = [...dummyMarkers]
      
      // Kategorie-Filter
      if (filters.categoryIds?.length) {
        filteredMarkers = filteredMarkers.filter(marker => 
          filters.categoryIds.includes(marker.categoryId)
        )
      }
      
      // Such-Filter
      if (filters.query) {
        const query = filters.query.toLowerCase()
        filteredMarkers = filteredMarkers.filter(marker =>
          marker.name.toLowerCase().includes(query) ||
          marker.description?.toLowerCase().includes(query) ||
          marker.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // Sortierung
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'name':
            filteredMarkers.sort((a, b) => a.name.localeCompare(b.name))
            break
          case 'date':
            filteredMarkers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            break
          case 'category':
            filteredMarkers.sort((a, b) => a.categoryId - b.categoryId)
            break
        }
        
        if (filters.sortOrder === 'desc') {
          filteredMarkers.reverse()
        }
      }
      
      // Pagination
      if (filters.limit) {
        const offset = filters.offset || 0
        filteredMarkers = filteredMarkers.slice(offset, offset + filters.limit)
      }
      
      console.log('Marker erfolgreich geladen:', filteredMarkers)
      return filteredMarkers
      
    } catch (err) {
      error.value = 'Fehler beim Laden der Marker'
      console.error('Fehler beim Laden der Marker:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Kategorien abrufen
  async function fetchCategories() {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API Call - später durch echten Fetch ersetzen
      await new Promise(resolve => setTimeout(resolve, 500))
      
      /* 
      // Später zu verwenden:
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.categories || data
      */
      
      console.log('Kategorien erfolgreich geladen:', dummyCategories)
      return dummyCategories
      
    } catch (err) {
      error.value = 'Fehler beim Laden der Kategorien'
      console.error('Fehler beim Laden der Kategorien:', err)
      
      // Fallback Kategorien bei Fehler
      const fallbackCategories = [
        { id: 1, name: 'Alle', color: '#6B7280', icon: 'globe', count: 0 }
      ]
      
      return fallbackCategories
      
    } finally {
      loading.value = false
    }
  }

  // Einzelnen Marker abrufen
  async function fetchMarker(id) {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API Call - später durch echten Fetch ersetzen
      await new Promise(resolve => setTimeout(resolve, 400))
      
      /* 
      // Später zu verwenden:
      const response = await fetch(`${API_BASE_URL}/markers/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.marker || data
      */
      
      const marker = dummyMarkers.find(m => m.id === parseInt(id))
      
      if (!marker) {
        throw new Error('Marker nicht gefunden')
      }
      
      console.log('Marker erfolgreich geladen:', marker)
      return marker
      
    } catch (err) {
      error.value = 'Fehler beim Laden des Markers'
      console.error('Fehler beim Laden des Markers:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Marker erstellen
  async function createMarker(markerData) {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API Call - später durch echten Fetch ersetzen
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      /* 
      // Später zu verwenden:
      const response = await fetch(`${API_BASE_URL}/markers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(markerData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.marker || data
      */
      
      // Dummy Marker erstellen
      const newMarker = {
        id: Date.now(), // Temporäre ID
        ...markerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 1, // Dummy User ID
        isPublic: markerData.isPublic || false
      }
      
      // Zu Dummy-Daten hinzufügen (nur für Demo)
      dummyMarkers.push(newMarker)
      
      console.log('Marker erfolgreich erstellt:', newMarker)
      return newMarker
      
    } catch (err) {
      error.value = 'Fehler beim Erstellen des Markers'
      console.error('Fehler beim Erstellen des Markers:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Marker aktualisieren
  async function updateMarker(id, markerData) {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API Call - später durch echten Fetch ersetzen
      await new Promise(resolve => setTimeout(resolve, 800))
      
      /* 
      // Später zu verwenden:
      const response = await fetch(`${API_BASE_URL}/markers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(markerData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data.marker || data
      */
      
      // Dummy Marker aktualisieren
      const markerIndex = dummyMarkers.findIndex(m => m.id === parseInt(id))
      
      if (markerIndex === -1) {
        throw new Error('Marker nicht gefunden')
      }
      
      const updatedMarker = {
        ...dummyMarkers[markerIndex],
        ...markerData,
        updatedAt: new Date().toISOString()
      }
      
      dummyMarkers[markerIndex] = updatedMarker
      
      console.log('Marker erfolgreich aktualisiert:', updatedMarker)
      return updatedMarker
      
    } catch (err) {
      error.value = 'Fehler beim Aktualisieren des Markers'
      console.error('Fehler beim Aktualisieren des Markers:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Marker löschen
  async function deleteMarker(id) {
    loading.value = true
    error.value = null
    
    try {
      // Simuliere API Call - später durch echten Fetch ersetzen
      await new Promise(resolve => setTimeout(resolve, 600))
      
      /* 
      // Später zu verwenden:
      const response = await fetch(`${API_BASE_URL}/markers/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      */
      
      // Dummy Marker löschen
      const markerIndex = dummyMarkers.findIndex(m => m.id === parseInt(id))
      
      if (markerIndex === -1) {
        throw new Error('Marker nicht gefunden')
      }
      
      dummyMarkers.splice(markerIndex, 1)
      
      console.log('Marker erfolgreich gelöscht:', id)
      return { success: true, message: 'Marker erfolgreich gelöscht' }
      
    } catch (err) {
      error.value = 'Fehler beim Löschen des Markers'
      console.error('Fehler beim Löschen des Markers:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchMarkers,
    fetchCategories,
    fetchMarker,
    createMarker,
    updateMarker,
    deleteMarker,
    // Für Development/Testing
    dummyMarkers,
    dummyCategories
  }
}