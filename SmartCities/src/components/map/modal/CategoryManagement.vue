<template>
  <!-- Modal backdrop -->
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-80 z-40"
    @click="handleBackdropClick"
  ></div>

  <!-- Modal -->
  <div
    v-if="isVisible"
    tabindex="-1"
    aria-hidden="true"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div class="relative w-full max-w-5xl max-h-[90vh] mx-auto">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 flex flex-col max-h-full">
        <!-- Modal header -->
        <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 flex-shrink-0">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            Kategorien verwalten
          </h3>
          <button
            type="button"
            @click="handleCancel"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>

        <!-- Modal body -->
        <div class="p-6 overflow-y-auto flex-1 min-h-0">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <!-- Left Side: Category List -->
            <div class="flex flex-col border-r border-gray-200 dark:border-gray-600 pr-6">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white">
                  Kategorien
                </h4>
                <button
                  @click="startNewCategory"
                  class="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium text-sm transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Neue Kategorie
                </button>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="flex items-center justify-center py-8">
                <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <!-- Error State -->
              <div v-else-if="error" class="text-center py-8">
                <p class="text-red-500 text-sm mb-3">{{ error }}</p>
                <button
                  @click="$emit('retry-categories')"
                  class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Erneut versuchen
                </button>
              </div>

              <!-- Category List -->
              <div v-else class="space-y-2 overflow-y-auto flex-1 min-h-0">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  @click="selectCategoryForEdit(category)"
                  class="p-3 bg-gray-50 dark:bg-gray-600 rounded-lg border transition-all cursor-pointer"
                  :class="{
                    'border-blue-500 ring-2 ring-blue-300 dark:ring-blue-600': localSelectedCategory?.id === category.id && !isCreatingNew,
                    'border-gray-200 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500': localSelectedCategory?.id !== category.id || isCreatingNew,
                    'cursor-not-allowed opacity-50': isCreatingNew
                  }"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-5 h-5 rounded-full border-2 border-white shadow flex-shrink-0"
                      :style="{ backgroundColor: category.color || '#808080' }"
                    ></div>
                    <span class="font-medium text-gray-900 dark:text-white">
                      {{ category.title }}
                    </span>
                  </div>
                </div>

                <div v-if="categories.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p class="text-sm">Noch keine Kategorien vorhanden</p>
                </div>
              </div>
            </div>

            <!-- Right Side: Edit Form -->
            <div class="flex flex-col pl-0 lg:pl-6">
              <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {{ isCreatingNew ? 'Neue Kategorie erstellen' : 'Kategorie bearbeiten' }}
              </h4>

              <div v-if="localSelectedCategory || isCreatingNew" class="space-y-4 flex-1">
                <!-- Category Name -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="editingCategory.title"
                    type="text"
                    placeholder="z.B. Arbeit, Privat, Wichtig"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                  />

                  <!-- Name Conflict Warning -->
                  <p v-if="hasNameConflict" class="text-red-500 text-xs mt-1">
                    ⚠️ Eine Kategorie mit diesem Namen existiert bereits
                  </p>
                </div>

                <!-- Color Picker -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Farbe <span class="text-red-500">*</span>
                  </label>
                  <div class="flex items-center gap-3">
                    <input
                      v-model="editingCategory.color"
                      type="color"
                      class="h-10 w-20 rounded border border-gray-300 dark:border-gray-500 cursor-pointer"
                    />
                    <input
                      v-model="editingCategory.color"
                      type="text"
                      placeholder="#3B82F6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white font-mono"
                    />
                  </div>

                  <!-- Contrast Warning -->
                  <div
                    v-if="!hasGoodContrast"
                    class="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg"
                  >
                    <div class="flex items-start gap-2">
                      <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <div class="text-sm">
                        <p class="font-medium text-yellow-800 dark:text-yellow-300">
                          Kontrast-Warnung
                        </p>
                        <p class="text-yellow-700 dark:text-yellow-400 mt-1">
                          Die gewählte Farbe hat einen niedrigen Kontrast zu weißem Text. Bitte wählen Sie eine dunklere Farbe für bessere Lesbarkeit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Preview -->
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Vorschau
                  </label>
                  <div class="p-4 bg-gray-50 dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                    <!-- Preview Badge -->
                    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-sm"
                         :style="{ backgroundColor: editingCategory.color || '#808080' }">
                      <div class="w-2 h-2 bg-white rounded-full"></div>
                      <span>{{ editingCategory.title || 'Kategoriebezeichnung' }}</span>
                    </div>

                    <!-- Readability Hint -->
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-3">
                      💡 Achten Sie darauf, dass die weiße Schrift auf der gewählten Farbe gut lesbar ist.
                    </p>
                  </div>
                </div>
              </div>

              <div v-else class="flex-1 flex items-center justify-center text-center text-gray-400 dark:text-gray-500">
                <div>
                  <svg class="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <p class="text-sm">
                    Wählen Sie eine Kategorie aus oder<br>erstellen Sie eine neue Kategorie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200 rounded-b dark:border-gray-600 flex-shrink-0">
          <!-- Delete Button (left) -->
          <button
            v-if="canDelete"
            type="button"
            @click="handleDelete"
            :disabled="loading"
            class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Löschen
          </button>
          <div v-else></div>

          <!-- Save/Cancel Buttons (right) -->
          <div class="flex space-x-2">
            <button
              type="button"
              @click="handleCancel"
              :disabled="loading"
              class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abbrechen
            </button>
            <button
              type="button"
              @click="handleSave"
              :disabled="!canSave || loading"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreatingNew ? 'Erstellen' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCategories } from '@/composables/map/useCategories'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'category-updated', 'retry-categories'])

