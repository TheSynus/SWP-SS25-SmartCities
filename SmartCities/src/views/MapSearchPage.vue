<template>
  <div
    ref="layoutRoot"
    class="bg-gray-50 dark:bg-gray-900 pt-14 sm:pt-16 lg:pt-18 flex flex-1 h-full overflow-hidden"
    :class="isNarrow ? 'flex-col' : 'flex-row'"
  >
    <!-- Main Content Container -->
    <div
      class="flex-1 flex gap-4 min-h-0"
      :class="isNarrow ? 'flex-col' : 'flex-row'"
    >
      <!-- Map Section -->
      <MapSection
        :show="!isSidebarMode"
        :markers="customFilteredMarkers"
        :categories="categories"
        :selected-marker="selectedMarker"
        :loading="loading"
        :is-admin="isAdmin"
        @marker-selected="handleMarkerSelected"
        @map-click="handleMapClick"
        @marker-details="handleMarkerDetails"
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
        :is-admin="isAdmin"
        @search="handleSearch"
        @filter-update="handleFilterUpdate"
        @result-select="handleResultSelect"
        @new-marker="openNewMarker"
        @category-editor="openCategoryEditor"
        @retry-categories="fetchCategories"
        @clear-filters="handleClearFilters"
      />
    </div>

    <!-- Marker Modal (Create/Edit) -->
    <MarkerModal
      :show="showMarkerModal"
      :categories="categories"
      :initial-coordinates="selectedMapCoordinates"
      :marker-data="editingMarker"
      :is-edit-mode="isEditMode"
      modal-id="marker-modal"
      @close="closeMarkerModal"
      @submit="handleMarkerSubmit"
      @delete="handleMarkerDelete"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MapSection from '../components/map/MapSection.vue'
import SidebarSection from '../components/map/SidebarSection.vue'
import MarkerModal from '../components/map/modal/MarkerModal.vue'
import CategoryEditorModal from '../components/map/modal/CategoryManagement.vue'

// Composables
import { useCategories } from '../composables/map/useCategories'
import { useMarkers } from '../composables/map/useMarkers'
import { useAdmin } from '@/composables/admin/useAdmin'

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

const { isAdmin } = useAdmin()

// Kombiniertes Loading
const loading = computed(() => categoriesLoading.value || markersLoading.value)

// Local State
const selectedCategoryIds = ref([])
const selectedMarker = ref(null)
const selectedMapCoordinates = ref(null)
const showMarkerModal = ref(false)
const isEditMode = ref(false)
const editingMarker = ref(null)
const showCategoryEditor = ref(false)
const layoutRoot = ref(null)
const isNarrow = ref(true)

let resizeObserver = null

// Computed
const isSidebarMode = computed(() =>
  showMarkerModal.value || showCategoryEditor.value
)

// Event Handlers
function handleSearch(query) {
  searchQuery.value = query
}

function handleFilterUpdate(categoryIds) {
  if (Array.isArray(categoryIds)) {
    selectedCategoryIds.value = categoryIds
    selectedCategory.value = categoryIds.length === 1 ? categoryIds[0] : null
  } else {
    selectedCategory.value = categoryIds
    selectedCategoryIds.value = categoryIds ? [categoryIds] : []
  }
}

function handleResultSelect(marker) {
  selectedMarker.value = marker
}

function handleMarkerSelected(marker) {
  selectedMarker.value = marker
}

function handleMapClick(coordinates) {
  // Only allow creating markers if user is admin
  if (isAdmin.value) {
    openNewMarker(coordinates)
  }
}

function handleCategoryUpdate() {
  fetchCategories()
}

// Clear all filters and search
function handleClearFilters() {
  searchQuery.value = ''
  if (categories.value.length > 0) {
    selectedCategoryIds.value = categories.value.map(cat => cat.id)
  }
}

