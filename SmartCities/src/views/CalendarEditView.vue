<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCalendarStore } from '../composables/calendar/useCalendarStore.ts'
import { useModalStore } from '../composables/calendar/useModalStore.ts'
import { useCategories } from '../composables/map/useCategories.js' // ← NEU

// Komponenten importieren
import EventSidebar from '../components/calendar/EventSidebar.vue'
import CalendarView from '../components/calendar/CalendarView.vue'
import EventEditModal from '../components/calendar/ui/EventEditModal.vue'
import EventCreateModal from '../components/calendar/ui/EventCreateModal.vue'
import CategoryManagementModal from '../components/map/modal/CategoryManagement.vue' // ← GEÄNDERT
import ConfirmationModal from '../components/calendar/ui/ConfirmationModal.vue'

// Stores initialisieren
const calendarStore = useCalendarStore()
const modalStore = useModalStore()
const { fetchCategories } = useCategories() // ← NEU

// Computed für Backdrop-Blur
const hasModalOpen = computed(() =>
  modalStore.showEditPopup ||
  modalStore.showNewEventPopup ||
  modalStore.showCategoriesPopup ||
  modalStore.showDeleteEventConfirm ||
  modalStore.showDeleteCategoryConfirm
)

// Click-Outside Handler für Dropdowns
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.filter-dropdown') && !target.closest('.plus-dropdown')) {
    modalStore.closeAllDropdowns()
  }
}

// Handlers für EventSidebar
export interface CalendarEvent {
  id: string | number
  title: string
  date: string
  category: string
  repeat: string
  location: string
  description: string
  endDate: string
}

function handleFilterFormUpdate(newFilterForm: any) {
  console.log("CalendarEditView:" + newFilterForm.searchText)
  calendarStore.updateFilterForm(newFilterForm)
}

function handleShowFiltersUpdate(show: boolean) {
  modalStore.showFilters.value = show
}

function handleShowPopupUpdate(show: boolean) {
  modalStore.showPopup.value = show
}

function handleEventClick(event: any) {
  calendarStore.openEditPopup(event)
  modalStore.openEditPopup()
}

function handleOpenNewEvent() {
  calendarStore.openNewEventPopup()
  modalStore.openNewEventPopup()
}

function handleOpenCategories() {
  modalStore.openCategoriesPopup()
}

// Wrapper for select-date event from CalendarView
function handleSelectDate(dayNumber: number) {
  console.log("DEBUG: CalendarEditView:" + dayNumber)
  calendarStore.selectDate(dayNumber)
}

// Event Handlers für Modals
function handleNewEventSave(eventData: any) {
  calendarStore.saveNewEvent(eventData)
  modalStore.closeNewEventPopup()
}

function handleEventEditSave(eventData: any) {
  calendarStore.saveEvent(eventData)
  modalStore.closeEditPopup()
}

// ← NEU: Handler für Map-Team Modal
async function handleCategoryUpdated() {
  // Kategorien neu laden nach Änderung
  await calendarStore.getCategories()
  modalStore.closeCategoriesPopup()
}

// ← NEU: Handler für Retry
async function handleRetryCategories() {
  await calendarStore.getCategories()
}

function handleEventDelete() {
  calendarStore.deleteEvent()
  modalStore.openDeleteEventConfirm()
}

function confirmEventDelete() {
  calendarStore.confirmDeleteEvent()
  modalStore.closeDeleteEventConfirm()
  modalStore.closeEditPopup()
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Import Handler
function handleImportClick() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const count = await calendarStore.importEventsFromJSON(file)
      alert(`✅ ${count} Events erfolgreich importiert!`)
    } catch (error) {
      console.error('Import-Fehler:', error)
      alert(`❌ Fehler beim Importieren: ${error.message}`)
    }
  }

  input.click()
}

const fileInputRef = ref<HTMLInputElement | null>(null)

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const text = String(reader.result ?? '')
      const json = JSON.parse(text)

      const list = Array.isArray(json) ? json : [json]
      const normalized: CalendarEvent[] = []

      for (let i = 0; i < list.length; i++) {
        const raw = list[i]
        const dateRaw = raw.date ?? raw.start ?? raw.startDate
        const endRaw = raw.endDate ?? raw.end ?? raw.finish

        const item: CalendarEvent = {
          id: raw.id ?? `${Date.now()}-${i}`,
          title: String(raw.title ?? '').trim(),
          date: normalizeDate(String(dateRaw ?? '')),
          endDate: endRaw ? normalizeDate(String(endRaw)) : '',
          category: String(raw.category ?? 'Sonstiges'),
          repeat: String(raw.repeat ?? 'Keine'),
          location: String(raw.location ?? ''),
          description: String(raw.description ?? ''),
        }

        if (!item.title || !item.date) continue
        normalized.push(item)
      }

      if (!normalized.length) {
        alert('Keine gültigen Events gefunden.')
        return
      }

      calendarStore.importEvents(normalized)
      alert(`${normalized.length} Termin(e) importiert.`)
    } catch (err) {
      console.error(err)
      alert('Ungültige JSON-Datei.')
    } finally {
      if (fileInputRef.value) fileInputRef.value.value = ''
    }
  }
  reader.readAsText(file, 'utf-8')
}

