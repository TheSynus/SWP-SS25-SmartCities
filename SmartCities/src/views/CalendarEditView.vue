// === VOLLSTÄNDIGE APP.VUE BEISPIEL ===
// App.vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
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

// Click-Outside Handler für Dropdowns
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.filter-dropdown') && !target.closest('.plus-dropdown')) {
    modalStore.closeAllDropdowns()
  }
}

// Event Handlers für EventSidebar
function handleFilterFormUpdate(newFilterForm: any) {
  calendarStore.filterForm = newFilterForm
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

function handleImportClick() {
  console.log('Import clicked')
}

// Wrapper for select-date event from CalendarView
function handleSelectDate(dayNumber: number) {
  calendarStore.selectDate(dayNumber)
}

// Event Handlers für Modals
function handleNewEventSave(eventData: any) {
  calendarStore.saveNewEvent()
  modalStore.closeNewEventPopup()
}

function handleEventEditSave(eventData: any) {
  calendarStore.saveEvent()
  modalStore.closeEditPopup()
}

function handleCategorySave(categoryData: any, isNew: boolean) {
  calendarStore.saveCategoryChanges()
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
        @update:filter-form="handleFilterFormUpdate"
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

    <CategoryManagementModal
      :is-visible="modalStore.showCategoriesPopup.value"
      :categories="calendarStore.categories.value"
      :selected-category="calendarStore.selectedCategory.value"
      @close="modalStore.closeCategoriesPopup"
      @save="handleCategorySave"
      @delete="handleCategoryDelete"
      @select-category="calendarStore.selectCategoryForEdit"
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
  </div>
</template>
