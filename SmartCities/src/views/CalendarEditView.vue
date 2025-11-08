<!-- App.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCalendarStore } from '../composables/calendar/useCalendarStore.ts'
import { useModalStore } from '../composables/calendar/useModalStore.ts'

// Komponenten importieren
import EventSidebar from '../components/calendar/EventSidebar.vue'
import CalendarView from '../components/calendar/CalendarView.vue'
import EventEditModal from '../components/calendar/ui/EventEditModal.vue'
import EventCreateModal from '../components/calendar/ui/EventCreateModal.vue'
import CategoryManagementModal from '../components/calendar/ui/CategoryManagementModal.vue'
import ConfirmationModal from '../components/calendar/ui/ConfirmationModal.vue'

// Stores initialisieren
const calendarStore = useCalendarStore()
const modalStore = useModalStore()

// Computed für Backdrop-Blur
const hasModalOpen = computed(() =>
  modalStore.showEditPopup ||
  modalStore.showNewEventPopup ||
  modalStore.showCategoriesPopup ||
  modalStore.showDeleteEventConfirm ||
  modalStore.showDeleteCategoryConfirm
)

// Click-Outside Handler
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.filter-dropdown') && !target.closest('.plus-dropdown')) {
    modalStore.closeAllDropdowns()
  }
}

// Typ für Events
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

// EventSidebar-Handler
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
  calendarStore.openCategoriesPopup()
  modalStore.openCategoriesPopup()
}

// Kalender-Handler
function handleSelectDate(dayNumber: number) {
  console.log("DEBUG: CalendarEditView:" + dayNumber)
  calendarStore.selectDate(dayNumber)
}

// Modal-Handler
function handleNewEventSave(eventData: any) {
  calendarStore.saveNewEvent(eventData)
  modalStore.closeNewEventPopup()
}

function handleEventEditSave(eventData: any) {
  calendarStore.saveEvent(eventData)
  modalStore.closeEditPopup()
}

function handleCategorySave(categoryData: any, isNew: boolean) {
  console.log("Kategorie anlegen:" + categoryData.name + "\nisNew:" + isNew)
  calendarStore.saveCategoryChanges(categoryData, isNew)
  modalStore.closeCategoriesPopup()
}

function handleEventDelete() {
  calendarStore.deleteEvent()
  modalStore.openDeleteEventConfirm()
}

function handleCategoryDelete() {
  calendarStore.deleteCategory()
  modalStore.openDeleteCategoryConfirm()
}

function confirmEventDelete() {
  calendarStore.confirmDeleteEvent()
  modalStore.closeDeleteEventConfirm()
  modalStore.closeEditPopup()
}

function confirmCategoryDelete() {
  calendarStore.confirmDeleteCategory()
  modalStore.closeDeleteCategoryConfirm()
  modalStore.closeCategoriesPopup()
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Import-Logik
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleImportClick() {
  fileInputRef.value?.click()
}

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
    <main class="flex-1 p-4">
      <!-- Mobile: Kalender oben, Sidebar unten -->
      <!-- Desktop: Sidebar links, Kalender rechts -->
      <div class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(320px,380px)_1fr]">
        
        <!-- Kalender OBEN (mobile), RECHTS (desktop) -->
        <CalendarView
          class="order-1 lg:order-2 w-full"
          :current-date="calendarStore.currentDate.value"
          :selected-date="calendarStore.selectedDate.value"
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

        <!-- Sidebar UNTEN (mobile), LINKS (desktop) -->
        <EventSidebar
          class="order-2 lg:order-1 w-full lg:sticky lg:top-4 lg:self-start"
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
      </div>
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

    <CategoryManagementModal
      :is-visible="modalStore.showCategoriesPopup.value"
      :categories="calendarStore.categories.value"
      :selected-category="calendarStore.selectedCategory.value"
      @close="modalStore.closeCategoriesPopup"
      @save="handleCategorySave"
      @delete="handleCategoryDelete"
      @select-category="calendarStore.selectCategoryForEdit"
    />

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

    <ConfirmationModal
      :is-visible="modalStore.showDeleteCategoryConfirm.value"
      title="Kategorie löschen"
      :message="`Möchten Sie die Kategorie '${calendarStore.selectedCategory.value?.name}' wirklich löschen? Alle Termine dieser Kategorie werden zu 'Sonstiges' verschoben.`"
      confirm-text="Ja, löschen"
      cancel-text="Abbrechen"
      type="danger"
      @confirm="confirmCategoryDelete"
      @cancel="modalStore.cancelDeleteCategory"
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
