// === MODAL STORE COMPOSABLE ===
// composables/useModalStore.ts
import { ref } from 'vue'

export function useModalStore() {
  // Modal visibility state
  const showPopup = ref(false)
  const showEditPopup = ref(false)
  const showNewEventPopup = ref(false)
  const showFilters = ref(false)
  const showCategoriesPopup = ref(false)
  const showDeleteEventConfirm = ref(false)
  const showDeleteCategoryConfirm = ref(false)

  // Dropdown toggle methods
  function togglePopup() {
    showPopup.value = !showPopup.value
  }

  function toggleFilters() {
    showFilters.value = !showFilters.value
  }

  // Close all dropdown methods
  function closeAllDropdowns() {
    showFilters.value = false
    showPopup.value = false
  }

  // Modal opening methods
  function openNewEventPopup() {
    showNewEventPopup.value = true
    showPopup.value = false
  }

  function openCategoriesPopup() {
    showCategoriesPopup.value = true
    showPopup.value = false
  }

  function openEditPopup() {
    showEditPopup.value = true
  }

  function openDeleteEventConfirm() {
    showDeleteEventConfirm.value = true
  }

  function openDeleteCategoryConfirm() {
    showDeleteCategoryConfirm.value = true
  }

  // Modal closing methods
  function closeEditPopup() {
    showEditPopup.value = false
  }

  function closeNewEventPopup() {
    showNewEventPopup.value = false
  }

  function closeCategoriesPopup() {
    showCategoriesPopup.value = false
  }

  function closeDeleteEventConfirm() {
    showDeleteEventConfirm.value = false
  }

  function closeDeleteCategoryConfirm() {
    showDeleteCategoryConfirm.value = false
  }

  // Cancel methods (alias for close methods)
  function cancelDeleteEvent() {
    showDeleteEventConfirm.value = false
  }

  function cancelDeleteCategory() {
    showDeleteCategoryConfirm.value = false
  }

  function cancelEdit() {
    showEditPopup.value = false
  }

  function cancelNewEvent() {
    showNewEventPopup.value = false
  }

  function cancelCategoryEdit() {
    showCategoriesPopup.value = false
  }

  // Close all modals
  function closeAllModals() {
    showPopup.value = false
    showEditPopup.value = false
    showNewEventPopup.value = false
    showFilters.value = false
    showCategoriesPopup.value = false
    showDeleteEventConfirm.value = false
    showDeleteCategoryConfirm.value = false
  }

  return {
    // State
    showPopup,
    showEditPopup,
    showNewEventPopup,
    showFilters,
    showCategoriesPopup,
    showDeleteEventConfirm,
    showDeleteCategoryConfirm,
    
    // Toggle methods
    togglePopup,
    toggleFilters,
    
    // Open methods
    openNewEventPopup,
    openCategoriesPopup,
    openEditPopup,
    openDeleteEventConfirm,
    openDeleteCategoryConfirm,
    
    // Close methods
    closeEditPopup,
    closeNewEventPopup,
    closeCategoriesPopup,
    closeDeleteEventConfirm,
    closeDeleteCategoryConfirm,
    closeAllDropdowns,
    closeAllModals,
    
    // Cancel methods (aliases)
    cancelDeleteEvent,
    cancelDeleteCategory,
    cancelEdit,
    cancelNewEvent,
    cancelCategoryEdit,
  }
}