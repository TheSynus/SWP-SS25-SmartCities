<template>
  <div class="bg-gray-50 dark:bg-gray-900 pt-14 sm:pt-16 lg:pt-18 lg:flex lg:flex-1 lg:flex-row h-screen overflow-hidden">
    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      <!-- Map Section -->
      <MapSection
        :show="!showNewMarkerModal"
        :markers="customFilteredMarkers"
        :categories="categories"
        :selected-marker="selectedMarker"
        :loading="loading"
        @marker-selected="handleMarkerSelected"
        @map-click="handleMapClick"
      />
    </div>
    <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      <SidebarSection
        :is-modal-open="isSidebarMode"
        :query="searchQuery"
        :categories="categories"
        :search-results="customFilteredMarkers"
        :selected-categories="selectedCategoryIds"
        :loading="loading"
        :categories-loading="categoriesLoading"
        :categories-error="categoriesError"
        :total-results="customFilteredMarkers.length"
        @search="handleSearch"
        @filter-update="handleFilterUpdate"
        @result-select="handleResultSelect"
        @new-marker="openNewMarker"
        @category-editor="openCategoryEditor"
        @retry-categories="fetchCategories"
      />
    </div>

    <!-- New Marker Modal -->
    <NewMarkerModal
      :show="showNewMarkerModal"
      :categories="categories"
      :initial-coordinates="selectedMapCoordinates"
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
      @category-updated="handleCategoryUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MapSection from '../components/map/MapSection.vue'
import SidebarSection from '../components/map/SidebarSection.vue'
import NewMarkerModal from '../components/map/modal/MarkerModal.vue'
import CategoryEditorModal from '../components/calendar/ui/CategoryManagementModal.vue'

// Nur noch deine 2 Composables!
import { useCategories } from '../composables/map/useCategories'
import { useMarkers } from '../composables/map/useMarkers'

// Composables initialisieren
const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  fetchCategories
} = useCategories()

const {
  markers,
  loading: markersLoading,
  error: markersError,
  searchQuery,
  selectedCategory,
  filteredMarkers,
  fetchMarkers,
  createMarker,
  updateMarker,
  deleteMarker
} = useMarkers()

// Kombiniertes Loading
const loading = computed(() => categoriesLoading.value || markersLoading.value)

// Local State
const selectedCategoryIds = ref([]) // Array von aktiven Kategorie-IDs
const selectedMarker = ref(null)
const selectedMapCoordinates = ref(null)
const showNewMarkerModal = ref(false)
const showCategoryEditor = ref(false)

// Computed
const isSidebarMode = computed(() =>
  showNewMarkerModal.value || showCategoryEditor.value
)

// Event Handlers
function handleSearch(query) {
  searchQuery.value = query
}

function handleFilterUpdate(categoryIds) {
  // Wenn Array von IDs kommt
  if (Array.isArray(categoryIds)) {
    selectedCategoryIds.value = categoryIds
    // Wenn nur eine Kategorie ausgewählt ist, setze sie im Composable
    selectedCategory.value = categoryIds.length === 1 ? categoryIds[0] : null
  } else {
    // Fallback: wenn einzelne ID kommt
    selectedCategory.value = categoryIds
    selectedCategoryIds.value = categoryIds ? [categoryIds] : []
  }
}

function handleResultSelect(marker) {
  console.log('Selected result:', marker)
  selectedMarker.value = marker
}

function handleMarkerSelected(marker) {
  console.log('Marker selected on map:', marker)
  selectedMarker.value = marker
}

function handleMapClick(coordinates) {
  console.log('Map clicked at coordinates:', coordinates)
  selectedMapCoordinates.value = coordinates
  // Optional: Auto-open new marker modal
  // openNewMarker()
}

function handleCategoryUpdate() {
  // Kategorien neu laden nach Update
  fetchCategories()
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

function closeCategoryEditor() {
  showCategoryEditor.value = false
}

async function handleNewMarker(markerData) {
  try {
    // Datenformat für Backend vorbereiten
    const payload = {
      name: markerData.name,
      description: markerData.description || '',
      category_id: markerData.category_id,
      latitude: markerData.latitude || selectedMapCoordinates.value?.lat || 0,
      longitude: markerData.longitude || selectedMapCoordinates.value?.lng || 0,
      is_public: markerData.is_public ?? false
    }

    console.log('Creating marker with payload:', payload)

    const success = await createMarker(payload)

    if (success) {
      console.log('Marker erfolgreich erstellt!')
      closeNewMarkerModal()
      selectedMarker.value = null
    } else {
      console.error('Fehler beim Erstellen:', markersError.value)
      alert(`Fehler: ${markersError.value || 'Unbekannter Fehler'}`)
    }

  } catch (error) {
    console.error('Error creating marker:', error)
    alert('Fehler beim Erstellen der Markierung!')
  }
}

// Computed: Gefilterte Marker basierend auf selectedCategoryIds
const customFilteredMarkers = computed(() => {
  let filtered = [...markers.value]

  // Filter nach Kategorien
  if (selectedCategoryIds.value.length > 0 &&
      selectedCategoryIds.value.length < categories.value.length) {
    filtered = filtered.filter(marker =>
      selectedCategoryIds.value.includes(marker.category_id)
    )
  }

  // Filter nach Suchquery (wird bereits vom Composable gemacht via searchQuery)
  // Das Composable filteredMarkers nutzt searchQuery bereits
  return filtered
})

// Watcher für Debug
watch(
  () => [markers.value, categories.value, selectedCategoryIds.value],
  ([markersData, categoriesData, selectedIds]) => {
    console.log('=== MAP SEARCH DEBUG ===')
    console.log('Markers:', markersData)
    console.log('Categories:', categoriesData)
    console.log('Selected Category IDs:', selectedIds)
    console.log('Filtered Markers:', customFilteredMarkers.value)
    console.log('========================')
  },
  { deep: true, immediate: true }
)

// Lifecycle
onMounted(async () => {
  console.log('MapSearchPage mounted, loading data...')

  // Parallel laden für bessere Performance
  await Promise.all([
    fetchCategories(),
    fetchMarkers()
  ])

  // Alle Kategorien initial als aktiv setzen
  if (categories.value.length > 0) {
    selectedCategoryIds.value = categories.value.map(cat => cat.id)
  }

  console.log('Data loaded:', {
    categories: categories.value.length,
    markers: markers.value.length
  })
})
</script>
