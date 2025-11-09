// === EVENT EDIT MODAL COMPONENT ===
// components/EventEditModal.vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin.ts'

// Admin Check
const { isAdmin } = useAdmin()

// Types
interface Event {
  id: string | number
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
  start_time: '',
  category: '',
  recurrence: '',
  location: '',
  description: '',
  end_time: '',
})

// Watch for prop changes
watch(() => props.event, (newEvent) => {
  if (newEvent) {
    // Konvertiere englische recurrence zu deutsch für Anzeige
    const recurrenceDE = recurrenceMapEnToDe[newEvent.recurrence] || 'Keine'
    
    localEvent.value = { 
      ...newEvent,
      recurrence: recurrenceDE,
      // Format datetime für datetime-local input (YYYY-MM-DDTHH:mm)
      start_time: formatDateTimeForInput(newEvent.start_time),
      end_time: formatDateTimeForInput(newEvent.end_time),
    }
    
    console.log('Event-Daten geladen ins EditModal:', localEvent.value) // Debug
  }
}, { immediate: true, deep: true })

// Computed
const showEndDate = computed(() => {
  return localEvent.value.recurrence && localEvent.value.recurrence !== 'Keine'
})

// Modal-Titel abhängig von Admin-Status
const modalTitle = computed(() => {
  return isAdmin.value ? 'Termin bearbeiten' : 'Termin-Details'
})

// Mapping: Deutsch (Anzeige) → Englisch (DB)
const recurrenceMapDeToEn: Record<string, string> = {
  'Keine': 'none',
  'Täglich': 'daily',
  'Wöchentlich': 'weekly',
  'Monatlich': 'monthly',
  'Jährlich': 'yearly'
}

// Mapping: Englisch (DB) → Deutsch (Anzeige)
const recurrenceMapEnToDe: Record<string, string> = {
  'none': 'Keine',
  'daily': 'Täglich',
  'weekly': 'Wöchentlich',
  'monthly': 'Monatlich',
  'yearly': 'Jährlich'
}

const repeatOptions = [
  'Keine',
  'Täglich',
  'Wöchentlich',
  'Monatlich',
  'Jährlich'
]

// Helper Functions
function formatDateTimeForInput(dateTime: string): string {
  if (!dateTime) return ''
  
  try {
    // Konvertiere ISO-String zu datetime-local Format (YYYY-MM-DDTHH:mm)
    const date = new Date(dateTime)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (e) {
    console.error('Fehler beim Formatieren des Datums:', e)
    return dateTime
  }
}

// Methods
function handleSave() {
  // Konvertiere deutsche Wiederholung zurück zu englisch für DB
  const eventToSave = {
    ...localEvent.value,
    recurrence: recurrenceMapDeToEn[localEvent.value.recurrence] || 'none'
  }
  
  console.log('Event zum Speichern (mit englischer recurrence):', eventToSave) // Debug
  emit('save', eventToSave)
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
            <h3 class="mb-4 text-xl font-semibold">{{ modalTitle }}</h3>
            
            <div class="space-y-3 max-h-96 overflow-y-auto">
              <!-- Title -->
              <input
                v-model="localEvent.title"
                type="text"
                placeholder="Bezeichnung"
                :disabled="!isAdmin"
                class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                :class="{ 'cursor-not-allowed opacity-70': !isAdmin }"
              />
              
              <!-- Start Date -->
              <div>
                <label class="block text-sm text-gray-300 mb-1">Startdatum</label>
                <input
                  v-model="localEvent.start_time"
                  type="datetime-local"
                  :disabled="!isAdmin"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                  :class="{ 'cursor-not-allowed opacity-70': !isAdmin }"
                />
              </div>
              
              <!-- Category -->
              <select
                v-model="localEvent.category"
                :disabled="!isAdmin"
                class="w-full p-2 rounded bg-white/10 text-sm text-white border-0 outline-0 focus:ring-0"
                :class="{ 'cursor-not-allowed opacity-70': !isAdmin }"
              >
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.title"
                  class="bg-[#0B1739] text-white"
                >
                  {{ category.title }}
                </option>
              </select>
              
              <!-- Repeat -->
              <select
                v-model="localEvent.recurrence"
                :disabled="!isAdmin"
                class="w-full p-2 rounded bg-white/10 text-sm text-white border-0 outline-0 focus:ring-0"
                :class="{ 'cursor-not-allowed opacity-70': !isAdmin }"
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
                  v-model="localEvent.end_time"
                  type="datetime-local"
                  :disabled="!isAdmin"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                  :class="{ 'cursor-not-allowed opacity-70': !isAdmin }"
                />
              </div>
              
              <!-- Location -->
              <input
                v-model="localEvent.location"
                type="text"
                placeholder="Ort"
                :disabled="!isAdmin"
                class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                :class="{ 'cursor-not-allowed opacity-70': !isAdmin }"
              />
              
              <!-- Description -->
              <div>
                <label class="block text-sm text-gray-300 mb-1">Beschreibung</label>
                <textarea
                  v-model="localEvent.description"
                  placeholder="Beschreibung (optional)"
                  rows="3"
                  :disabled="!isAdmin"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm resize-none"
                  :class="{ 'cursor-not-allowed opacity-70': !isAdmin }"
                ></textarea>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-2 mt-6" :class="isAdmin ? 'justify-between' : 'justify-end'">
              <!-- Delete Button (nur für Admin) -->
              <button
                v-if="isAdmin"
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
                  {{ isAdmin ? 'Abbrechen' : 'Schließen' }}
                </button>
                <button
                  v-if="isAdmin"
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