// Open modal for creating new marker
function openNewMarker(coordinates = null) {
  if (coordinates) {
    selectedMapCoordinates.value = coordinates
  }
  isEditMode.value = false
  editingMarker.value = null
  showMarkerModal.value = true
}

// Open modal for editing existing marker (triggered by "Details anzeigen")
function handleMarkerDetails(marker) {
  // Only allow editing markers if user is admin
  if (!isAdmin.value) {
    return
  }
  isEditMode.value = true
  editingMarker.value = { ...marker }
  selectedMapCoordinates.value = null
  showMarkerModal.value = true
}

function closeMarkerModal() {
  showMarkerModal.value = false
  isEditMode.value = false
  editingMarker.value = null
  selectedMapCoordinates.value = null
}

function openCategoryEditor() {
  showCategoryEditor.value = true
}

function closeCategoryEditor() {
  showCategoryEditor.value = false
}

// Handle marker submit (create or update)
async function handleMarkerSubmit(markerData) {
  try {
    const payload = {
      name: markerData.name,
      description: markerData.description || '',
      category_id: markerData.category_id,
      latitude: markerData.latitude || selectedMapCoordinates.value?.lat || 0,
      longitude: markerData.longitude || selectedMapCoordinates.value?.lng || 0,
      is_public: markerData.is_public ?? false
    }

    let success = false

    if (isEditMode.value && editingMarker.value) {
      // Update existing marker
      success = await updateMarker(editingMarker.value.id, payload)

      if (!success) {
        alert(`Fehler beim Aktualisieren: ${markersError.value || 'Unbekannter Fehler'}`)
      }
    } else {
      // Create new marker
      success = await createMarker(payload)

      if (!success) {
        alert(`Fehler beim Erstellen: ${markersError.value || 'Unbekannter Fehler'}`)
      }
    }

    if (success) {
      closeMarkerModal()
      selectedMarker.value = null
    }
  } catch (error) {
    alert('Fehler beim Speichern der Markierung!')
  }
}

// Handle marker delete
async function handleMarkerDelete(markerId) {
  try {
    const confirmed = confirm('Möchten Sie diese Markierung wirklich löschen?')
    if (!confirmed) return

    const success = await deleteMarker(markerId)

    if (success) {
      closeMarkerModal()
      selectedMarker.value = null
    } else {
      alert(`Fehler beim Löschen: ${markersError.value || 'Unbekannter Fehler'}`)
    }
  } catch (error) {
    alert('Fehler beim Löschen der Markierung!')
  }
}

// Computed: Gefilterte Marker mit Such- UND Kategorie-Filter
const customFilteredMarkers = computed(() => {
  let filtered = [...markers.value]

  // Filter nach Suchquery
  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(marker => {
      const matchesName = marker.name?.toLowerCase().includes(query)
      const matchesDescription = marker.description?.toLowerCase().includes(query)
      return matchesName || matchesDescription
    })
  }

  // Filter nach Kategorien
  if (selectedCategoryIds.value.length > 0 &&
      selectedCategoryIds.value.length < categories.value.length) {
    filtered = filtered.filter(marker =>
      selectedCategoryIds.value.includes(marker.category_id)
    )
  }

  return filtered
})

// Lifecycle
onMounted(async () => {
  // Responsive Observer
  resizeObserver = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width
    isNarrow.value = width < 500
  })

  if (layoutRoot.value) {
    resizeObserver.observe(layoutRoot.value)
  }

  // Parallel laden für bessere Performance
  await Promise.all([
    fetchCategories(),
    fetchMarkers()
  ])

  // Alle Kategorien initial als aktiv setzen
  if (categories.value.length > 0) {
    selectedCategoryIds.value = categories.value.map(cat => cat.id)
  }
})

onUnmounted(() => {
  if (resizeObserver && layoutRoot.value) {
    resizeObserver.unobserve(layoutRoot.value)
    resizeObserver = null
  }
})
</script>
