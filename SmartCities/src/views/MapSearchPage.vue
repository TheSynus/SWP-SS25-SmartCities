<!-- MapSearchPage.vue - WURZEL KOMPONENTE mit zentraler API-Verwaltung -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-14 sm:pt-16 lg:pt-18">
   
    <!-- Main Content Container -->
    <div class="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] lg:h-[calc(100vh-4.5rem)] flex flex-col lg:flex-row">
     

    

      <!-- Map Section -->
      <MapSection
        :show="!showNewMarkerModal"
        :markers="searchResults"
        :categories="categories"
        :selected-marker="selectedMarker"
        :loading="markersLoading"
        @marker-selected="handleMarkerSelected"
        @map-click="handleMapClick"
      />
     
      <!-- Sidebar Section -->
      <SidebarSection
        :is-modal-open="showNewMarkerModal"
        :query="query"
        :categories="categories"
        :search-results="searchResults"
        :selected-categories="selectedCategories"
        :loading="markersLoading"
        :total-results="totalResults"
        @search="handleSearch"
        @filter-update="handleFilterUpdate"
        @result-select="handleResultSelect"
        @new-marker="openNewMarker"
        @category-editor="openCategoryEditor"
        @retry="handleRetry"
        @clear-filters="handleClearFilters"
      />
    </div>
    
    <!-- New Marker Modal -->
    <NewMarkerModal
      :show="showNewMarkerModal"
      :categories="categories"
      modal-id="new-marker-modal"
      @close="closeNewMarkerModal"
      @submit="handleNewMarker"
    />

    <!-- Category Editor Modal -->
    <CategoryEditorModal
      :isVisible="showCategoryEditor"
      :categories="categories"
      :selectedCategory="selectedCategory"
      @close="closeCategoryEditor"
    />

    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MapSection from '../components/map/MapSection.vue'
import SidebarSection from '../components/map/SidebarSection.vue'
import NewMarkerModal from '../components/map/modal/MarkerModal.vue'
import CategoryEditorModal from '../components/calendar/ui/CategoryManagementModal.vue';

import { useCategories } from '../composables/map/useCategories'
import { useMarkers } from '../composables/map/useMarkers'
import { useMarkerAPI } from '../composables/map/useMarkerAPI'


// Composables verwenden
const { categories, loadCategories } = useCategories()
const { createMarker } = useMarkers()
const { loading: markersLoading, error: markersError, fetchMarkers } = useMarkerAPI()



// Reactive state
const query = ref('')
const searchResults = ref([])
const totalResults = ref(0)
const selectedCategories = ref([])
const selectedMarker = ref(null)
const selectedMapCoordinates = ref(null)
const showNewMarkerModal = ref(false)
const showCategoryEditor = ref(false)
const selectedCategory = ref(null)

// Sort options (können später als Props oder aus Settings kommen)
const sortBy = ref('date')
const sortOrder = ref('desc')
const limit = ref(null)

// API Methods - Zentrale Suchfunktion
async function loadMarkers() {
  try {
    const filters = {
      query: query.value || undefined,
      categoryIds: selectedCategories.value
        .filter(cat => cat.active)
        .map(cat => cat.id),
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      limit: limit.value
    }
    
    // Entferne leere Filter
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || 
          (Array.isArray(filters[key]) && filters[key].length === 0)) {
        delete filters[key]
      }
    })
    
    console.log('Lade Marker mit Filtern:', filters)
    
    const fetchedResults = await fetchMarkers(filters)
    searchResults.value = fetchedResults
    totalResults.value = fetchedResults.length // In echter API würde das separat kommen
    
  } catch (err) {
    console.error('Fehler beim Laden der Marker:', err)
    searchResults.value = []
    totalResults.value = 0
  }
}


// Event handlers
function handleSearch(searchQuery) {
  query.value = searchQuery
  // loadMarkers wird durch watcher ausgelöst
}

function handleFilterUpdate(updatedCategories) {
  selectedCategories.value = updatedCategories
  // loadMarkers wird durch watcher ausgelöst
}

function handleResultSelect(item) {
  console.log('Selected result:', item)
  selectedMarker.value = item
  // Hier können Sie die Karte zu diesem Ergebnis navigieren
}

function handleMarkerSelected(marker) {
  console.log('Marker selected on map:', marker)
  selectedMarker.value = marker
  // Synchronisation zwischen Karte und Sidebar
}

function handleMapClick(coordinates) {
  console.log('Map clicked at coordinates:', coordinates)
  selectedMapCoordinates.value = coordinates
  
  // Optional: Automatisch neuen Marker öffnen
  // openNewMarker()
}

function handleRetry() {
  console.log('Retry wurde ausgelöst')
  loadMarkers()
}

function handleClearFilters() {
  // Filter zurücksetzen
  selectedCategories.value = selectedCategories.value.map(cat => ({
    ...cat,
    active: true
  }))
  query.value = ''
  selectedMarker.value = null
}

function openNewMarker(coordinates = null) {
  if (coordinates) {
    selectedMapCoordinates.value = coordinates
  }
  showNewMarkerModal.value = true
}

function closeNewMarkerModal() {
  showNewMarkerModal.value = false
  selectedMapCoordinates.value = null
}

function openCategoryEditor() {
  showCategoryEditor.value = true
}

function closeCategoryEditor () {
  showCategoryEditor.value = false
}

async function handleNewMarker(markerData) {

  try {
    const markerWithCoordinates = {
      ...markerData,
      coordinates: selectedMapCoordinates.value || markerData.coordinates
    }
    
    const newMarkers = await createMarker(markerWithCoordinates)
   
    showNewMarkerModal.value = false
    selectedMapCoordinates.value = null
   
    const markerCount = newMarkers.length
    const markerType = markerData.type === 'area' ? 'Bereich' : 'Pin(s)'
    showToast(`${markerCount} ${markerType} erfolgreich erstellt!`)
    
    // Ergebnisse neu laden um neue Marker anzuzeigen
    await loadMarkers()
   
  } catch (error) {
    console.error('Error creating marker:', error)
    showToast('Fehler beim Erstellen der Markierung!')
  }
}

// Watchers - Neu laden wenn sich Filter ändern
watch([
  () => query.value,
  () => selectedCategories.value,
  () => sortBy.value,
  () => sortOrder.value
], () => {
  loadMarkers()
}, { 
  deep: true,
  immediate: false
})

// Kategorien laden und selectedCategories initialisieren
watch(categories, (newCategories) => {
  if (newCategories.length > 0 && selectedCategories.value.length === 0) {
    selectedCategories.value = newCategories.map(cat => ({
      ...cat,
      active: true
    }))
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  await loadCategories()
  // Initial load wird durch watcher ausgelöst sobald categories geladen sind
})
</script>