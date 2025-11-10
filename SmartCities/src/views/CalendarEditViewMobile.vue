// === MOBILE CALENDAR VIEW FOR IPHONE MOCKUP (REFACTORED) ===
// CalendarEditViewMobile.vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCalendarStore } from '@/composables/calendar/useCalendarStore'
import { useModalStore } from '@/composables/calendar/useModalStore'
import { useCategories } from '@/composables/map/useCategories.js' // ← NEU
import { useAdmin } from '@/composables/admin/useAdmin'
import EventEditModal from '@/components/calendar/ui/EventEditModal.vue'
import EventCreateModal from '@/components/calendar/ui/EventCreateModal.vue'
import CategoryManagementModal from '@/components/map/modal/CategoryManagement.vue' // ← NEU
import ConfirmationModal from '@/components/calendar/ui/ConfirmationModal.vue'

// Stores initialisieren
const calendarStore = useCalendarStore()
const modalStore = useModalStore()
const { fetchCategories } = useCategories() // ← NEU
const { isAdmin } = useAdmin()

// Mobile State
const showEventList = ref(true)
const currentView = ref<'calendar' | 'list'>('list')
const showFilters = ref(false)
const showMobileMenu = ref(false) // ← NEU: Für 3-Punkt-Menü
const searchQuery = ref('')

// Computed
const hasModalOpen = computed(() =>
  modalStore.showEditPopup ||
  modalStore.showNewEventPopup ||
  modalStore.showCategoriesPopup || // ← NEU
  modalStore.showDeleteEventConfirm
)

// ========================================
// HELPER: Get Category Display (NEU - Fallback Pattern)
// ========================================
function getCategoryDisplay(categoryTitle: string) {
  const category = calendarStore.getCategoryById(categoryTitle)
  return {
    title: category?.title || 'Unbekannt',
    color: category?.color || '#6B7280'
  }
}

// Filtered events based on search and filters
const displayedEvents = computed(() => {
  let events = calendarStore.filteredEvents.value

  // Apply search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    events = events.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    )
  }

  return events
})

// Event Handlers
function handleEventClick(event: any) {
  calendarStore.openEditPopup(event)
  modalStore.openEditPopup()
}

function handleSelectDate(dayNumber: number) {
  calendarStore.selectDate(dayNumber)
  currentView.value = 'list'
}

function handleNewEventSave(eventData: any) {
  calendarStore.saveNewEvent(eventData)
  modalStore.closeNewEventPopup()
}

function handleEventEditSave(eventData: any) {
  calendarStore.saveEvent(eventData)
  modalStore.closeEditPopup()
}

function handleEventDelete() {
  modalStore.openDeleteEventConfirm()
}

function confirmEventDelete() {
  calendarStore.confirmDeleteEvent()
  modalStore.closeDeleteEventConfirm()
  modalStore.closeEditPopup()
}

// ← NEU: Handler für Map-Team Modal
async function handleCategoryUpdated() {
  await calendarStore.getCategories()
  modalStore.closeCategoriesPopup()
  showMobileMenu.value = false
}

// ← NEU: Handler für Retry
async function handleRetryCategories() {
  await calendarStore.getCategories()
}

function toggleView() {
  currentView.value = currentView.value === 'calendar' ? 'list' : 'calendar'
}

function openNewEvent() {
  if (!isAdmin.value) {
    alert('Nur Administratoren können neue Termine erstellen.')
    return
  }
  calendarStore.openNewEventPopup()
  modalStore.openNewEventPopup()
}

// ← NEU: Kategorien-Modal öffnen
function openCategories() {
  if (!isAdmin.value) {
    alert('Nur Administratoren können Kategorien bearbeiten.')
    return
  }
  modalStore.openCategoriesPopup()
  showMobileMenu.value = false
}

