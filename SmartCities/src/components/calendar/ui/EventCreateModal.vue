// === EVENT CREATE MODAL COMPONENT (REFACTORED) ===
// components/EventCreateModal.vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'

// Types
interface NewEvent {
  title: string
  start_time: string
  category: string
  recurrence: string
  location: string
  description: string
  end_time: string
}

interface Category {
  id: number
  title: string
  color: string
}

// Props
interface Props {
  isVisible: boolean
  categories: Category[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'save': [event: NewEvent]
}>()

// Local state
const newEvent = ref<NewEvent>({
  title: '',
  start_time: '',
  category: '',
  recurrence: '',
  location: '',
  description: '',
  end_time: '',
})

// ========================================
// HELPER: Get Category by Title (NEU)
// ========================================
function getCategoryByTitle(categoryTitle: string): Category | undefined {
  return props.categories.find((cat) => cat.title === categoryTitle)
}

// ========================================
// HELPER: Get Category Display (NEU)
// ========================================
function getCategoryDisplay(categoryTitle: string) {
  const category = getCategoryByTitle(categoryTitle)
  return {
    title: category?.title || 'Unbekannt',
    color: category?.color || '#6B7280'
  }
}

// Watch for modal visibility to reset form
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    resetForm()
  }
})

// Computed
const showEndDate = computed(() => {
  return newEvent.value.recurrence && newEvent.value.recurrence !== 'Keine'
})

// ========================================
// COMPUTED: Hat verfügbare Kategorien (NEU)
// ========================================
const hasCategories = computed(() => {
  return props.categories && props.categories.length > 0
})

// ========================================
// COMPUTED: Standard-Kategorie (NEU)
// ========================================
const defaultCategory = computed(() => {
  // Erste verfügbare Kategorie als Default
  return props.categories.length > 0 ? props.categories[0].title : ''
})

const repeatOptions = [
  'Keine',
  'Täglich',
  'Wöchentlich',
  'Monatlich',
  'Jährlich'
]

// Mapping: Deutsch (Anzeige) → Englisch (DB)
const recurrenceMapDeToEn: Record<string, string> = {
  'Keine': 'none',
  'Täglich': 'daily',
  'Wöchentlich': 'weekly',
  'Monatlich': 'monthly',
  'Jährlich': 'yearly'
}

// Methods
function resetForm() {
  newEvent.value = {
    title: '',
    start_time: '',
    category: defaultCategory.value, // ← GEÄNDERT: Default-Kategorie setzen
    recurrence: '',
    location: '',
    description: '',
    end_time: '',
  }
}

function handleSave() {
  console.log('Saving new event:', newEvent.value)

  // ← NEU: Validierung
  if (!hasCategories.value) {
    alert('⚠️ Es sind keine Kategorien verfügbar. Bitte erstellen Sie zuerst eine Kategorie.')
    return
  }

  if (!newEvent.value.category) {
    alert('⚠️ Bitte wählen Sie eine Kategorie aus.')
    return
  }

  // Konvertiere deutsche Wiederholung zu englisch für die DB
  const eventToSave = {
    ...newEvent.value,
    recurrence: recurrenceMapDeToEn[newEvent.value.recurrence] || 'none'
  }

  console.log('Event mit englischer recurrence:', eventToSave)
  emit('save', eventToSave)
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
        class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full bg-black/50 backdrop-blur-sm"
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
            class="relative p-6 w-full max-w-md bg-[#0B1739] rounded-lg shadow border border-white/10 text-white"
            @click.stop
          >
            <h3 class="mb-4 text-xl font-semibold">Neuen Termin erstellen</h3>

            <!-- ← NEU: Warnung wenn keine Kategorien vorhanden -->
            <div
              v-if="!hasCategories"
              class="mb-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg"
            >
              <p class="text-sm text-yellow-300">
                ⚠️ Keine Kategorien vorhanden. Bitte erstellen Sie zuerst eine Kategorie über "Kategorien bearbeiten".
              </p>
            </div>

            <div class="space-y-3 max-h-96 overflow-y-auto">
              <!-- Title -->
              <input
                v-model="newEvent.title"
                type="text"
                placeholder="Bezeichnung"
                class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
              />

              <!-- Start Date -->
              <div>
                <label class="block text-sm text-gray-300 mb-1">Startdatum</label>
                <input
                  v-model="newEvent.start_time"
                  type="datetime-local"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                />
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm text-gray-300 mb-1">Kategorie</label>
                <select
                  v-model="newEvent.category"
                  :disabled="!hasCategories"
                  class="w-full p-2 rounded bg-white/10 text-sm text-white border-0 outline-0 focus:ring-0"
                  :class="{ 'cursor-not-allowed opacity-50': !hasCategories }"
                >
                  <option disabled value="" class="bg-[#0B1739] text-gray-400">
                    {{ hasCategories ? 'Kategorie wählen' : 'Keine Kategorien verfügbar' }}
                  </option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.title"
                    class="bg-[#0B1739] text-white"
                  >
                    {{ category.title }}
                  </option>
                </select>
              </div>

              <!-- Repeat -->
              <select
                v-model="newEvent.recurrence"
                class="w-full p-2 rounded bg-white/10 text-sm text-white border-0 outline-0 focus:ring-0"
              >
                <option disabled value="" class="bg-[#0B1739] text-gray-400">
                  Wiederholung wählen
                </option>
                <option
                  v-for="option in repeatOptions"
                  :key="option"
                  class="bg-[#0B1739] text-white"
                >
                  {{ option }}
                </option>
              </select>

              <!-- End Date (conditional) -->
              <div v-if="showEndDate">
                <label class="block text-sm text-gray-300 mb-1">Enddatum (bis wann wiederholen)</label>
                <input
                  v-model="newEvent.end_time"
                  type="datetime-local"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                />
              </div>

              <!-- Location -->
              <input
                v-model="newEvent.location"
                type="text"
                placeholder="Ort"
                class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
              />

              <!-- Description -->
              <div>
                <label class="block text-sm text-gray-300 mb-1">Beschreibung</label>
                <textarea
                  v-model="newEvent.description"
                  placeholder="Beschreibung (optional)"
                  rows="3"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm resize-none"
                ></textarea>
              </div>

              <!-- ← NEU: Preview Badge mit Hex-Farbe -->
              <div v-if="newEvent.category" class="mt-4">
                <label class="block text-sm text-gray-300 mb-1">Vorschau</label>
                <div class="p-3 bg-white/5 rounded border border-white/10">
                  <span
                    class="inline-block px-3 py-1 rounded-full text-xs text-white font-medium"
                    :style="{ backgroundColor: getCategoryDisplay(newEvent.category).color }"
                  >
                    {{ getCategoryDisplay(newEvent.category).title }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-2 mt-6">
              <button
                @click="handleCancel"
                class="px-4 py-2 text-sm text-gray-300 bg-white/10 rounded hover:bg-white/20"
              >
                Abbrechen
              </button>
              <button
                @click="handleSave"
                :disabled="!hasCategories"
                class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Speichern
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
