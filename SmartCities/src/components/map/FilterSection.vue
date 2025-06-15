<template>
  <div class="relative">
    <!-- Filter Button -->
    <button
      ref="filterBtn"
      @click="toggleDropdown"
      class="flex-none px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 font-medium text-sm transition-colors whitespace-nowrap"
      type="button"
      :disabled="loading"
    >
      <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <!-- Funnel icon from Flowbite -->
      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18l-4 4H7L3 6zm8 8v8l-4-2v-6"/>
      </svg>
    </button>

    <!-- Filter Dropdown -->
    <div
      v-show="showDropdown"
      id="filter-dropdown"
      class="z-20 absolute right-0 mt-2 w-64 sm:w-72 bg-white divide-y divide-gray-100 rounded-lg shadow-lg dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
    >
      <div class="p-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Kategorien filtern
        </h3>
        
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-4">
          <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-gray-500">Kategorien werden geladen...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-4">
          <div class="text-red-500 text-sm mb-2">{{ error }}</div>
          <button
            @click="fetchCategories"
            class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
        
        <!-- Category Filter List -->
        <div v-else class="space-y-2 max-h-60 overflow-y-auto">
          <label
            v-for="category in localCategories"
            :key="category.id"
            class="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
          >
            <input
              :id="`filter-${category.id}`"
              :checked="category.active"
              @change="toggleCategory(category.id)"
              type="checkbox"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div class="ml-3 flex items-center flex-1">
              <!-- Category Color Indicator -->
              <div
                class="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                :style="{ backgroundColor: category.color }"
              ></div>
              <span class="text-sm text-gray-900 dark:text-white">
                {{ category.name }}
              </span>
              <span v-if="category.count" class="ml-auto text-xs text-gray-500 dark:text-gray-400">
                ({{ category.count }})
              </span>
            </div>
          </label>
        </div>

        <!-- Filter Actions -->
        <div v-if="!loading && !error" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div class="flex justify-between gap-2">
            <button
              @click="selectAllCategories"
              class="px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Alle auswählen
            </button>
            <button
              @click="deselectAllCategories"
              class="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Alle abwählen
            </button>
          </div>
        </div>

        <!-- Active Filter Count -->
        <div v-if="activeFilterCount > 0 && !loading && !error" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ activeFilterCount }} von {{ localCategories.length }} Kategorien aktiv
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  initialCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selected', 'categories-loaded', 'loading-changed'])

const filterBtn = ref(null)
const showDropdown = ref(false)
const localCategories = ref([])
const loading = ref(false)
const error = ref(null)

// API Base URL - später durch echte Backend-URL ersetzen
const API_BASE_URL = 'https://api.your-backend.com'

// Computed properties
const activeFilterCount = computed(() => {
  return localCategories.value.filter(cat => cat.active).length
})

// API Methods
async function fetchCategories() {
  loading.value = true
  error.value = null
  emit('loading-changed', true)
  
  try {
    // Simuliere API Call - später durch echten Fetch ersetzen
    await new Promise(resolve => setTimeout(resolve, 800))
    
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
    localCategories.value = data.categories || data
    */
    
    // Dummy Daten für jetzt
    const dummyCategories = [
      { 
        id: 1, 
        name: 'Restaurants', 
        color: '#FF6B6B', 
        active: true,
        icon: 'utensils',
        count: 25
      },
      { 
        id: 2, 
        name: 'Hotels', 
        color: '#4ECDC4', 
        active: true,
        icon: 'bed',
        count: 12
      },
      { 
        id: 3, 
        name: 'Sehenswürdigkeiten', 
        color: '#45B7D1', 
        active: true,
        icon: 'camera',
        count: 18
      },
      { 
        id: 4, 
        name: 'Shopping', 
        color: '#96CEB4', 
        active: false,
        icon: 'shopping-bag',
        count: 8
      },
      { 
        id: 5, 
        name: 'Nightlife', 
        color: '#FFEAA7', 
        active: false,
        icon: 'music',
        count: 15
      },
      { 
        id: 6, 
        name: 'Transport', 
        color: '#DDA0DD', 
        active: true,
        icon: 'car',
        count: 6
      },
      { 
        id: 7, 
        name: 'Gesundheit', 
        color: '#74B9FF', 
        active: false,
        icon: 'heart',
        count: 10
      },
      { 
        id: 8, 
        name: 'Sport & Freizeit', 
        color: '#00B894', 
        active: false,
        icon: 'activity',
        count: 14
      }
    ]
    
    localCategories.value = dummyCategories
    emit('categories-loaded', dummyCategories)
    emit('update:selected', dummyCategories)
    
    console.log('Kategorien erfolgreich geladen:', dummyCategories)
    
  } catch (err) {
    error.value = 'Fehler beim Laden der Kategorien'
    console.error('Fehler beim Laden der Kategorien:', err)
    
    // Fallback Kategorien bei Fehler
    const fallbackCategories = [
      { id: 1, name: 'Alle', color: '#6B7280', active: true, icon: 'globe', count: 0 }
    ]
    
    localCategories.value = fallbackCategories
    emit('categories-loaded', fallbackCategories)
    emit('update:selected', fallbackCategories)
    
  } finally {
    loading.value = false
    emit('loading-changed', false)
  }
}

// Auth Token Helper (für später)
function getAuthToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

// UI Methods
function toggleDropdown() {
  showDropdown.value = !showDropdown.value
  
  // Lade Kategorien beim ersten Öffnen
  if (showDropdown.value && localCategories.value.length === 0) {
    fetchCategories()
  }
}

function closeDropdown() {
  showDropdown.value = false
}

function toggleCategory(categoryId) {
  const updatedCategories = localCategories.value.map(cat => {
    if (cat.id === categoryId) {
      return { ...cat, active: !cat.active }
    }
    return cat
  })
  
  localCategories.value = updatedCategories
  emit('update:selected', updatedCategories)
}

function selectAllCategories() {
  const updatedCategories = localCategories.value.map(cat => ({
    ...cat,
    active: true
  }))
  
  localCategories.value = updatedCategories
  emit('update:selected', updatedCategories)
}

function deselectAllCategories() {
  const updatedCategories = localCategories.value.map(cat => ({
    ...cat,
    active: false
  }))
  
  localCategories.value = updatedCategories
  emit('update:selected', updatedCategories)
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (filterBtn.value && !filterBtn.value.contains(event.target)) {
    const dropdown = document.getElementById('filter-dropdown')
    if (dropdown && !dropdown.contains(event.target)) {
      closeDropdown()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Falls initial Kategorien übergeben wurden, verwende diese
  if (props.initialCategories.length > 0) {
    localCategories.value = props.initialCategories
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose Funktionen für Parent Component
defineExpose({
  fetchCategories,
  loading,
  localCategories
})
</script>