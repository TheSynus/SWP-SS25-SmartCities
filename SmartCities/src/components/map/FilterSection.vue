<template>
  <div class="relative" ref="dropdownContainer" data-dropdown>
    <!-- Filter Button -->
    <button
      ref="filterBtn"
      @click="handleButtonClick"
      class="flex-none px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg
             hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300
             dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800
             font-medium text-sm transition-colors whitespace-nowrap"
      type="button"
      :disabled="loading"
    >
      <svg
        v-if="loading"
        class="animate-spin w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <!-- Funnel icon -->
      <svg
        v-else
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18l-4 4H7L3 6zm8 8v8l-4-2v-6"/>
      </svg>
    </button>

    <!-- Filter Dropdown -->
    <div
      v-show="showDropdown"
      class="z-20 absolute right-0 mt-2 w-64 sm:w-72 bg-white divide-y divide-gray-100
             rounded-lg shadow-lg dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
    >
      <div class="p-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Kategorien filtern
        </h3>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-4">
          <svg
            class="animate-spin h-5 w-5 text-blue-600 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm text-gray-500">Kategorien werden geladen...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-4">
          <div class="text-red-500 text-sm mb-2">{{ error }}</div>
          <button
            @click="handleRetry"
            class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="categories.length === 0" class="text-center py-4">
          <div class="text-gray-500 text-sm">Keine Kategorien verfügbar</div>
        </div>

        <!-- Category Filter List -->
        <div v-else class="space-y-2 max-h-60 overflow-y-auto">
          <label
            v-for="category in categories"
            :key="category.id"
            class="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600
                   cursor-pointer transition-colors"
          >
            <input
              :id="`filter-${category.id}`"
              :checked="isCategorySelected(category.id)"
              @change="toggleCategory(category.id)"
              type="checkbox"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded
                     focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800
                     focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <div class="ml-3 flex items-center flex-1">
              <!-- Category Color Indicator -->
              <div
                class="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                :style="{ backgroundColor: category.color || '#808080' }"
              ></div>
              <span class="text-sm text-gray-900 dark:text-white">
                {{ category.title }}
              </span>
              <span v-if="getCategoryCount(category.id) > 0" class="ml-auto text-xs text-gray-500 dark:text-gray-400">
                ({{ getCategoryCount(category.id) }})
              </span>
            </div>
          </label>
        </div>

        <!-- Filter Actions -->
        <div v-if="!loading && !error && categories.length > 0" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div class="flex justify-between gap-2">
            <button
              @click="selectAllCategories"
              class="px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-800
                     dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Alle auswählen
            </button>
            <button
              @click="deselectAllCategories"
              class="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800
                     dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Alle abwählen
            </button>
          </div>
        </div>

        <!-- Active Filter Count -->
        <div v-if="activeFilterCount > 0 && !loading && !error" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ activeFilterCount }} von {{ categories.length }} Kategorien aktiv
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDropdown } from '../../composables/map/useDropdown'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [String, null],
    default: null
  }
})

const emit = defineEmits(['update:selected', 'retry', 'dropdown-opened'])

// Use dropdown composable
const dropdownContainer = ref(null)
const { showDropdown, toggleDropdown, closeDropdown } = useDropdown()

// Local state for selected category IDs
const localSelectedIds = ref([])
const isInitialized = ref(false)

// Watch showDropdown to emit event when opened
watch(showDropdown, (isOpen) => {
  if (isOpen) {
    emit('dropdown-opened')
  }
})

// Initialize on mount
onMounted(() => {
  if (props.selectedCategories.length > 0) {
    localSelectedIds.value = [...props.selectedCategories]
  } else if (props.categories.length > 0) {
    // Default: all categories selected
    localSelectedIds.value = props.categories.map(cat => cat.id)
    emitUpdate()
  }
  isInitialized.value = true
})

// Watch for prop changes (only after initialization)
watch(
  () => props.selectedCategories,
  (newValue) => {
    if (!isInitialized.value) return

    // Only sync if coming from parent (not from our own emit)
    if (JSON.stringify(newValue) !== JSON.stringify(localSelectedIds.value)) {
      localSelectedIds.value = newValue ? [...newValue] : []
    }
  }
)

// Watch categories changes
watch(
  () => props.categories,
  (newCategories) => {
    if (!isInitialized.value && newCategories.length > 0 && localSelectedIds.value.length === 0) {
      localSelectedIds.value = newCategories.map(cat => cat.id)
      emitUpdate()
    }
  }
)

// Computed
const activeFilterCount = computed(() => {
  return localSelectedIds.value.length
})

// Helper: Check if category is selected
function isCategorySelected(categoryId) {
  return localSelectedIds.value.includes(categoryId)
}

// Helper: Get marker count for category
function getCategoryCount(categoryId) {
  return 0
}

// Button click handler
function handleButtonClick() {
  toggleDropdown()
}

// Actions
function toggleCategory(categoryId) {
  if (localSelectedIds.value.includes(categoryId)) {
    localSelectedIds.value = localSelectedIds.value.filter(id => id !== categoryId)
  } else {
    localSelectedIds.value = [...localSelectedIds.value, categoryId]
  }
  emitUpdate()
}

function selectAllCategories() {
  localSelectedIds.value = props.categories.map(cat => cat.id)
  emitUpdate()
}

function deselectAllCategories() {
  localSelectedIds.value = []
  emitUpdate()
}

function emitUpdate() {
  emit('update:selected', localSelectedIds.value)
}

function handleRetry() {
  emit('retry')
}

// Expose for parent
defineExpose({
  showDropdown,
  closeDropdown
})
</script>