// Use categories composable for API calls
const {
  loading,
  error,
  createCategory,
  updateCategory,
  deleteCategory
} = useCategories()

// Local state
const isCreatingNew = ref(false)
const localSelectedCategory = ref(null)
const editingCategory = ref({
  title: '',
  color: '#3B82F6'
})

// Helper: Calculate color brightness for contrast check
function getColorBrightness(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return 128

  const r = parseInt(hexColor.substr(1, 2), 16)
  const g = parseInt(hexColor.substr(3, 2), 16)
  const b = parseInt(hexColor.substr(5, 2), 16)

  // Calculate perceived brightness (0-255)
  return (r * 299 + g * 587 + b * 114) / 1000
}

// Computed: Check if color has good contrast with white text
const hasGoodContrast = computed(() => {
  const brightness = getColorBrightness(editingCategory.value.color)
  // White text needs dark background (brightness < 155)
  return brightness < 155
})

// Computed: Check for name conflicts
const hasNameConflict = computed(() => {
  if (!editingCategory.value.title) return false

  return props.categories.some(cat =>
    cat.title.toLowerCase() === editingCategory.value.title.toLowerCase() &&
    cat.id !== localSelectedCategory.value?.id
  )
})

// Computed: Can save?
const canSave = computed(() => {
  return editingCategory.value.title.trim() &&
         editingCategory.value.color &&
         !hasNameConflict.value &&
         hasGoodContrast.value &&
         !loading.value
})

// Computed: Can delete?
const canDelete = computed(() => {
  return !isCreatingNew.value &&
         localSelectedCategory.value &&
         !loading.value
})

// Watch: Selected category from parent
watch(() => props.selectedCategory, (newCategory) => {
  if (newCategory) {
    isCreatingNew.value = false
    localSelectedCategory.value = newCategory
    editingCategory.value = {
      title: newCategory.title || '',
      color: newCategory.color || '#3B82F6'
    }
  }
}, { immediate: true })

// Watch: Reset on modal close
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    console.log('=== CATEGORY MODAL DEBUG ===')
    console.log('Categories prop:', props.categories)
    console.log('Categories length:', props.categories.length)
    console.log('===========================')
    resetForm()
  }
})

// Start creating new category
function startNewCategory() {
  isCreatingNew.value = true
  localSelectedCategory.value = null
  editingCategory.value = {
    title: '',
    color: '#3B82F6'
  }
}

// Select category for editing
function selectCategoryForEdit(category) {
  if (isCreatingNew.value) return

  isCreatingNew.value = false
  localSelectedCategory.value = category
  editingCategory.value = {
    title: category.title || '',
    color: category.color || '#3B82F6'
  }
}

// Handle save (create or update)
async function handleSave() {
  if (!canSave.value) return

  const categoryData = {
    title: editingCategory.value.title.trim(),
    color: editingCategory.value.color
  }

  let success = false

  if (isCreatingNew.value) {
    // Create new category
    success = await createCategory(categoryData)
    if (success) {
      console.log('Kategorie erfolgreich erstellt!')
    }
  } else if (localSelectedCategory.value) {
    // Update existing category
    success = await updateCategory(localSelectedCategory.value.id, categoryData)
    if (success) {
      console.log('Kategorie erfolgreich aktualisiert!')
    }
  }

  if (success) {
    emit('category-updated')
    resetForm()
  } else {
    alert(`Fehler: ${error.value || 'Unbekannter Fehler'}`)
  }
}

// Handle delete
async function handleDelete() {
  if (!localSelectedCategory.value) return

  const confirmed = confirm(
    `Möchten Sie die Kategorie "${localSelectedCategory.value.title}" wirklich löschen?\n\nAlle Marker dieser Kategorie werden ebenfalls gelöscht!`
  )

  if (!confirmed) return

  const success = await deleteCategory(localSelectedCategory.value.id)

  if (success) {
    console.log('Kategorie erfolgreich gelöscht!')
    emit('category-updated')
    resetForm()
  } else {
    alert(`Fehler beim Löschen: ${error.value || 'Unbekannter Fehler'}`)
  }
}

// Handle cancel
function handleCancel() {
  emit('close')
  resetForm()
}

// Handle backdrop click
function handleBackdropClick(event) {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}

// Reset form
function resetForm() {
  isCreatingNew.value = false
  localSelectedCategory.value = null
  editingCategory.value = {
    title: '',
    color: '#3B82F6'
  }
}
</script>
