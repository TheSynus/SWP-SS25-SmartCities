// === CATEGORY MANAGEMENT MODAL COMPONENT ===
// components/CategoryManagementModal.vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus } from 'lucide-vue-next'

// Types
interface Category {
  id: number
  title: string
  color: string
}

interface EditingCategory {
  id: number | null
  title: string
  color: string
}

// Props
interface Props {
  isVisible: boolean
  categories: Category[]
  selectedCategory: Category | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'save': [category: EditingCategory, isNew: boolean]
  'delete': []
  'select-category': [category: Category]
}>()

// Local state
const isCreatingNewCategory = ref(false)
const editingCategory = ref<EditingCategory>({
  id: null,
  title: '',
  color: '',
})

// Available color options
const availableColors = [
  'bg-blue-600',
  'bg-green-600',
  'bg-purple-600',
  'bg-red-600',
  'bg-yellow-600',
  'bg-pink-600',
  'bg-indigo-600',
  'bg-orange-600',
]

// Watch for prop changes
watch(() => props.selectedCategory, (newCategory) => {
  if (newCategory) {
    isCreatingNewCategory.value = false
    editingCategory.value = {
      id: newCategory.id,
      title: newCategory.title,
      color: newCategory.color,
    }
  }
}, { immediate: true })

watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    resetForm()
  }
})

// Computed
const hasNameConflict = computed(() => {
  return editingCategory.value.title &&
    props.categories.some(
      (cat) =>
        cat.title.toLowerCase() === editingCategory.value.title.toLowerCase() &&
        cat.id !== editingCategory.value.id,
    )
})

const canSave = computed(() => {
  return editingCategory.value.title.trim() && !hasNameConflict.value
})

const canDelete = computed(() => {
  return props.selectedCategory && 
         !isCreatingNewCategory.value && 
         props.selectedCategory.title !== 'Sonstiges'
})

// Methods
function resetForm() {
  isCreatingNewCategory.value = false
  editingCategory.value = {
    id: null,
    title: '',
    color: '',
  }
}

function startNewCategory() {
  isCreatingNewCategory.value = true
  editingCategory.value = {
    id: null,
    title: '',
    color: 'bg-blue-600',
  }
}

function selectCategoryForEdit(category: Category) {
  if (isCreatingNewCategory.value) return
  emit('select-category', category)
}

function handleSave() {
  if (!canSave.value) return
  
  console.log("Neue Kategoire:" + editingCategory.value.title + "\nIsNew:" +isCreatingNewCategory.value )
  
  emit('save', { ...editingCategory.value }, isCreatingNewCategory.value)
}

function handleDelete() {
  emit('delete')
}

function handleCancel() {
  emit('close')
  resetForm()
}

function handleBackdropClick(event: Event) {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed top-0 left-0 right-0 z-2000 flex items-center justify-center w-full h-full bg-black/50 backdrop-blur-sm"
        @click="handleBackdropClick"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="isVisible"
            class="relative p-6 w-full max-w-4xl bg-[#0B1739] rounded-lg shadow border border-white/10 text-white z-[2001]"
            @click.stop
          >
            <h3 class="mb-6 text-xl font-semibold">Kategorien bearbeiten</h3>

            <div class="flex gap-6 h-96">
              <!-- Left Side: Category List -->
              <div class="w-1/2 border-r border-white/10 pr-6">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-lg font-medium">Aktuelle Kategorien</h4>
                  <button
                    @click="startNewCategory"
                    class="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm"
                  >
                    <Plus class="w-4 h-4" />
                    Neue Kategorie
                  </button>
                </div>
                
                <div class="space-y-2 overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5 hover:scrollbar-thumb-white/30"
                >
                  <div
                    v-for="category in categories"
                    :key="category.id"
                    @click="selectCategoryForEdit(category)"
                    class="p-3 bg-white/5 rounded border border-white/10 transition flex items-center gap-3"
                    :class="{
                      'ring-2 ring-blue-400': selectedCategory && selectedCategory.id === category.id,
                      'cursor-pointer hover:bg-white/10': !isCreatingNewCategory,
                      'cursor-not-allowed opacity-50': isCreatingNewCategory,
                    }"
                  >
                    <div class="w-4 h-4 rounded-full" :class="category.color"></div>
                    <span class="font-medium">{{ category.title }}</span>
                  </div>
                </div>
              </div>

              <!-- Right Side: Edit Form -->
              <div class="w-1/2 pl-6">
                <h4 class="text-lg font-medium mb-4">
                  {{ isCreatingNewCategory ? 'Neue Kategorie erstellen' : 'Kategorie bearbeiten' }}
                </h4>
                
                <div v-if="selectedCategory || isCreatingNewCategory" class="space-y-4">
                  <!-- Category Name -->
                  <div>
                    <label class="block text-sm text-gray-300 mb-2">Kategoriebezeichnung</label>
                    <input
                      v-model="editingCategory.title"
                      type="text"
                      class="w-full p-3 rounded bg-white/10 border border-white/20 text-white"
                      placeholder="Kategoriebezeichnung eingeben"
                    />
                    
                    <!-- Name Conflict Warning -->
                    <div
                      v-if="hasNameConflict"
                      class="text-red-400 text-sm mt-1"
                    >
                      ⚠️ Eine Kategorie mit diesem Namen existiert bereits
                    </div>
                  </div>

                  <!-- Color Selection -->
                  <div>
                    <label class="block text-sm text-gray-300 mb-2">Farbe</label>
                    <div class="grid grid-cols-4 gap-3">
                      <div
                        v-for="color in availableColors"
                        :key="color"
                        @click="editingCategory.color = color"
                        class="w-12 h-12 rounded-lg cursor-pointer border-2 transition-all hover:scale-110"
                        :class="[
                          color,
                          editingCategory.color === color
                            ? 'border-white ring-2 ring-white/50'
                            : 'border-white/20',
                        ]"
                      ></div>
                    </div>
                  </div>

                  <!-- Preview -->
                  <div class="mt-6">
                    <label class="block text-sm text-gray-300 mb-2">Vorschau</label>
                    <div class="p-3 bg-white/5 rounded border border-white/10 flex items-center gap-3">
                      <div class="w-4 h-4 rounded-full" :class="editingCategory.color"></div>
                      <span class="font-medium">{{
                        editingCategory.title || 'Kategoriebezeichnung eingeben'
                      }}</span>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center text-gray-400 mt-12">
                  <p>Wählen Sie eine Kategorie aus der Liste aus, um sie zu bearbeiten</p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between mt-6 pt-4 border-t border-white/10">
              <!-- Delete Button -->
              <button
                v-if="canDelete"
                @click="handleDelete"
                class="px-6 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition"
              >
                🗑️ Löschen
              </button>
              <div v-else></div>

              <!-- Cancel/Save Buttons -->
              <div class="flex gap-3">
                <button
                  @click="handleCancel"
                  class="px-6 py-2 text-gray-300 bg-white/10 rounded hover:bg-white/20 transition"
                >
                  Abbrechen
                </button>
                <button
                  @click="handleSave"
                  :disabled="!canSave"
                  class="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isCreatingNewCategory ? 'Erstellen' : 'Speichern' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
