// composables/useDropdown.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useDropdown() {
  const showDropdown = ref(false)

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  const closeDropdown = () => {
    showDropdown.value = false
  }

  const openDropdown = () => {
    showDropdown.value = true
  }

  // Schließe Dropdown bei Klick außerhalb
  const handleClickOutside = (event) => {
    // Prüfe ob der Klick außerhalb des Dropdown-Bereichs war
    const dropdownElements = document.querySelectorAll('[data-dropdown]')
    let clickedOutside = true

    dropdownElements.forEach(element => {
      if (element.contains(event.target)) {
        clickedOutside = false
      }
    })

    if (clickedOutside) {
      closeDropdown()
    }
  }

  // Schließe Dropdown bei Escape-Taste
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      closeDropdown()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
  })

  return {
    showDropdown,
    toggleDropdown,
    closeDropdown,
    openDropdown
  }
}

// Erweiterte Version für spezifische Dropdown-Referenzen
export function useDropdownWithRef(dropdownRef) {
  const showDropdown = ref(false)

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }

  const closeDropdown = () => {
    showDropdown.value = false
  }

  const openDropdown = () => {
    showDropdown.value = true
  }

  // Schließe Dropdown bei Klick außerhalb der spezifischen Referenz
  const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
      closeDropdown()
    }
  }

  // Schließe Dropdown bei Escape-Taste
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      closeDropdown()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
  })

  return {
    showDropdown,
    toggleDropdown,
    closeDropdown,
    openDropdown
  }
}