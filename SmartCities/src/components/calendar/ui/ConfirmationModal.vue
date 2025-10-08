// === CONFIRMATION MODAL COMPONENT ===
// components/ConfirmationModal.vue
<script setup lang="ts">
import { computed } from 'vue'

/**
 * ConfirmationModal Component
 * Universelles Bestätigungs-Modal für sicherheitsrelevante oder
 * bestätigungspflichtige Aktionen (z. B. Löschen, Warnungen, Hinweise).
 *
 * Features:
 * - Dynamische Darstellung für Info-, Warn- und Gefahrenszenarien
 * - Tastatursteuerung (Enter = Bestätigen, Escape = Abbrechen)
 * - Schließen durch Klick auf das Overlay
 * - Anpassbare Texte für Buttons, Titel und Nachricht
 *
 * Kommunikation:
 * - Props definieren Darstellung (Titel, Text, Typ)
 * - Emits geben Benutzeraktionen an die Elternkomponente weiter
 *
 * @component
 * @file ConfirmationModal.vue
 * @description Wiederverwendbarer Bestätigungsdialog mit flexiblem Design und Verhalten.
 * @author Kire Bozinovski, Dalshad Ahmad
 */

/**
 * Öffentliche Eigenschaften (Props) der Komponente.
 */
interface Props {
  isVisible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

/**
 * Props mit Standardwerten (über withDefaults definiert).
 */
const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Bestätigen',
  cancelText: 'Abbrechen',
  type: 'info'
})

/**
 * Events, die bei Benutzerinteraktion ausgelöst werden.
 */
const emit = defineEmits<{
  'confirm': []
  'cancel': []
}>()

/**
 * Gibt die Farbe des Icons basierend auf dem Typ des Modals zurück.
 * @returns CSS-Klasse für Icon-Farbe.
 */
const iconClasses = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
    default:
      return 'text-blue-500'
  }
})

/**
 * Gibt die Farbklasse für den Bestätigungsbutton zurück.
 * @returns CSS-Klasse für Button-Farbe.
 */
const buttonClasses = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-700'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-700'
    case 'info':
    default:
      return 'bg-blue-600 hover:bg-blue-700'
  }
})

/**
 * Bestätigt die Aktion und löst das "confirm"-Event aus.
 * @emits confirm
 */
function handleConfirm() {
  emit('confirm')
}


/**
 * Bricht die Aktion ab und schließt das Modal.
 * @emits cancel
 */
function handleCancel() {
  emit('cancel')
}


/**
 * Schließt das Modal, wenn außerhalb des Dialogbereichs geklickt wird.
 * @param event Mausereignis für Overlay-Klick
 * @emits cancel
 */
function handleBackdropClick(event: Event) {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}


/**
 * Handhabt Tastatureingaben für Enter (Bestätigen) und Escape (Abbrechen).
 * @param event KeyboardEvent – gedrückte Taste
 * @emits confirm
 * @emits cancel
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleCancel()
  } else if (event.key === 'Enter') {
    handleConfirm()
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
        class="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center w-full h-full bg-black/50 backdrop-blur-sm"
        @click="handleBackdropClick"
        @keydown="handleKeydown"
        tabindex="-1"
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
            <div class="text-center">
              <!-- Icon -->
              <div class="mx-auto mb-4 w-12 h-12" :class="iconClasses">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
              
              <!-- Title -->
              <h3 class="mb-2 text-lg font-semibold text-white">{{ title }}</h3>
              
              <!-- Message -->
              <p class="mb-6 text-gray-300">{{ message }}</p>
              
              <!-- Action Buttons -->
              <div class="flex justify-center gap-3">
                <button
                  @click="handleCancel"
                  class="px-6 py-2.5 text-sm font-medium text-gray-300 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                  {{ cancelText }}
                </button>
                <button
                  @click="handleConfirm"
                  class="px-6 py-2.5 text-sm font-medium text-white rounded-lg transition"
                  :class="buttonClasses"
                >
                  {{ confirmText }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>