// ← NEU: Import-Funktion
function handleImportClick() {
  if (!isAdmin.value) {
    alert('Nur Administratoren können Termine importieren.')
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    try {
      const count = await calendarStore.importEventsFromJSON(file)
      // Alert wird bereits in importEventsFromJSON angezeigt
    } catch (error: any) {
      console.error('Import-Fehler:', error)
      alert(`❌ Fehler beim Importieren: ${error.message}`)
    }
  }

  input.click()
  showMobileMenu.value = false
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

function applySearch() {
  calendarStore.filterForm.value.searchText = searchQuery.value
}

function clearSearch() {
  searchQuery.value = ''
  calendarStore.filterForm.value.searchText = ''
}

function resetAllFilters() {
  searchQuery.value = ''
  calendarStore.resetFilters()
  showFilters.value = false
}

// Formatting helpers
function formatEventDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return dateString
  }
}

function formatEventTime(dateString: string) {
  try {
    return new Date(dateString).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

// Lifecycle
onMounted(async () => {
  await calendarStore.getCategories()
  await calendarStore.loadEvents()
})
</script>

<template>
  <div class="h-screen flex flex-col bg-[#0B1739] text-white overflow-hidden">
    <!-- Compact Header -->
    <header class="bg-gray-900 border-b border-white/10 px-3 py-2 flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-lg font-bold">Kalender</h1>
          <p class="text-xs text-gray-400">
            {{ calendarStore.month.value }} {{ calendarStore.year.value }}
          </p>
        </div>

        <div class="flex gap-2">
          <button
            @click="toggleView"
            class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-xs"
            :title="currentView === 'calendar' ? 'Zur Liste' : 'Zum Kalender'"
          >
            {{ currentView === 'calendar' ? '📋' : '📅' }}
          </button>
          <button
            @click="toggleFilters"
            class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-xs"
            :class="{ 'bg-blue-600': showFilters }"
            title="Filter"
          >
            🔍
          </button>

          <!-- ← NEU: 3-Punkt-Menü für Admin-Funktionen -->
          <div v-if="isAdmin" class="relative">
            <button
              @click="toggleMobileMenu"
              class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-xs"
              :class="{ 'bg-blue-600': showMobileMenu }"
            >
              ⋮
            </button>

            <!-- Mobile Menu Dropdown -->
            <div
              v-if="showMobileMenu"
              class="absolute top-10 right-0 bg-[#0d1f4d] border border-white/20 rounded-lg shadow-xl w-48 z-50"
              @click.stop
            >
              <button
                @click="openNewEvent"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center gap-2 border-b border-white/10"
              >
                <span>➕</span>
                <span>Neuer Termin</span>
              </button>
              <button
                @click="handleImportClick"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center gap-2 border-b border-white/10"
              >
                <span>📥</span>
                <span>Importieren</span>
              </button>
              <button
                @click="openCategories"
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center gap-2"
              >
                <span>🏷️</span>
                <span>Kategorien bearbeiten</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Termine durchsuchen..."
          class="w-full px-3 py-1.5 pl-8 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @input="applySearch"
        />
        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      <!-- Filter Panel -->
      <div v-if="showFilters" class="mt-2 p-2 bg-white/5 rounded-lg space-y-2">
        <!-- Category Filter -->
        <select
          v-model="calendarStore.filterForm.value.category"
          class="w-full px-2 py-1.5 rounded bg-white/10 text-xs text-white border-0 focus:ring-1 focus:ring-blue-500"
        >
          <option value="" class="bg-[#0B1739] text-white">Alle Kategorien</option>
          <option
            v-for="category in calendarStore.categories.value"
            :key="category.id"
            :value="category.title"
            class="bg-[#0B1739] text-white"
          >
            {{ category.title }}
          </option>
        </select>

        <!-- Location Filter -->
        <input
          v-model="calendarStore.filterForm.value.location"
          type="text"
          placeholder="Nach Ort filtern"
          class="w-full px-2 py-1.5 rounded bg-white/10 text-xs text-white placeholder-gray-400 border-0 focus:ring-1 focus:ring-blue-500"
        />

        <!-- Filter Actions -->
        <div class="flex gap-2">
          <button
            @click="calendarStore.applyFilters"
            class="flex-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs text-white font-medium"
          >
            Anwenden
          </button>
          <button
            @click="resetAllFilters"
            class="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-300"
          >
            Zurücksetzen
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden bg-gray-900 flex flex-col">
      <!-- Calendar View -->
      <div v-if="currentView === 'calendar'" class="flex-1 overflow-y-auto p-2">
        <!-- Month Navigation -->
        <div class="flex items-center justify-between mb-2 bg-white/5 rounded-lg p-2">
          <button
            @click="calendarStore.previousMonth"
            class="p-1.5 rounded hover:bg-white/10 transition text-sm"
          >
            ◀
          </button>
          <span class="text-sm font-medium">
            {{ calendarStore.month.value }} {{ calendarStore.year.value }}
          </span>
          <button
            @click="calendarStore.nextMonth"
            class="p-1.5 rounded hover:bg-white/10 transition text-sm"
          >
            ▶
          </button>
        </div>

        <!-- Mini Calendar Grid -->
        <div class="bg-white/5 rounded-lg p-2">
          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-1 mb-1">
            <div
              v-for="day in ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']"
              :key="day"
              class="text-center text-[10px] text-gray-400 font-medium py-1"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1">
            <!-- Empty cells for offset -->
            <div
              v-for="n in calendarStore.firstDayOffset(calendarStore.currentDate.value)"
              :key="`empty-${n}`"
              class="aspect-square"
            />

            <!-- Day cells -->
            <button
              v-for="day in calendarStore.daysInMonth(calendarStore.currentDate.value)"
              :key="day"
              @click="handleSelectDate(day)"
              class="aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition relative"
              :class="{
                'bg-blue-600 text-white font-bold': calendarStore.isToday(day),
                'bg-white/10 hover:bg-white/20': !calendarStore.isToday(day),
                'ring-2 ring-blue-400': calendarStore.selectedDate.value === calendarStore.getDateString(day)
              }"
            >
              <span>{{ day }}</span>
              <!-- Event indicator dots mit Fallback-Farbe -->
              <div
                v-if="calendarStore.getEventsForDay(day).length > 0"
                class="flex gap-0.5 mt-0.5"
              >
                <div
                  v-for="(event, idx) in calendarStore.getEventsForDay(day).slice(0, 3)"
                  :key="idx"
                  class="w-1 h-1 rounded-full"
                  :style="{ backgroundColor: getCategoryDisplay(event.category).color }"
                />
              </div>
            </button>
          </div>
        </div>

        <!-- Selected Date Events -->
        <div v-if="calendarStore.selectedDate.value" class="mt-3">
          <div class="flex items-center justify-between mb-2 px-1">
            <h3 class="text-xs font-semibold text-gray-300">
              {{ formatEventDate(calendarStore.selectedDate.value) }}
            </h3>
            <button
              @click="calendarStore.clearDateFilter"
              class="text-xs text-blue-400 hover:text-blue-300"
            >
              Alle anzeigen
            </button>
          </div>
          <div class="space-y-1.5">
            <div
              v-for="event in displayedEvents"
              :key="event.id"
              @click="handleEventClick(event)"
              class="bg-white/5 rounded-lg p-2 hover:bg-white/10 cursor-pointer transition"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium truncate">{{ event.title }}</p>
                  <p class="text-[10px] text-gray-400">
                    {{ formatEventTime(event.start_time) }} • {{ event.location }}
                  </p>
                </div>
                <!-- ← GEÄNDERT: Inline-Style mit Hex-Farbe -->
                <div
                  class="flex-shrink-0 w-2 h-2 rounded-full"
                  :style="{ backgroundColor: getCategoryDisplay(event.category).color }"
                  :title="getCategoryDisplay(event.category).title"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="flex-1 overflow-y-auto p-2">
        <!-- Filter info -->
        <div class="mb-2 px-1 flex items-center justify-between">
          <div class="text-xs text-gray-400">
            <span v-if="calendarStore.selectedDate.value">
              Termine für {{ formatEventDate(calendarStore.selectedDate.value) }}
            </span>
            <span v-else-if="searchQuery || calendarStore.filterForm.value.category || calendarStore.filterForm.value.location">
              {{ displayedEvents.length }} Termin(e) gefunden
            </span>
            <span v-else>
              Alle Termine ({{ displayedEvents.length }})
            </span>
          </div>
          <button
            v-if="calendarStore.selectedDate.value || searchQuery || calendarStore.hasActiveFilters.value"
            @click="resetAllFilters"
            class="text-xs text-blue-400 hover:text-blue-300"
          >
            Filter zurücksetzen
          </button>
        </div>

        <!-- Event List -->
        <div class="space-y-2">
          <div
            v-for="event in displayedEvents"
            :key="event.id"
            @click="handleEventClick(event)"
            class="bg-white/5 rounded-lg p-3 hover:bg-white/10 cursor-pointer transition"
          >
            <div class="flex items-start gap-3">
              <!-- Date Badge -->
              <div class="flex-shrink-0 text-center bg-white/10 rounded-lg p-1.5 w-12">
                <div class="text-xs font-bold">{{ formatEventDate(event.start_time) }}</div>
                <div class="text-[10px] text-gray-400">{{ formatEventTime(event.start_time) }}</div>
              </div>

              <!-- Event Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold mb-0.5 truncate">{{ event.title }}</h3>
                <p class="text-xs text-gray-400 flex items-center gap-1 mb-1">
                  <span>📍</span>
                  <span class="truncate">{{ event.location }}</span>
                </p>
                <!-- ← NEU: Kategorie-Badge mit Fallback -->
                <div class="flex items-center gap-1.5 mb-1">
                  <div
                    class="w-2 h-2 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: getCategoryDisplay(event.category).color }"
                  />
                  <span class="text-[10px] text-gray-400">
                    {{ getCategoryDisplay(event.category).title }}
                  </span>
                </div>
                <p
                  v-if="event.description"
                  class="text-xs text-gray-500 line-clamp-2"
                >
                  {{ event.description }}
                </p>
              </div>

              <!-- Category Badge (Right) -->
              <div
                class="flex-shrink-0 w-3 h-3 rounded-full"
                :style="{ backgroundColor: getCategoryDisplay(event.category).color }"
                :title="getCategoryDisplay(event.category).title"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="displayedEvents.length === 0"
            class="text-center py-8 text-gray-400"
          >
            <div class="text-3xl mb-2">📅</div>
            <p class="text-sm">
              <span v-if="searchQuery || calendarStore.hasActiveFilters.value">
                Keine Termine gefunden
              </span>
              <span v-else>
                Keine Termine vorhanden
              </span>
            </p>
            <button
              v-if="searchQuery || calendarStore.hasActiveFilters.value"
              @click="resetAllFilters"
              class="mt-2 text-xs text-blue-400 hover:text-blue-300"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
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

    <!-- ← NEU: Map-Team CategoryManagementModal -->
    <CategoryManagementModal
      :is-visible="modalStore.showCategoriesPopup.value"
      :categories="calendarStore.categories.value"
      :selected-category="calendarStore.selectedCategory.value"
      @close="modalStore.closeCategoriesPopup"
      @category-updated="handleCategoryUpdated"
      @retry-categories="handleRetryCategories"
    />

    <ConfirmationModal
      :is-visible="modalStore.showDeleteEventConfirm.value"
      title="Termin löschen"
      :message="`Möchten Sie '${calendarStore.selectedEvent.value?.title}' löschen?`"
      confirm-text="Löschen"
      cancel-text="Abbrechen"
      type="danger"
      @confirm="confirmEventDelete"
      @cancel="modalStore.cancelDeleteEvent"
    />

    <!-- ← NEU: Backdrop für Mobile Menu -->
    <div
      v-if="showMobileMenu"
      class="fixed inset-0 bg-black/20 z-40"
      @click="showMobileMenu = false"
    />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hide scrollbar but keep functionality */
::-webkit-scrollbar {
  display: none;
}
</style>
