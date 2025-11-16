// composables/useDropdown.js
import { ref, onMounted, onUnmounted, type Events } from 'vue'
import type { Event } from '../calendar/useCalendarStore'
import type { Dropdown, DropdownOptions } from 'flowbite'

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
const handleClickOutside = (event: MouseEvent) => {
  const dropdownElements = document.querySelectorAll('[data-dropdown]')
  let clickedOutside = true

  dropdownElements.forEach(element => {
    if (element.contains(event.target as Node)) {
      clickedOutside = false
    }
  })

  if (clickedOutside) {
    closeDropdown()
  }
}

  // Schließe Dropdown bei Escape-Taste
const handleEscapeKey = (event: KeyboardEvent) => {
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