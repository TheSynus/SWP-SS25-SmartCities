// === CALENDAR STORE COMPOSABLE (FINAL VERSION - UNBEKANNT FALLBACK) ===
// composables/useCalendarStore.ts
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export interface Event {
  id: string | number
  title: string
  start_time: string
  end_time: string
  category: string
  recurrence: string
  location: string
  description: string
}

export interface Category {
  id: number
  title: string
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
  const searchQuery = ref<string | null>(null)
  const selectedEvent = ref<Event | null>(null)
  const selectedCategory = ref<Category | null>(null)

  const filterForm = ref<FilterForm>({
    date: '',
    category: '',
    location: '',
    searchText: '',
  })

  const newEvent = ref({
    title: '',
    start_time: '',
    category: '',
    recurrence: '',
    location: '',
    description: '',
    end_time: '',
  })

  const categories = ref<Category[]>([])
  const events = ref<Event[]>([])

  // Beim Start laden
  onMounted(async () => {
    await getCategories()
    await loadEvents()
  })

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

  let filteredEvents = computed(() => {
    let filtered = events.value
    console.log("filteredEvents!--")

    // Calendar Date Filter (has priority)
    if (selectedDate.value) {
      const expandedEvents = getExpandedEvents()
      filtered = expandedEvents.filter((event) => event.start_time.startsWith(selectedDate.value!))
    }

    // Search Text Filter
    if (filterForm.value.searchText.trim()) {
      const searchLower = filterForm.value.searchText.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.category.toLowerCase().includes(searchLower),
      )
    }

    // Date Filter
    if (filterForm.value.date) {
      filtered = filtered.filter((event) => event.start_time.startsWith(filterForm.value.date))
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

    // Sort by date ascending
    return filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  })

  const todayStr = new Date().toLocaleDateString('sv-SE')

  // ========================================
  // HELPER: Category by ID (Fallback Pattern)
  // ========================================
  function getCategoryById(categoryTitle: string): Category | undefined {
    return categories.value.find((cat) => cat.title === categoryTitle)
  }

  // ========================================
  // HELPER: Get Category Color with Fallback
  // ========================================
  function getCategoryColor(categoryTitle: string): string {
    const category = getCategoryById(categoryTitle)
    return category?.color || '#6B7280' // Fallback: Grau für "Unbekannt"
  }