function normalizeDate(s: string) {
  if (!s) return ''
  return s.length === 16 ? `${s}:00` : s
}
</script>

<template>
  <div
    :class="[
      'min-h-screen flex flex-col bg-[#0B1739] text-white transition duration-300',
      hasModalOpen ? 'backdrop-blur-sm' : ''
    ]"
  >
    <!-- Header -->
    <header class="p-4 text-center border-b border-white/10">
      <h1 class="text-2xl font-bold">Gestalte deinen Kalender</h1>
    </header>

    <!-- Main Content -->
    <main class="flex flex-1 p-4 gap-6">
      <!-- Event Sidebar -->
      <EventSidebar
        :filtered-events="calendarStore.filteredEvents.value"
        :categories="calendarStore.categories.value"
        :filter-form="calendarStore.filterForm.value"
        :selected-date="calendarStore.selectedDate.value"
        :has-active-filters="Boolean(calendarStore.hasActiveFilters.value)"
        :show-filters="modalStore.showFilters.value"
        :show-popup="modalStore.showPopup.value"
        :get-category-color="calendarStore.getCategoryColor"
        @update:filterForm="handleFilterFormUpdate"
        @update:show-filters="handleShowFiltersUpdate"
        @update:show-popup="handleShowPopupUpdate"
        @toggle-filters="modalStore.toggleFilters"
        @toggle-popup="modalStore.togglePopup"
        @apply-filters="calendarStore.applyFilters"
        @reset-filters="calendarStore.resetFilters"
        @reset-single-filter="calendarStore.resetSingleFilter"
        @event-click="handleEventClick"
        @open-new-event="handleOpenNewEvent"
        @open-categories="handleOpenCategories"
        @import-click="handleImportClick"
      />

      <!-- Calendar View -->
      <CalendarView
        :current-date="calendarStore.currentDate.value"
        :selected-date="calendarStore.selectedDate.value"
        :categories="calendarStore.categories.value"
        @select-date="handleSelectDate"
        :month="calendarStore.month.value"
        :year="calendarStore.year.value"
        :days-in-month="calendarStore.daysInMonth"
        :first-day-offset="calendarStore.firstDayOffset"
        :is-today="calendarStore.isToday"
        :get-date-string="calendarStore.getDateString"
        :get-events-for-day="calendarStore.getEventsForDay"
        :get-category-color="calendarStore.getCategoryColor"
        @previous-month="calendarStore.previousMonth"
        @next-month="calendarStore.nextMonth"
      />
    </main>

    <!-- Modals -->
    <EventEditModal
      :is-visible="modalStore.showEditPopup.value"
      :event="calendarStore.selectedEvent.value"
      :categories="calendarStore.categories.value"
      @close="modalStore.closeEditPopup"
      @save="handleEventEditSave"
      @delete="handleEventDelete"
    />

    <EventCreateModal
      :is-visible="modalStore.showNewEventPopup.value"
      :categories="calendarStore.categories.value"
      @close="modalStore.closeNewEventPopup"
      @save="handleNewEventSave"
    />

    <!-- ← GEÄNDERT: Neues Map-Team Modal -->
    <CategoryManagementModal
      :is-visible="modalStore.showCategoriesPopup.value"
      :categories="calendarStore.categories.value"
      :selected-category="calendarStore.selectedCategory.value"
      @close="modalStore.closeCategoriesPopup"
      @category-updated="handleCategoryUpdated"
      @retry-categories="handleRetryCategories"
    />

    <!-- Confirmation Modals -->
    <ConfirmationModal
      :is-visible="modalStore.showDeleteEventConfirm.value"
      title="Termin löschen"
      :message="`Möchten Sie den Termin '${calendarStore.selectedEvent.value?.title}' wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`"
      confirm-text="Ja, löschen"
      cancel-text="Abbrechen"
      type="danger"
      @confirm="confirmEventDelete"
      @cancel="modalStore.cancelDeleteEvent"
    />

    <input
      ref="fileInputRef"
      type="file"
      accept="application/json,.json"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>
