// === CALENDAR STORE COMPOSABLE ===
// composables/useCalendarStore.ts
import { ref, computed, onMounted } from 'vue'
import { Card } from '@/models/card'
import { Cat } from '@/models/cat'
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
  const isCreatingNewCategory = ref(false)

  const filterForm = ref<FilterForm>({
    date: '',
    category: '',
    location: '',
    searchText: '',
  })

  const editingCategory = ref({
    id: null as number | null,
    title: '',
    color: '',
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
    const categoryData = categories.value.find((cat) => cat.title === category)
    return categoryData ? categoryData.color : 'bg-gray-500'
  }

  // Event Expansion for Recurring Events
  function getExpandedEvents() {
    const expandedEvents: Event[] = []

    events.value.forEach((event) => {
      // Add original event
      expandedEvents.push(event)

      // Add repeating events if applicable
      // WICHTIG: event.recurrence kommt aus der DB und ist auf Englisch ('daily', 'weekly', etc.)
      if (event.recurrence && event.recurrence !== 'none' && event.recurrence !== 'Keine' && event.end_time) {
        const startDate = new Date(event.start_time)
        const end_time = new Date(event.end_time)
        let currentDate = new Date(startDate)

        // First repetition after start date
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

  async function saveEvent(eventData?: any) {
    try {
      // Wenn eventData übergeben wird, verwende das, sonst selectedEvent
      const eventToSave = eventData || selectedEvent.value
      
      if (!eventToSave) {
        console.error('No event to save')
        return
      }
      
      console.log('Saving event with ID:', eventToSave.id) // Debug
      console.log('Event data:', eventToSave) // Debug
      
      // REST API: Event in DB aktualisieren
      await updateEventInDB(eventToSave)
      
      // Lokale Liste aktualisieren
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
    } catch (error) {
      console.error('Fehler beim Speichern des Events:', error)
      throw error
    }
  }

  function deleteEvent() {
    // This method triggers the confirmation modal
    // Actual deletion happens in confirmDeleteEvent
  }

  async function confirmDeleteEvent() {
    try {
      if (selectedEvent.value) {
        // REST API: Event aus DB löschen
        await deleteEventFromDB(selectedEvent.value.id)
        
        // Lokale Liste aktualisieren
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
      // Verwende entweder die übergebenen Daten oder die lokalen newEvent Daten
      const dataToSave = eventData || newEvent.value
      console.log("Titel:"+ dataToSave.title)//Debug
      
      if (!dataToSave.title?.trim()) {
        console.error('Cannot save event: Title is required')
        alert('Bitte geben Sie einen Titel für den Termin ein.')
        return false
      }
      
      if (!dataToSave.date && !dataToSave.start_time) {
        console.error('Cannot save event: Date is required')
        alert('Bitte wählen Sie ein Datum für den Termin.')
        return false
      }
      
      // Event-Objekt für die DB vorbereiten
      const newEventToSave: Event = {
        id: 0, // Wird von DB generiert
        title: dataToSave.title || '',
        start_time: dataToSave.date || dataToSave.start_time || '',
        end_time: dataToSave.endDate || dataToSave.end_time || '',
        category: dataToSave.category || 'Sonstiges',
        recurrence: dataToSave.repeat || dataToSave.recurrence || 'Keine',
        location: dataToSave.location || '',
        description: dataToSave.description || '',
      }
      
      // REST API: Event in DB speichern
      const createdEvent = await addEvent(newEventToSave)
      
      // Lokale Liste aktualisieren
      events.value.push(createdEvent)
      
      console.log('New event saved:', createdEvent) // Debug
      console.log('Total events:', events.value.length) // Debug
      
      // Reset form nur wenn lokale newEvent Daten verwendet wurden
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
    } catch (error) {
      console.error('Fehler beim Erstellen des Events:', error)
      alert('Fehler beim Erstellen des Events. Bitte versuchen Sie es erneut.')
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

  // Category CRUD Methods
  function openCategoriesPopup() {
    selectedCategory.value = null
    isCreatingNewCategory.value = false
    editingCategory.value = {
      id: null,
      title: '',
      color: '',
    }
  }

  function startNewCategory() {
    selectedCategory.value = null
    isCreatingNewCategory.value = true
    editingCategory.value = {
      id: null,
      title: '',
      color: 'bg-blue-600',
    }
  }

  
  function selectCategoryForEdit(category: Category) {
    selectedCategory.value = category
    editingCategory.value = {
      id: category.id,
      title: category.title,
      color: category.color,
    }
  }

  function saveCategoryChanges(categoryData: any, isCreatingNewCategory:boolean) {
    // Check if name already exists
    console.log(isCreatingNewCategory)
    const nameExists = categories.value.some(
      (cat) =>
        cat.title.toLowerCase() === categoryData.title.toLowerCase() &&
        cat.id !== categoryData.id,
    )

    if (nameExists) {
      alert('Eine Kategorie mit diesem Namen existiert bereits!')
      return
    }

    if (isCreatingNewCategory) {
      // Create new category
      const newId = Math.max(...categories.value.map((cat) => cat.id)) + 1
      const newCategory = {
        id: newId,
        title: categoryData.title,
        color: categoryData.color,
      }
      categories.value.push(newCategory)
      
      console.log("Category NEU!:"+ newCategory.title + "---" + newCategory.color)
      addCategory(newCategory.title,  convertColor(newCategory.color))

    } else if (categoryData.id) {
      // Edit existing category
      const index = categories.value.findIndex((cat) => cat.id === categoryData.id)
      if (index !== -1 && categoryData.id !== null) {
        categories.value[index] = {
          id: categoryData.id,
          title: categoryData.title,
          color: categoryData.color,
        }

        //Update in DB
        updateCategory({
          id: categoryData.id,
          title: categoryData.title,
          color: convertColor(categoryData.color),
        })
      }
    }
  }

  function deleteCategory() {
    // This method triggers the confirmation modal
    // Actual deletion happens in confirmDeleteCategory
  }

  async function confirmDeleteCategory() {
    if (selectedCategory.value) {
      const categoryToDelete = selectedCategory.value.title

      // Check if "Sonstiges" category exists, if not create it
      let sonstigesCategory = categories.value.find((cat) => cat.title === 'Sonstiges')
      if (!sonstigesCategory) {
        const newId = Math.max(...categories.value.map((cat) => cat.id)) + 1
        sonstigesCategory = { id: newId, title: 'Sonstiges', color: 'bg-gray-500' }
        categories.value.push(sonstigesCategory)
        await addCategory(sonstigesCategory.title, convertColor(sonstigesCategory.color))
      }

      // Move all events of deleted category to "Sonstiges"
      const eventsToUpdate = events.value.filter((event) => event.category === categoryToDelete)
      
      for (const event of eventsToUpdate) {
        event.category = 'Sonstiges'
        // REST API: Event aktualisieren
        await updateEventInDB(event)
      }

      // Delete category (except "Sonstiges")
      if (selectedCategory.value.title !== 'Sonstiges') {
        // REST API: Kategorie löschen
        await deleteCategoryDB(selectedCategory.value.id)
        
        // Lokale Liste aktualisieren
        categories.value = categories.value.filter((cat) => cat.id !== selectedCategory.value!.id)
      }

      selectedCategory.value = null
      editingCategory.value = { id: null, title: '', color: '' }
    }
  }

  function cancelCategoryEdit() {
    selectedCategory.value = null
    isCreatingNewCategory.value = false
    editingCategory.value = { id: null, title: '', color: '' }
  }



  function setSearchQuery(query: string){
  console.log("CalendarStore: Query gestzet:" + searchQuery)
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


  async function importEvents(list: Event[]) {
    try {
      // Optional: Kategorie-Handling – unbekannte auf "Sonstiges" mappen.
      const known = new Set(categories.value.map(c => c.title.toLowerCase()))
      const safe = list.map(ev => ({
        ...ev,
        category: known.has(ev.category?.toLowerCase?.() ?? '')
          ? ev.category
          : 'Sonstiges'
      }))

      // REST API: Alle Events in DB speichern
      for (const event of safe) {
        const createdEvent = await addEvent(event)
        events.value.push(createdEvent)
      }
      
      console.log(`${safe.length} Events erfolgreich importiert`)
    } catch (error) {
      console.error('Fehler beim Importieren der Events:', error)
      throw error
    }
  }


  // REST API Categories.

  const getCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/categorys`)
      console.log(response.data)
      // Farben von Hex zu Tailwind konvertieren
      categories.value = response.data.map((cat: Category) => ({
        ...cat,
        color: convertColor(cat.color)
      }))

      console.log('Categories:', response.data)
    } catch (error) {
      console.error('Fehler beim Abrufen der Kategorien:', error)
      throw error
    }
  }
 
  const updateCategory = async (category: Category) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/categorys/${category.id}`, {
        title: category.title,
        color: category.color
      })
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error)
      throw error
    }
  }

  
  const addCategory = async (
      title: string, 
      color: string,
    ) => {
    try {
      const response = await axios.post<Cat>(`${import.meta.env.VITE_API_URL}/categorys`, {
        title,
        color,
      })

      console.log('Category', response.data)
    } catch (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error)
      throw error
    }
  }
  
  const deleteCategoryDB = async (id: number) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categorys/${id}`)
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error)
      throw error
    }
  }


  // REST API EVENTS - Lädt Events aus der DB
  
  const loadEvents = async () => {
    try {
      // REST API: Events aus DB laden (mit automatischer category_title Konvertierung)
      const loadedEvents = await fetchEventsFromDB()
      events.value = loadedEvents
      
      console.log(`${loadedEvents.length} Events erfolgreich aus DB geladen`)
    } catch (error) {
      console.error('Fehler beim Laden der Events:', error)
      throw error
    }
  }


 // Mapping zwischen Tailwind-Klassen und Hex-Farben
const TAILWIND_TO_HEX: Record<string, string> = {
  // --- Deine festen Kategorien ---
  "bg-orange-500": "#FF5733", // Verwaltung
  "bg-blue-400":   "#33C1FF", // Freizeit
  "bg-green-600":  "#28A745", // Stadtservice
  "bg-yellow-400": "#FFC300", // Sonstiges
  "bg-gray-500":   "#6B7280", // Neutral / Fallback

  // --- Erweiterte Tailwind-Farben (-600 Reihe) ---
  "bg-blue-600":   "#2563EB",
  "bg-purple-600": "#7E22CE",
  "bg-red-600":    "#DC2626",
  "bg-yellow-600": "#CA8A04",
  "bg-pink-600":   "#DB2777",
  "bg-indigo-600": "#4F46E5",
  "bg-orange-600": "#EA580C",
};

// Umkehr-Mapping automatisch erzeugen
const HEX_TO_TAILWIND = Object.fromEntries(
  Object.entries(TAILWIND_TO_HEX).map(([cls, hex]) => [hex.toUpperCase(), cls])
);

/**
 * Konvertiert zwischen Tailwind-Farben und Hex-Farben.
 * - Übergib z. B. "bg-green-600" → "#16A34A"
 * - Übergib z. B. "#16A34A" → "bg-green-600"
 */
 function convertColor(value: string): string {
  const trimmed = value.trim();

  // Bereits Hex -> nach Tailwind umwandeln
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    return HEX_TO_TAILWIND[upper] ?? upper; // Fallback: gib Hex zurück, falls kein Mapping vorhanden
  }

  // Tailwind -> nach Hex umwandeln
  if (TAILWIND_TO_HEX[trimmed]) return TAILWIND_TO_HEX[trimmed];

  // Optional: andere Präfixe (text-, border-) erlauben
  const normalized = trimmed.replace(/^(text|border)-/, "bg-");
  if (TAILWIND_TO_HEX[normalized]) return TAILWIND_TO_HEX[normalized];

  throw new Error(`Unbekanntes Farbformat: "${value}". Erwarte #RRGGBB oder bekannte Tailwind-Klasse.`);
}


// Backend Appointment Interface (wie es von der API kommt)
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

// Backend Appointment Interface (wie es zur API gesendet wird)
interface AppointmentToDB {
  title: string
  start_time: string
  end_time: string
  location: string
  category_id: number
  recurrence: string
  description: string
}

interface Category {
  id: number
  title: string
  color: string
}

// Hilfsfunktion: Kategorie-Name zu Kategorie-ID konvertieren
async function getCategoryIdByTitle(categoryTitle: string): Promise<number> {
  try {
    const response = await axios.get<Category[]>(`${import.meta.env.VITE_API_URL}/categorys`)
    const category = response.data.find((cat) => cat.title === categoryTitle)
    
    if (!category) {
      throw new Error(`Kategorie "${categoryTitle}" nicht gefunden`)
    }
    
    return category.id
  } catch (error) {
    console.error('Fehler beim Abrufen der Kategorie-ID:', error)
    throw error
  }
}

// Hilfsfunktion: Konvertiert datetime-local Format zu ISO 8601
function formatToISO(dateTimeLocal: string): string {
  if (!dateTimeLocal) return ''
  
  try {
    // Falls bereits ISO-Format, direkt zurückgeben
    if (dateTimeLocal.includes('Z') || dateTimeLocal.includes('+')) {
      return dateTimeLocal
    }
    
    // datetime-local Format (YYYY-MM-DDTHH:mm) zu ISO konvertieren
    // Füge Sekunden und Timezone hinzu
    const date = new Date(dateTimeLocal)
    return date.toISOString() // Ergibt: "2025-11-10T14:30:00.000Z"
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
    category: appointment.category_title, // category_title wird zu category
    recurrence: appointment.recurrence,
    location: appointment.location || '',
    description: appointment.description || ''
  }
}

// Konvertierung: Frontend Event → Backend Appointment (ohne ID)
async function eventToAppointment(event: Event): Promise<AppointmentToDB> {
  const category_id = await getCategoryIdByTitle(event.category)
  
  return {
    title: event.title,
    start_time: formatToISO(event.start_time), // ← ISO-Format
    end_time: formatToISO(event.end_time),     // ← ISO-Format
    location: event.location,
    category_id: category_id, // category wird zu category_id
    recurrence: event.recurrence,
    description: event.description
  }
}

/**
 * Fügt ein neues Event zur Datenbank hinzu
 * @param event - Das Event-Objekt (ohne ID oder mit temporärer ID)
 * @returns Das erstellte Event mit der DB-ID
 */
 const addEvent = async (event: Event): Promise<Event> => {
  try {
    // Event zu Appointment konvertieren (inkl. category_id Lookup)
    const appointmentData = await eventToAppointment(event)
    
    // POST-Request an Backend
    const response = await axios.post<AppointmentFromDB>(
      `${import.meta.env.VITE_API_URL}/appointments`,
      appointmentData
    )

    console.log('Event erfolgreich erstellt:', response.data.title)
    
    // Da POST nur die Basis-Daten zurückgibt, müssen wir das Event manuell zusammenbauen
    const fullEvent: Event = {
      id: response.data.id,
      title: response.data.title,
      start_time: response.data.start_time,
      end_time: response.data.end_time,
      category: event.category, // Original category name verwenden
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

/**
 * Löscht ein Event aus der Datenbank
 * @param eventId - Die ID des zu löschenden Events
 */
 const deleteEventFromDB = async (eventId: string | number): Promise<void> => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/appointments/${eventId}`)
    console.log(`Event mit ID ${eventId} erfolgreich gelöscht`)
  } catch (error) {
    console.error('Fehler beim Löschen des Events:', error)
    throw error
  }
}

/**
 * Ruft alle Events aus der Datenbank ab
 * @returns Array mit allen Events
 */
 const fetchEventsFromDB = async (): Promise<Event[]> => {
  try {
    const response = await axios.get<AppointmentFromDB[]>(
      `${import.meta.env.VITE_API_URL}/appointments`
    )
    
    // Alle Appointments zu Events konvertieren
    const events = response.data.map(appointmentToEvent)
    events.forEach(e => console.log(e))
    console.log(events.entries)
    console.log(`${events.length} Events erfolgreich geladen`)
    return events

  } catch (error) {
    console.error('Fehler beim Abrufen der Events:', error)
    throw error
  }
}

/**
 * Aktualisiert ein bestehendes Event in der Datenbank
 * @param event - Das zu aktualisierende Event (muss eine gültige ID haben)
 * @returns Das aktualisierte Event
 */
 const updateEventInDB = async (event: Event): Promise<Event> => {
  try {
    if (!event.id) {
      throw new Error('Event-ID ist erforderlich für Update')
    }

    // Event zu Appointment konvertieren (inkl. category_id Lookup)
    const appointmentData = await eventToAppointment(event)
    
    // PUT-Request an Backend
    const response = await axios.patch<AppointmentFromDB>(
      `${import.meta.env.VITE_API_URL}/appointments/${event.id}`,
      appointmentData
    )

    console.log('Event erfolgreich aktualisiert:', response.data.title)
    
    // Aktualisiertes Event zurückgeben
    const updatedEvent: Event = {
      id: response.data.id,
      title: response.data.title,
      start_time: response.data.start_time,
      end_time: response.data.end_time,
      category: event.category, // Original category name verwenden
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




/**
 * Importiert Events aus einer JSON-Datei
 * @param file - Die hochgeladene JSON-Datei
 * @returns Anzahl der erfolgreich importierten Events
 */
async function importEventsFromJSON(file: File): Promise<number> {
  try {
    // 1. Datei lesen
    const fileContent = await file.text()
    const importedData = JSON.parse(fileContent)
    
    // 2. Validieren: Sicherstellen, dass es ein Array ist
    const eventList: Event[] = Array.isArray(importedData) ? importedData : [importedData]
    
    // 3. Events validieren und bereinigen
    const validEvents = eventList.filter(event => {
      // Mindestanforderungen: title und start_time
      return event.title && event.start_time
    })
    
    if (validEvents.length === 0) {
      throw new Error('Keine gültigen Events in der Datei gefunden')
    }
    
    // 4. Kategorien prüfen und auf "Sonstiges" mappen wenn unbekannt
    const knownCategories = new Set(categories.value.map(c => c.title.toLowerCase()))
    
    const processedEvents = validEvents.map(event => ({
      ...event,
      // Kategorie validieren
      category: event.category && knownCategories.has(event.category.toLowerCase())
        ? event.category
        : 'Sonstiges',
      // Recurrence standardisieren (falls deutsch, zu englisch konvertieren)
      recurrence: normalizeRecurrence(event.recurrence),
      // Fehlende Felder mit Defaults füllen
      location: event.location || '',
      description: event.description || '',
      end_time: event.end_time || '',
    }))
    
    // 5. Events in DB speichern (einzeln)
    let successCount = 0
    for (const event of processedEvents) {
      try {
        const createdEvent = await addEvent(event)
        events.value.push(createdEvent)
        successCount++
      } catch (error) {
        console.error(`Fehler beim Importieren von Event "${event.title}":`, error)
        // Weiter mit nächstem Event
      }
    }
    
    console.log(`${successCount} von ${processedEvents.length} Events erfolgreich importiert`)
    return successCount
    
  } catch (error) {
    console.error('Fehler beim Importieren der JSON-Datei:', error)
    throw new Error('Fehler beim Lesen der JSON-Datei. Bitte stellen Sie sicher, dass es eine gültige JSON-Datei ist.')
  }
}


/**
 * Hilfsfunktion: Normalisiert recurrence-Werte
 * Konvertiert deutsche Werte zu englischen DB-Werten
 */
function normalizeRecurrence(recurrence?: string): string {
  if (!recurrence) return 'none'
  
  const recurrenceMap: Record<string, string> = {
    'Keine': 'none',
    'Täglich': 'daily',
    'Wöchentlich': 'weekly',
    'Monatlich': 'monthly',
    'Jährlich': 'yearly',
    // Englische Werte bleiben gleich
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
    getEventsForDay,
    setSearchQuery,
    updateFilterForm,
    importEvents,
    importEventsFromJSON,
    getCategories,
    loadEvents // NEU: Exposed für manuelles Neuladen falls nötig
  }
}