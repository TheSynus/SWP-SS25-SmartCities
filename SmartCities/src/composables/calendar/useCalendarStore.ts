// === CALENDAR STORE COMPOSABLE ===
// composables/useCalendarStore.ts
import { ref, computed } from 'vue'

export interface Event {
  id: string | number
  title: string
  date: string
  category: string
  repeat: string
  location: string
  description: string
  endDate: string
}

export interface Category {
  id: number
  name: string
  color: string
}

export interface FilterForm {
  date: string
  category: string
  location: string
  searchText: string
}

export function useCalendarStore() {
  // State
  const currentDate = ref(new Date())
  const selectedDate = ref<string | null>(null)
  const selectedEvent = ref<Event | null>(null)
  const selectedCategory = ref<Category | null>(null)
  const isCreatingNewCategory = ref(false)

  const filterForm = ref<FilterForm>({
    date: '',
    category: '',
    location: '',
    searchText: '',
  })

  const editingCategory = ref({
    id: null as number | null,
    name: '',
    color: '',
  })

  const newEvent = ref({
    title: '',
    date: '',
    category: '',
    repeat: '',
    location: '',
    description: '',
    endDate: '',
  })

  const categories = ref<Category[]>([
    { id: 1, name: 'Verwaltung', color: 'bg-blue-600' },
    { id: 2, name: 'Stadtservice', color: 'bg-green-600' },
    { id: 3, name: 'Freizeit', color: 'bg-purple-600' },
    { id: 4, name: 'Sonstiges', color: 'bg-gray-500' },
  ])

  const events = ref<Event[]>([
    {
      id: 1,
      title: 'Bürgersprechstunde',
      date: '2025-06-15T10:00',
      category: 'Verwaltung',
      repeat: 'Wöchentlich',
      location: 'Rathaus',
      description: 'Sprechstunde für Bürgeranliegen und Fragen',
      endDate: '2025-12-31T10:00',
    },
    {
      id: 2,
      title: 'Straßenreinigung Hauptstraße',
      date: '2025-06-16T07:00',
      category: 'Stadtservice',
      repeat: 'Monatlich',
      location: 'Hauptstraße',
      description: 'Reinigung und Wartung der Hauptstraße',
      endDate: '2025-12-16T07:00',
    },
    {
      id: 3,
      title: 'Stadtfest',
      date: '2025-06-20T14:00',
      category: 'Freizeit',
      repeat: 'Jährlich',
      location: 'Marktplatz',
      description: 'Jährliches Stadtfest mit Musik und Ständen',
      endDate: '2030-06-20T14:00',
    },
    {
      id: 4,
      title: 'Gemeinderatssitzung',
      date: '2025-06-18T19:00',
      category: 'Verwaltung',
      repeat: 'Monatlich',
      location: 'Sitzungssaal',
      description: 'Monatliche Sitzung des Gemeinderats',
      endDate: '2025-12-18T19:00',
    },
    {
      id: 5,
      title: 'Müllabfuhr Wohngebiet Nord',
      date: '2025-06-17T06:30',
      category: 'Stadtservice',
      repeat: 'Wöchentlich',
      location: 'Wohngebiet Nord',
      description: 'Wöchentliche Müllabholung im Wohngebiet Nord',
      endDate: '2025-12-17T06:30',
    },
    {
      id: 6,
      title: 'Konzert im Stadtpark',
      date: '2025-06-21T19:00',
      category: 'Freizeit',
      repeat: 'Keine',
      location: 'Stadtpark',
      description: 'Live-Konzert im Stadtpark mit lokalen Künstlern',
      endDate: '',
    },
  ])

  // Computed
  const month = computed(() => currentDate.value.toLocaleString('default', { month: 'long' }))
  const year = computed(() => currentDate.value.getFullYear())

  const hasActiveFilters = computed(() => {
    return (
      selectedDate.value ||
      filterForm.value.date ||
      filterForm.value.category ||
      filterForm.value.location.trim() ||
      filterForm.value.searchText.trim()
    )
  })

  const filteredEvents = computed(() => {
    let filtered = events.value

    // Calendar Date Filter (has priority)
    if (selectedDate.value) {
      const expandedEvents = getExpandedEvents()
      filtered = expandedEvents.filter((event) => event.date.startsWith(selectedDate.value!))
    } else {
      // Apply normal filters only if no calendar date selected

      // Search Text Filter
      if (filterForm.value.searchText.trim()) {
        const searchLower = filterForm.value.searchText.toLowerCase()
        filtered = filtered.filter(
          (event) =>
            event.title.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower),
        )
      }

      // Date Filter
      if (filterForm.value.date) {
        filtered = filtered.filter((event) => event.date.startsWith(filterForm.value.date))
      }

      // Category Filter
      if (filterForm.value.category) {
        filtered = filtered.filter((event) => event.category === filterForm.value.category)
      }

      // Location Filter
      if (filterForm.value.location.trim()) {
        const locationLower = filterForm.value.location.toLowerCase()
        filtered = filtered.filter((event) => event.location.toLowerCase().includes(locationLower))
      }
    }

    // Sort by date ascending
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  })

  const todayStr = new Date().toLocaleDateString('sv-SE')

  // Calendar Helper Methods
  function daysInMonth(date: Date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return new Date().getDate() // Fallback to current month days
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function firstDayOffset(date: Date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      const fallbackDate = new Date()
      const jsDay = new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), 1).getDay()
      return (jsDay + 6) % 7 // Convert Sunday=0 to Monday=0
    }
    const jsDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return (jsDay + 6) % 7 // Convert Sunday=0 to Monday=0
  }

  function previousMonth() {
    if (!currentDate.value || !(currentDate.value instanceof Date)) {
      currentDate.value = new Date()
    }
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  }

  function nextMonth() {
    if (!currentDate.value || !(currentDate.value instanceof Date)) {
      currentDate.value = new Date()
    }
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }

  function isToday(n: number) {
    if (!currentDate.value || !(currentDate.value instanceof Date) || isNaN(currentDate.value.getTime())) {
      return false
    }
    const d = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), n)
    return d.toLocaleDateString('sv-SE') === todayStr
  }

  function getDateString(n: number) {
    if (!currentDate.value || !(currentDate.value instanceof Date) || isNaN(currentDate.value.getTime())) {
      return new Date().toLocaleDateString('sv-SE')
    }
    const d = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), n)
    return d.toLocaleDateString('sv-SE')
  }

  function getCategoryColor(category: string) {
    const categoryData = categories.value.find((cat) => cat.name === category)
    return categoryData ? categoryData.color : 'bg-gray-500'
  }

  // Event Expansion for Recurring Events
  function getExpandedEvents() {
    const expandedEvents: Event[] = []

    events.value.forEach((event) => {
      // Add original event
      expandedEvents.push(event)

      // Add repeating events if applicable
      if (event.repeat && event.repeat !== 'Keine' && event.endDate) {
        const startDate = new Date(event.date)
        const endDate = new Date(event.endDate)
        let currentDate = new Date(startDate)

        // First repetition after start date
        switch (event.repeat) {
          case 'Täglich':
            currentDate.setDate(currentDate.getDate() + 1)
            while (currentDate <= endDate) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                date: currentDate.toISOString().slice(0, 16),
              })
              currentDate.setDate(currentDate.getDate() + 1)
            }
            break

          case 'Wöchentlich':
            currentDate.setDate(currentDate.getDate() + 7)
            while (currentDate <= endDate) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                date: currentDate.toISOString().slice(0, 16),
              })
              currentDate.setDate(currentDate.getDate() + 7)
            }
            break

          case 'Monatlich':
            currentDate.setMonth(currentDate.getMonth() + 1)
            while (currentDate <= endDate) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                date: currentDate.toISOString().slice(0, 16),
              })
              currentDate.setMonth(currentDate.getMonth() + 1)
            }
            break

          case 'Jährlich':
            currentDate.setFullYear(currentDate.getFullYear() + 1)
            while (currentDate <= endDate) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                date: currentDate.toISOString().slice(0, 16),
              })
              currentDate.setFullYear(currentDate.getFullYear() + 1)
            }
            break
        }
      }
    })

    return expandedEvents
  }

  function getEventsForDay(dayNumber: number) {
    const dateString = getDateString(dayNumber)
    return getExpandedEvents()
      .filter((e) => e.date.startsWith(dateString))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Filter Methods
  function applyFilters() {
    // Filter is automatically applied through computed property
    // This method exists for API compatibility
  }

  function resetFilters() {
    filterForm.value = {
      date: '',
      category: '',
      location: '',
      searchText: '',
    }
    selectedDate.value = null
  }

  function resetSingleFilter(filterKey: keyof FilterForm) {
    if (filterForm.value.hasOwnProperty(filterKey)) {
      filterForm.value[filterKey] = ''
    }
  }

  function selectDate(dayNumber: number) {
    const dateString = getDateString(dayNumber)
    selectedDate.value = dateString
    // Reset normal filters when calendar date is selected
    filterForm.value = {
      date: '',
      category: '',
      location: '',
      searchText: '',
    }
  }

  function clearDateFilter() {
    selectedDate.value = null
  }

  // Event CRUD Methods
  function openEditPopup(event: Event) {
    console.log('Opening edit popup for event:', event) // Debug
    
    // Check if it's a repeating event
    if (event.id.toString().includes('-repeat-')) {
      // For repeating events, find the original event
      const originalId = event.id.toString().split('-repeat-')[0]
      const originalEvent = events.value.find((e) => e.id.toString() === originalId)
      if (originalEvent) {
        selectedEvent.value = { ...originalEvent }
        console.log('Found original event for repeat:', originalEvent) // Debug
      }
    } else {
      // For normal events
      selectedEvent.value = { ...event }
    }
    
    console.log('Selected event for editing:', selectedEvent.value) // Debug
  }

  function saveEvent(eventData?: any) {
    // Wenn eventData übergeben wird, verwende das, sonst selectedEvent
    const eventToSave = eventData || selectedEvent.value
    
    if (!eventToSave) {
      console.error('No event to save')
      return
    }
    
    console.log('Saving event with ID:', eventToSave.id) // Debug
    console.log('Event data:', eventToSave) // Debug
    
    const index = events.value.findIndex((e) => e.id === eventToSave.id)
    if (index !== -1) {
      events.value[index] = { ...eventToSave }
      console.log('Event updated at index:', index) // Debug
      console.log('Updated event:', events.value[index]) // Debug
    } else {
      console.error('Event not found in events array, ID:', eventToSave.id)
      console.log('Available event IDs:', events.value.map(e => e.id))
    }
    
    selectedEvent.value = null
  }

  function deleteEvent() {
    // This method triggers the confirmation modal
    // Actual deletion happens in confirmDeleteEvent
  }

  function confirmDeleteEvent() {
    if (selectedEvent.value) {
      events.value = events.value.filter((e) => e.id !== selectedEvent.value!.id)
      selectedEvent.value = null
    }
  }

  function cancelEdit() {
    selectedEvent.value = null
  }

  function openNewEventPopup() {
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

  function saveNewEvent(eventData?: any) {
    // Verwende entweder die übergebenen Daten oder die lokalen newEvent Daten
    const dataToSave = eventData || newEvent.value
    
    if (!dataToSave.title?.trim()) {
      console.error('Cannot save event: Title is required')
      alert('Bitte geben Sie einen Titel für den Termin ein.')
      return false
    }
    
    if (!dataToSave.date) {
      console.error('Cannot save event: Date is required')
      alert('Bitte wählen Sie ein Datum für den Termin.')
      return false
    }
    
    const id = Date.now()
    const newEventToSave = {
      id,
      title: dataToSave.title || '',
      date: dataToSave.date || '',
      category: dataToSave.category || 'Sonstiges',
      repeat: dataToSave.repeat || 'Keine',
      location: dataToSave.location || '',
      description: dataToSave.description || '',
      endDate: dataToSave.endDate || '',
    }
    
    events.value.push(newEventToSave)
    console.log('New event saved:', newEventToSave) // Debug
    console.log('Total events:', events.value.length) // Debug
    
    // Reset form nur wenn lokale newEvent Daten verwendet wurden
    if (!eventData) {
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
    
    return true
  }

  function cancelNewEvent() {
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

  // Category CRUD Methods
  function openCategoriesPopup() {
    selectedCategory.value = null
    isCreatingNewCategory.value = false
    editingCategory.value = {
      id: null,
      name: '',
      color: '',
    }
  }

  function startNewCategory() {
    selectedCategory.value = null
    isCreatingNewCategory.value = true
    editingCategory.value = {
      id: null,
      name: '',
      color: 'bg-blue-600',
    }
  }

  
  function selectCategoryForEdit(category: Category) {
    selectedCategory.value = category
    editingCategory.value = {
      id: category.id,
      name: category.name,
      color: category.color,
    }
  }

  function saveCategoryChanges() {
    // Check if name already exists
    const nameExists = categories.value.some(
      (cat) =>
        cat.name.toLowerCase() === editingCategory.value.name.toLowerCase() &&
        cat.id !== editingCategory.value.id,
    )

    if (nameExists) {
      alert('Eine Kategorie mit diesem Namen existiert bereits!')
      return
    }

    if (isCreatingNewCategory.value) {
      // Create new category
      const newId = Math.max(...categories.value.map((cat) => cat.id)) + 1
      const newCategory = {
        id: newId,
        name: editingCategory.value.name,
        color: editingCategory.value.color,
      }
      categories.value.push(newCategory)
    } else if (editingCategory.value.id) {
      // Edit existing category
      const index = categories.value.findIndex((cat) => cat.id === editingCategory.value.id)
      if (index !== -1 && editingCategory.value.id !== null) {
        categories.value[index] = {
          id: editingCategory.value.id,
          name: editingCategory.value.name,
          color: editingCategory.value.color,
        }
      }
    }
  }

  function deleteCategory() {
    // This method triggers the confirmation modal
    // Actual deletion happens in confirmDeleteCategory
  }

  function confirmDeleteCategory() {
    if (selectedCategory.value) {
      const categoryToDelete = selectedCategory.value.name

      // Check if "Sonstiges" category exists, if not create it
      let sonstigesCategory = categories.value.find((cat) => cat.name === 'Sonstiges')
      if (!sonstigesCategory) {
        const newId = Math.max(...categories.value.map((cat) => cat.id)) + 1
        sonstigesCategory = { id: newId, name: 'Sonstiges', color: 'bg-gray-500' }
        categories.value.push(sonstigesCategory)
      }

      // Move all events of deleted category to "Sonstiges"
      events.value.forEach((event) => {
        if (event.category === categoryToDelete) {
          event.category = 'Sonstiges'
        }
      })

      // Delete category (except "Sonstiges")
      if (selectedCategory.value.name !== 'Sonstiges') {
        categories.value = categories.value.filter((cat) => cat.id !== selectedCategory.value!.id)
      }

      selectedCategory.value = null
      editingCategory.value = { id: null, name: '', color: '' }
    }
  }

  function cancelCategoryEdit() {
    selectedCategory.value = null
    isCreatingNewCategory.value = false
    editingCategory.value = { id: null, name: '', color: '' }
  }

  return {
    // State
    currentDate,
    selectedDate,
    selectedEvent,
    selectedCategory,
    isCreatingNewCategory,
    filterForm,
    editingCategory,
    newEvent,
    categories,
    events,
    
    // Computed
    month,
    year,
    hasActiveFilters,
    filteredEvents,
    
    // Calendar Methods
    daysInMonth,
    firstDayOffset,
    previousMonth,
    nextMonth,
    isToday,
    getDateString,
    getCategoryColor,
    getExpandedEvents,
    clearDateFilter,
    resetSingleFilter,
    applyFilters,

    // Event CRUD
    resetFilters,
    selectDate,
    
    // Event CRUD
    openEditPopup,
    saveEvent,
    deleteEvent,
    confirmDeleteEvent,
    cancelEdit,
    openNewEventPopup,
    saveNewEvent,
    cancelNewEvent,
    
    // Category CRUD
    openCategoriesPopup,
    startNewCategory,
    selectCategoryForEdit,
    saveCategoryChanges,
    deleteCategory,
    confirmDeleteCategory,
    cancelCategoryEdit,
    getEventsForDay
  }
}
