// composables/map/useToast.js
import { ref } from 'vue'

export function useToast() {
  const showSuccessToast = ref(false)
  const successMessage = ref('')
  const toastTimeout = ref(null)

  const showToast = (message, duration = 3000) => {
    // Vorherigen Toast abbrechen falls aktiv
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value)
    }
    
    successMessage.value = message
    showSuccessToast.value = true
    
    // Automatisch nach 'duration' Millisekunden schließen
    toastTimeout.value = setTimeout(() => {
      closeSuccessToast()
    }, duration)
  }

  const closeSuccessToast = () => {
    showSuccessToast.value = false
    successMessage.value = ''
    
    if (toastTimeout.value) {
      clearTimeout(toastTimeout.value)
      toastTimeout.value = null
    }
  }

  // Verschiedene Toast-Typen für zukünftige Erweiterungen
  const showSuccess = (message, duration = 3000) => {
    showToast(`✅ ${message}`, duration)
  }

  const showErrorToast = (message, duration = 4000) => {
    showToast(`❌ ${message}`, duration)
  }

  const showInfoToast = (message, duration = 3000) => {
    showToast(`ℹ️ ${message}`, duration)
  }

  const showWarningToast = (message, duration = 3500) => {
    showToast(`⚠️ ${message}`, duration)
  }

  return {
    // Reactive states
    showSuccessToast,
    successMessage,
    
    // Core functions
    showToast,
    closeSuccessToast,
    
    // Type-specific functions
    showSuccess,
    showErrorToast,
    showInfoToast,
    showWarningToast
  }
}