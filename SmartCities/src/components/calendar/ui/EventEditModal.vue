// === EVENT EDIT MODAL COMPONENT ===
// components/EventEditModal.vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'

// Types
interface Event {
  id: string | number
  title: string
  date: string
  category: string
  repeat: string
  location: string
  description: string
  endDate: string
}

interface Category {
  id: number
  name: string
  color: string
}

// Props
interface Props {
  isVisible: boolean
  event: Event | null
  categories: Category[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'save': [event: Event]
  'delete': []
}>()

// Local state
const localEvent = ref<Event>({
  id: '',
  title: '',
  date: '',
  category: '',
  repeat: '',
  location: '',
  description: '',
  endDate: '',
})

// Watch for prop changes
watch(() => props.event, (newEvent) => {
  if (newEvent) {
    localEvent.value = { ...newEvent }
  }
}, { immediate: true, deep: true })

// Computed
const showEndDate = computed(() => {
  return localEvent.value.repeat && localEvent.value.repeat !== 'Keine'
})

const repeatOptions = [
  'Keine',
  'Täglich',
  'Wöchentlich',
  'Monatlich',
  'Jährlich'
]

// Methods
function handleSave() {
  emit('save', { ...localEvent.value })
}

function handleDelete() {
  emit('delete')
}

function handleCancel() {
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
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
            <h3 class="mb-4 text-xl font-semibold">Termin bearbeiten</h3>
            
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <!-- Title -->
              <input
                v-model="localEvent.title"
                type="text"
                placeholder="Bezeichnung"
                class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
              />
              
              <!-- Start Date -->
              <div>
                <label class="block text-sm text-gray-300 mb-1">Startdatum</label>
                <input
                  v-model="localEvent.date"
                  type="datetime-local"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                />
              </div>
              
              <!-- Category -->
              <select
                v-model="localEvent.category"
                class="w-full p-2 rounded bg-white/10 text-sm text-white border-0 outline-0 focus:ring-0"
              >
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.name"
                  class="bg-[#0B1739] text-white"
                >
                  {{ category.name }}
                </option>
              </select>
              
              <!-- Repeat -->
              <select
                v-model="localEvent.repeat"
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
                  v-model="localEvent.endDate"
                  type="datetime-local"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                />
              </div>
              
              <!-- Location -->
              <input
                v-model="localEvent.location"
                type="text"
                placeholder="Ort"
                class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
              />
              
              <!-- Description -->
              <div>
                <label class="block text-sm text-gray-300 mb-1">Beschreibung</label>
                <textarea
                  v-model="localEvent.description"
                  placeholder="Beschreibung (optional)"
                  rows="3"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm resize-none"
                ></textarea>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex justify-between gap-2 mt-6">
              <!-- Delete Button -->
              <button
                @click="handleDelete"
                class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition"
              >
                🗑️ Löschen
              </button>

              <!-- Cancel/Save Buttons -->
              <div class="flex gap-2">
                <button
                  @click="handleCancel"
                  class="px-4 py-2 text-sm text-gray-300 bg-white/10 rounded hover:bg-white/20"
                >
                  Abbrechen
                </button>
                <button
                  @click="handleSave"
                  class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
