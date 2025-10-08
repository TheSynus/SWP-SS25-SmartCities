// === EVENT CREATE MODAL COMPONENT ===
// components/EventCreateModal.vue
<script setup lang="ts">
import { ref, watch, computed } from 'vue'

/**
 * EventCreateModal Component 
 * Modal-Dialog zum Erstellen eines neuen Termins.
 *
 * Features:
 * - Formular für alle Termindaten (Titel, Datum, Kategorie, Wiederholung, Ort, Beschreibung)
 * - Dynamische Anzeige des Enddatums bei wiederholenden Terminen
 * - Automatisches Zurücksetzen des Formulars beim Öffnen/Schließen
 * - Animationen über Vue Transitions und Teleport
 *
 * Kommunikation:
 * - Props übergeben Sichtbarkeit und verfügbare Kategorien
 * - Emits geben Aktionen an die Elternkomponente: close, save(event)
 *
 * @component
 * @file EventCreateModal.vue
 * @description Modal zur Erstellung eines neuen Termins im Smart-Cities-Dashboard.
 * @author Kire Bozinovski, Dalshad Ahmad
 */

/**
 * Struktur für ein neu zu erstellendes Event.
 */
interface NewEvent {
  title: string
  date: string
  category: string
  repeat: string
  location: string
  description: string
  endDate: string
}

/**
 * Kategorie-Objekt, das in der Dropdown-Auswahl verfügbar ist.
 */
interface Category {
  id: number
  name: string
  color: string
}

/**
 * Öffentliche Eigenschaften (Props) der Komponente.
 */
interface Props {
  isVisible: boolean
  categories: Category[]
}

/**
 * Props-Definition ohne Standardwerte.
 */
const props = defineProps<Props>()


/**
 * Events, die an die Elternkomponente gesendet werden.
 */
const emit = defineEmits<{
  'close': []
  'save': [event: NewEvent]
}>()

/**
 * Lokales Event-Objekt, das im Formular gebunden ist.
 * Wird bei jedem Öffnen des Modals automatisch zurückgesetzt.
 */
const newEvent = ref<NewEvent>({
  title: '',
  date: '',
  category: '',
  repeat: '',
  location: '',
  description: '',
  endDate: '',
})

/**
 * Beobachtet den Sichtbarkeitsstatus (`isVisible`).
 * Wenn das Modal geöffnet wird, wird das Formular automatisch geleert.
 */
watch(() => props.isVisible, (isVisible) => {
  if (isVisible) {
    resetForm()
  }
})

/**
 * Steuert, ob das Enddatum angezeigt werden soll.
 * Nur bei wiederholenden Terminen aktiv.
 */
const showEndDate = computed(() => {
  return newEvent.value.repeat && newEvent.value.repeat !== 'Keine'
})

/**
 * Vordefinierte Auswahlmöglichkeiten für Wiederholungen.
 */
const repeatOptions = [
  'Keine',
  'Täglich',
  'Wöchentlich',
  'Monatlich',
  'Jährlich'
]

/**
 * Setzt das Formular auf die Standardwerte zurück.
 * Wird beim Öffnen und Schließen des Modals aufgerufen.
 */
function resetForm() {
  newEvent.value = {
    title: '',
    date: '',
    category: '',
    repeat: '',
    location: '',
    description: '',
    endDate: '',
  }
}

/**
 * Sendet das ausgefüllte Formular an die Elternkomponente.
 * @emits save
 */
function handleSave() {
  console.log('Saving new event:', newEvent.value) // Debug
  emit('save', { ...newEvent.value })
}

/**
 * Bricht die Erstellung ab, schließt das Modal und setzt das Formular zurück.
 * @emits close
 */
function handleCancel() {
  emit('close')
  resetForm()
}

/**
 * Schließt das Modal, wenn außerhalb des Dialogbereichs geklickt wird.
 * @param event Mausereignis für Overlay-Klick
 * @emits close
 */
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
                  v-model="newEvent.date"
                  type="datetime-local"
                  class="w-full p-2 rounded bg-white/10 border border-white/20 text-sm"
                />
              </div>
              
              <!-- Category -->
              <select
                v-model="newEvent.category"
                class="w-full p-2 rounded bg-white/10 text-sm text-white border-0 outline-0 focus:ring-0"
              >
                <option disabled value="" class="bg-[#0B1739] text-gray-400">Kategorie wählen</option>
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
                v-model="newEvent.repeat"
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
                  v-model="newEvent.endDate"
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
                class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
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