  // Calendar Helper Methods
  function daysInMonth(date: Date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return new Date().getDate()
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function firstDayOffset(date: Date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      const fallbackDate = new Date()
      const jsDay = new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), 1).getDay()
      return (jsDay + 6) % 7
    }
    const jsDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return (jsDay + 6) % 7
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

  // Event Expansion for Recurring Events
  function getExpandedEvents() {
    const expandedEvents: Event[] = []

    events.value.forEach((event) => {
      expandedEvents.push(event)

      if (event.recurrence && event.recurrence !== 'none' && event.recurrence !== 'Keine' && event.end_time) {
        const startDate = new Date(event.start_time)
        const end_time = new Date(event.end_time)
        let currentDate = new Date(startDate)

        switch (event.recurrence) {
          case 'daily':
          case 'Täglich':
            currentDate.setDate(currentDate.getDate() + 1)
            while (currentDate <= end_time) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                start_time: currentDate.toISOString().slice(0, 16),
              })
              currentDate.setDate(currentDate.getDate() + 1)
            }
            break

          case 'weekly':
          case 'Wöchentlich':
            currentDate.setDate(currentDate.getDate() + 7)
            while (currentDate <= end_time) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                start_time: currentDate.toISOString().slice(0, 16),
              })
              currentDate.setDate(currentDate.getDate() + 7)
            }
            break

          case 'monthly':
          case 'Monatlich':
            currentDate.setMonth(currentDate.getMonth() + 1)
            while (currentDate <= end_time) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                start_time: currentDate.toISOString().slice(0, 16),
              })
              currentDate.setMonth(currentDate.getMonth() + 1)
            }
            break

          case 'yearly':
          case 'Jährlich':
            currentDate.setFullYear(currentDate.getFullYear() + 1)
            while (currentDate <= end_time) {
              expandedEvents.push({
                ...event,
                id: `${event.id}-repeat-${currentDate.getTime()}`,
                start_time: currentDate.toISOString().slice(0, 16),
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
      .filter((e) => e.start_time.startsWith(dateString))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  // Filter Methods
  function applyFilters() {
    // Filter is automatically applied through computed property
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
    console.log('Opening edit popup for event:', event)

    if (event.id.toString().includes('-repeat-')) {
      const originalId = event.id.toString().split('-repeat-')[0]
      const originalEvent = events.value.find((e) => e.id.toString() === originalId)
      if (originalEvent) {
        selectedEvent.value = { ...originalEvent }
        console.log('Found original event for repeat:', originalEvent)
      }
    } else {
      selectedEvent.value = { ...event }
    }

    console.log('Selected event for editing:', selectedEvent.value)
  }

  async function saveEvent(eventData?: any) {
    try {
      const eventToSave = eventData || selectedEvent.value

      if (!eventToSave) {
        console.error('No event to save')
        return
      }

      console.log('Saving event with ID:', eventToSave.id)
      console.log('Event data:', eventToSave)

      await updateEventInDB(eventToSave)

      const index = events.value.findIndex((e) => e.id === eventToSave.id)
      if (index !== -1) {
        events.value[index] = { ...eventToSave }
        console.log('Event updated at index:', index)
        console.log('Updated event:', events.value[index])
      } else {
        console.error('Event not found in events array, ID:', eventToSave.id)
        console.log('Available event IDs:', events.value.map(e => e.id))
      }

      selectedEvent.value = null
    } catch (error) {
      console.error('Fehler beim Speichern des Events:', error)
      throw error
    }
  }

  function deleteEvent() {
    // This method triggers the confirmation modal
  }

  async function confirmDeleteEvent() {
    try {
      if (selectedEvent.value) {
        await deleteEventFromDB(selectedEvent.value.id)
        events.value = events.value.filter((e) => e.id !== selectedEvent.value!.id)
        selectedEvent.value = null
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Events:', error)
      throw error
    }
  }

  function cancelEdit() {
    selectedEvent.value = null
  }

  function openNewEventPopup() {
    newEvent.value = {
      title: '',
      start_time: '',
      category: '',
      recurrence: '',
      location: '',
      description: '',
      end_time: '',
    }
  }

  async function saveNewEvent(eventData?: any) {
  try {
    const dataToSave = eventData || newEvent.value
    console.log("📝 Erstelle neues Event:", dataToSave)

    if (!dataToSave.title?.trim()) {
      alert('Bitte geben Sie einen Titel für den Termin ein.')
      return false
    }

    if (!dataToSave.start_time) {
      alert('Bitte wählen Sie ein Datum für den Termin.')
      return false
    }

    // ← FIX: end_time Fallback - wenn leer, nutze start_time
    const end_time = dataToSave.end_time || dataToSave.start_time

    const newEventToSave: Event = {
      id: 0,
      title: dataToSave.title?.trim() || '',
      start_time: dataToSave.start_time || '',
      end_time: end_time,  // ← Niemals leer!
      category: dataToSave.category || (categories.value.length > 0 ? categories.value[0].title : 'Unbekannt'),
      recurrence: dataToSave.recurrence || 'none',
      location: dataToSave.location || '',
      description: dataToSave.description || '',
    }

    console.log('✅ Event-Objekt vorbereitet:', newEventToSave)

    const createdEvent = await addEvent(newEventToSave)
    events.value.push(createdEvent)

    console.log('✅ Event erfolgreich erstellt:', createdEvent)

    if (!eventData) {
      newEvent.value = {
        title: '',
        start_time: '',
        category: '',
        recurrence: '',
        location: '',
        description: '',
        end_time: '',
      }
    }

    return true
  } catch (error: any) {
    console.error('❌ Fehler beim Erstellen des Events:', error)
    console.error('❌ Error Response:', error.response?.data)
    alert(`Fehler beim Erstellen des Events:\n${error.response?.data?.message || error.message}`)
    return false
  }
}

  function cancelNewEvent() {
    newEvent.value = {
      title: '',
      start_time: '',
      category: '',
      recurrence: '',
      location: '',
      description: '',
      end_time: '',
    }
  }

  // ========================================
  // CATEGORY CRUD - VEREINFACHT
  // ========================================
  function openCategoriesPopup() {
    selectedCategory.value = null
  }

  function selectCategoryForEdit(category: Category) {
    selectedCategory.value = category
  }

  function setSearchQuery(query: string){
    console.log("CalendarStore: Query gesetzt:" + searchQuery)
    searchQuery.value = query
    filterForm.value = {
      date: '',
      category: '',
      location: '',
      searchText: query,
    }
  }

  function updateFilterForm(newForm: FilterForm){
    filterForm.value = newForm
  }

  // ========================================
  // FIX 1: IMPORT EVENTS - BEHÄLT ORIGINAL-KATEGORIEN
  // ========================================
  async function importEvents(list: Event[]) {
    try {
      if (categories.value.length === 0) {
        throw new Error('❌ Keine Kategorien verfügbar. Bitte erstellen Sie zuerst eine Kategorie.')
      }

      // Erstelle Set der bekannten Kategorien (lowercase für case-insensitive Vergleich)
      const known = new Set(categories.value.map(c => c.title.toLowerCase()))

      // Warne bei unbekannten Kategorien, aber mappe sie NICHT um
      list.forEach(ev => {
        if (ev.category && !known.has(ev.category.toLowerCase())) {
          console.warn(`⚠️ Event "${ev.title}": Kategorie "${ev.category}" existiert nicht - wird als "Unbekannt" angezeigt`)
        }
      })

      let successCount = 0
      let errorCount = 0
      const errors: string[] = []
      const warnings: string[] = []

      for (const event of list) {
        try {
          // Prüfe ob Kategorie existiert
          const categoryExists = event.category && known.has(event.category.toLowerCase())

          if (!categoryExists && event.category) {
            warnings.push(event.title)
          }

          const createdEvent = await addEvent(event)
          events.value.push(createdEvent)
          successCount++
        } catch (error: any) {
          console.error(`❌ Fehler beim Importieren von "${event.title}":`, error)
          errorCount++
          errors.push(`${event.title}: ${error.message}`)
        }
      }

      console.log(`✅ ${successCount} Events erfolgreich importiert`)

      // Alert mit Zusammenfassung
      let message = `✅ ${successCount} Events erfolgreich importiert!`

      if (warnings.length > 0) {
        message += `\n\n⚠️ ${warnings.length} Event(s) haben unbekannte Kategorien und werden als "Unbekannt" angezeigt:\n${warnings.join(', ')}`
      }

      if (errorCount > 0) {
        message += `\n\n❌ ${errorCount} Event(s) konnten nicht importiert werden.\nDetails siehe Console (F12)`
        console.warn(`⚠️ ${errorCount} Events konnten nicht importiert werden:`, errors)
      }

      alert(message)

    } catch (error: any) {
      console.error('Fehler beim Importieren der Events:', error)
      alert(`❌ Import fehlgeschlagen: ${error.message}`)
      throw error
    }
  }

  // ========================================
  // REST API CATEGORIES
  // ========================================
  const getCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categorys`)
      console.log('Categories from API:', response.data)

      // Direkt Hex-Farben verwenden (keine Konvertierung mehr)
      categories.value = response.data

      console.log('Categories loaded:', categories.value)
    } catch (error) {
      console.error('Fehler beim Abrufen der Kategorien:', error)
      throw error
    }
  }

  // ========================================
  // REST API EVENTS
  // ========================================
  const loadEvents = async () => {
    try {
      const loadedEvents = await fetchEventsFromDB()
      events.value = loadedEvents

      console.log(`${loadedEvents.length} Events erfolgreich aus DB geladen`)
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error)
      throw error
    }
  }

  // Backend Appointment Interface
  interface AppointmentFromDB {
    id: number
    title: string
    start_time: string
    end_time: string
    location: string
    recurrence: string
    description: string
    category_title: string
    category_color: string
  }

  interface AppointmentToDB {
    title: string
    start_time: string
    end_time: string
    location: string
    category_id: number
    recurrence: string
    description: string
  }

  // ========================================
  // FIX 2: getCategoryIdByTitle - NUR FÜR DB-SPEICHERUNG
  // Original-Kategorie bleibt im Event erhalten!
  // ========================================
  async function getCategoryIdByTitle(categoryTitle: string): Promise<number> {
  try {
    const response = await axios.get<Category[]>(`${import.meta.env.VITE_API_URL}/categorys`)

    console.log('🏷️ Verfügbare Kategorien:', response.data.map(c => c.title))
    console.log('🔍 Suche Kategorie:', categoryTitle)

    if (response.data.length === 0) {
      throw new Error('❌ Keine Kategorien in der Datenbank vorhanden!')
    }

    // 1. Versuch: Exakte Kategorie finden
    let category = response.data.find((cat) => cat.title === categoryTitle)

    if (!category) {
      console.warn(`⚠️ Kategorie "${categoryTitle}" nicht gefunden`)

      // 2. Versuch: Case-insensitive Suche
      category = response.data.find((cat) =>
        cat.title.toLowerCase() === categoryTitle.toLowerCase()
      )

      if (category) {
        console.log(`→ Gefunden via case-insensitive: "${category.title}"`)
        return category.id
      }

      // 3. Versuch: "Unbekannt" oder "Sonstiges"
      category = response.data.find((cat) =>
        cat.title.toLowerCase() === 'unbekannt' ||
        cat.title.toLowerCase() === 'sonstiges'
      )

      if (category) {
        console.log(`→ Verwende Fallback-Kategorie: "${category.title}" (ID: ${category.id})`)
        return category.id
      }

      // 4. Versuch: Erste verfügbare Kategorie
      console.log(`→ Verwende erste verfügbare Kategorie: "${response.data[0].title}" (ID: ${response.data[0].id})`)
      return response.data[0].id
    }

    console.log(`✅ Kategorie gefunden: "${category.title}" (ID: ${category.id})`)
    return category.id

  } catch (error) {
    console.error('❌ Fehler beim Abrufen der Kategorie-ID:', error)
    throw error
  }
}

  // Hilfsfunktion: Konvertiert datetime-local Format zu ISO 8601
  function formatToISO(dateTimeLocal: string): string {
  if (!dateTimeLocal) return ''

  try {
    // Bereits ISO-Format
    if (dateTimeLocal.includes('Z') || dateTimeLocal.includes('+')) {
      return dateTimeLocal
    }

    // ← FIX: Füge :00 für Sekunden hinzu wenn fehlt
    let dateStr = dateTimeLocal
    if (dateStr.length === 16) {  // YYYY-MM-DDTHH:mm
      dateStr = `${dateStr}:00`   // → YYYY-MM-DDTHH:mm:ss
    }

    const date = new Date(dateStr)

    // Prüfe ob valides Datum
    if (isNaN(date.getTime())) {
      console.error('Ungültiges Datum:', dateTimeLocal)
      return dateTimeLocal
    }

    return date.toISOString() // → "2025-11-12T23:45:00.000Z"
  } catch (e) {
    console.error('Fehler beim Konvertieren zu ISO:', e)
    return dateTimeLocal
  }
}

  // Konvertierung: Backend Appointment → Frontend Event
  function appointmentToEvent(appointment: AppointmentFromDB): Event {
    return {
      id: appointment.id,
      title: appointment.title,
      start_time: appointment.start_time,
      end_time: appointment.end_time,
      category: appointment.category_title,
      recurrence: appointment.recurrence,
      location: appointment.location || '',
      description: appointment.description || ''
    }
  }

  // Konvertierung: Frontend Event → Backend Appointment (ohne ID)
  async function eventToAppointment(event: Event): Promise<AppointmentToDB> {
  const category_id = await getCategoryIdByTitle(event.category)

  // ← FIX: Sicherstellen dass IMMER ISO-Format verwendet wird
  const start_time = formatToISO(event.start_time)
  const end_time = event.end_time ? formatToISO(event.end_time) : formatToISO(event.start_time)

  console.log('🔄 Konvertiere zu Backend-Format:', {
    original_start: event.start_time,
    iso_start: start_time,
    original_end: event.end_time,
    iso_end: end_time
  })

  return {
    title: event.title,
    start_time: start_time,
    end_time: end_time,
    location: event.location,
    category_id: category_id,
    recurrence: event.recurrence,
    description: event.description
  }
}

  const addEvent = async (event: Event): Promise<Event> => {
    try {
      const appointmentData = await eventToAppointment(event)

      console.log('📤 Sende an Backend:', appointmentData)  // ← Neu!

      const response = await axios.post<AppointmentFromDB>(
        `${import.meta.env.VITE_API_URL}/appointments`,
        appointmentData
      )

      console.log('Event erfolgreich erstellt:', response.data.title)

      const fullEvent: Event = {
        id: response.data.id,
        title: response.data.title,
        start_time: response.data.start_time,
        end_time: response.data.end_time,
        category: event.category,  // ← WICHTIG: Behalte Original-Kategorie!
        recurrence: response.data.recurrence,
        location: response.data.location || '',
        description: response.data.description || ''
      }

      return fullEvent

    } catch (error) {
      console.error('Fehler beim Erstellen des Events:', error)
      throw error
    }
  }

  const deleteEventFromDB = async (eventId: string | number): Promise<void> => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/appointments/${eventId}`)
      console.log(`Event mit ID ${eventId} erfolgreich gelöscht`)
    } catch (error) {
      console.error('Fehler beim Löschen des Events:', error)
      throw error
    }
  }

  const fetchEventsFromDB = async (): Promise<Event[]> => {
    try {
      const response = await axios.get<AppointmentFromDB[]>(
        `${import.meta.env.VITE_API_URL}/appointments`
      )

      const events = response.data.map(appointmentToEvent)
      console.log(`${events.length} Events erfolgreich geladen`)
      return events

    } catch (error) {
      console.error('Fehler beim Abrufen der Events:', error)
      throw error
    }
  }

  const updateEventInDB = async (event: Event): Promise<Event> => {
    try {
      if (!event.id) {
        throw new Error('Event-ID ist erforderlich für Update')
      }

      const appointmentData = await eventToAppointment(event)

      const response = await axios.patch<AppointmentFromDB>(
        `${import.meta.env.VITE_API_URL}/appointments/${event.id}`,
        appointmentData
      )

      console.log('Event erfolgreich aktualisiert:', response.data.title)

      const updatedEvent: Event = {
        id: response.data.id,
        title: response.data.title,
        start_time: response.data.start_time,
        end_time: response.data.end_time,
        category: event.category,  // ← WICHTIG: Behalte Original-Kategorie!
        recurrence: response.data.recurrence,
        location: response.data.location || '',
        description: response.data.description || ''
      }

      return updatedEvent

    } catch (error) {
      console.error('Fehler beim Aktualisieren des Events:', error)
      throw error
    }
  }

  // ========================================
  // FIX 3: IMPORT FROM JSON - BEHÄLT ORIGINAL-KATEGORIEN
  // ========================================
  async function importEventsFromJSON(file: File): Promise<number> {
    try {
      const fileContent = await file.text()
      const importedData = JSON.parse(fileContent)

      const eventList: Event[] = Array.isArray(importedData) ? importedData : [importedData]

      const validEvents = eventList.filter(event => {
        return event.title && event.start_time
      })

      if (validEvents.length === 0) {
        throw new Error('❌ Keine gültigen Events in der Datei gefunden')
      }

      if (categories.value.length === 0) {
        throw new Error('❌ Keine Kategorien verfügbar. Bitte erstellen Sie zuerst eine Kategorie.')
      }

      const knownCategories = new Set(categories.value.map(c => c.title.toLowerCase()))

      const processedEvents = validEvents.map(event => {
        const hasValidCategory = event.category && knownCategories.has(event.category.toLowerCase())

        if (!hasValidCategory && event.category) {
          console.warn(`⚠️ Event "${event.title}": Kategorie "${event.category}" nicht gefunden - wird als "Unbekannt" angezeigt`)
        }

        return {
          ...event,
          // ← WICHTIG: Behalte Original-Kategorie bei (wird später als "Unbekannt" angezeigt)
          category: event.category || 'Unbekannt',
          recurrence: normalizeRecurrence(event.recurrence),
          location: event.location || '',
          description: event.description || '',
          end_time: event.end_time || '',
        }
      })

      let successCount = 0
      let errorCount = 0
      const errors: string[] = []
      const unknownCategories = new Set<string>()

      for (const event of processedEvents) {
        try {
          // Track unknown categories
          if (event.category && !knownCategories.has(event.category.toLowerCase())) {
            unknownCategories.add(event.category)
          }

          const createdEvent = await addEvent(event)
          events.value.push(createdEvent)
          successCount++
        } catch (error: any) {
          console.error(`❌ Fehler beim Importieren von Event "${event.title}":`, error)
          errorCount++
          errors.push(`${event.title}: ${error.message}`)
        }
      }

      console.log(`✅ ${successCount} von ${processedEvents.length} Events erfolgreich importiert`)

      if (errorCount > 0) {
        console.warn(`⚠️ ${errorCount} Events konnten nicht importiert werden:`, errors)
      }

      if (unknownCategories.size > 0) {
        console.warn(`⚠️ Folgende Kategorien existieren nicht und werden als "Unbekannt" angezeigt:`, Array.from(unknownCategories))
      }

      return successCount

    } catch (error: any) {
      console.error('Fehler beim Importieren der JSON-Datei:', error)
      throw new Error(`Fehler beim Lesen der JSON-Datei: ${error.message}`)
    }
  }

  function normalizeRecurrence(recurrence?: string): string {
    if (!recurrence) return 'none'

    const recurrenceMap: Record<string, string> = {
      'Keine': 'none',
      'Täglich': 'daily',
      'Wöchentlich': 'weekly',
      'Monatlich': 'monthly',
      'Jährlich': 'yearly',
      'none': 'none',
      'daily': 'daily',
      'weekly': 'weekly',
      'monthly': 'monthly',
      'yearly': 'yearly'
    }

    return recurrenceMap[recurrence] || 'none'
  }

  return {
    // State
    currentDate,
    selectedDate,
    selectedEvent,
    selectedCategory,
    filterForm,
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
    getCategoryById,
    getExpandedEvents,
    clearDateFilter,
    resetSingleFilter,
    applyFilters,
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
    selectCategoryForEdit,
    getEventsForDay,
    setSearchQuery,
    updateFilterForm,
    importEvents,
    importEventsFromJSON,
    getCategories,
    loadEvents
  }
}
