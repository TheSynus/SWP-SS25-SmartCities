// === EVENT SIDEBAR COMPONENT ===
// components/EventSidebar.vue
<script setup lang="ts">
import { Filter, Plus } from 'lucide-vue-next'
import { useAdmin } from '@/composables/admin/useAdmin.ts'

// Admin Check
const { isAdmin } = useAdmin()


// Types
interface Event {
  id: string | number
  title: string
  start_time: string
  end_time: string
  location: string
  category: string
  recurrence: string
  description: string
}

interface Category {
  id: number
  title: string
  color: string
}

interface FilterForm {
  date: string
  category: string
  location: string
  searchText: string
}

// Props
interface Props {
  filteredEvents: Event[]
  categories: Category[]
  filterForm: FilterForm
  selectedDate: string | null
  hasActiveFilters: boolean
  showFilters: boolean
  showPopup: boolean
  getCategoryColor: (category: string) => string
}

const props = withDefaults(defineProps<Props>(), {
  filteredEvents: () => [],
  categories: () => [],
  filterForm: () => ({
    date: '',
    category: '',
    location: '',
    searchText: '',
  }),
  selectedDate: null,
  hasActiveFilters: false,
  showFilters: false,
  showPopup: false,
  getCategoryColor: () => () => 'bg-gray-500'
})

// Emits
const emit = defineEmits<{
  'update:filterForm': [filterForm: FilterForm]
  'update:showFilters': [show: boolean]
  'update:showPopup': [show: boolean]
  'toggle-filters': []
  'toggle-popup': []
  'apply-filters': []
  'reset-filters': []
  'reset-single-filter': [key: keyof FilterForm | 'selectedDate']
  'event-click': [event: Event]
  'open-new-event': []
  'open-categories': []
  'import-click': []
}>()

// Methods
function updateSearchText(value: string) {
  const updatedForm = { ...props.filterForm, searchText: value }
  emit('update:filterForm', updatedForm) 
  console.log(updatedForm) 
  //TODO
  //emit('date-click', dayNumber, events)
   //const events = props.getEventsForDay(dayNumber)
}

function updateFilterForm(updates: Partial<FilterForm>) {
  const updatedForm = { ...props.filterForm, ...updates }
  emit('update:filterForm', updatedForm)
}

function handleToggleFilters() {
  emit('toggle-filters')
  emit('update:showFilters', !props.showFilters)
}

function handleTogglePopup() {
  emit('toggle-popup')
  emit('update:showPopup', !props.showPopup)
}

function handleApplyFilters() {
  emit('apply-filters')
  emit('update:showFilters', false)
}

function handleResetFilters() {
  emit('reset-filters')
}

function handleResetSingleFilter(key: keyof FilterForm | 'selectedDate') {
  emit('reset-single-filter', key)
}

function handleEventClick(event: Event) {
  emit('event-click', event)
}

function handleImportClick() {
  emit('import-click')
  emit('update:showPopup', false)
}

function handleNewEventClick() {
  emit('open-new-event')
  emit('update:showPopup', false)
}

function handleCategoriesClick() {
  emit('open-categories')
  emit('update:showPopup', false)
}

function formatEventDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

function formatDateForDisplay(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('de-DE')
  } catch {
    return dateString
  }
}
</script>

<template>
  <aside class="w-1/3 bg-white/10 p-4 rounded-lg shadow flex flex-col max-h-[calc(100vh-8rem)]">
    <!-- Fixed Search Bar -->
    <div class="flex-shrink-0">
      <div class="flex items-center gap-2 mb-4">
        <!-- Search Input -->
        <input
          :value="props.filterForm?.searchText || ''"
          @input="updateSearchText(($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Suche nach Kategorie/Ort"
          class="form-input flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-lg text-sm"
        />
        
        <!-- Filter Dropdown -->
        <div class="relative filter-dropdown">
          <button
            @click="handleToggleFilters"
            class="p-2 hover:text-blue-400"
            :class="{ 'text-blue-400': hasActiveFilters }"
          >
            <Filter class="w-5 h-5 stroke-[1.5]" />
          </button>
          
          <div
            v-if="showFilters"
            class="absolute top-10 right-0 bg-[#0B1739] border border-white/10 text-white rounded-lg shadow-lg p-4 z-50 w-56 space-y-3"
          >
            <!-- Date Filter -->
            <div>
              <label class="block text-sm text-gray-300 mb-1">Datum</label>
              <input
                :value="props.filterForm?.date || ''"
                @input="updateFilterForm({ date: ($event.target as HTMLInputElement).value })"
                type="date"
                class="w-full p-2 bg-white/10 border border-white/20 rounded text-sm text-white"
              />
            </div>
            
            <!-- Category Filter -->
            <div>
              <label class="block text-sm text-gray-300 mb-1">Kategorie</label>
              <select
                :value="props.filterForm?.category || ''"
                @change="updateFilterForm({ category: ($event.target as HTMLSelectElement).value })"
                class="w-full p-2 bg-white/10 rounded text-sm text-white border-0 outline-0 focus:ring-0"
              >
                <option value="" class="bg-[#0B1739] text-white">Alle</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.title"
                  class="bg-[#0B1739] text-white"
                >
                  {{ category.title }}
                </option>
              </select>
            </div>
            
            <!-- Location Filter -->
            <div>
              <label class="block text-sm text-gray-300 mb-1">Ort</label>
              <input
                :value="props.filterForm?.location || ''"
                @input="updateFilterForm({ location: ($event.target as HTMLInputElement).value })"
                type="text"
                class="w-full p-2 bg-white/10 border border-white/20 rounded text-sm text-white placeholder-gray-400"
                placeholder="Ort eingeben"
              />
            </div>

            <!-- Filter Buttons -->
            <div class="flex gap-2 pt-2">
              <button
                @click="handleApplyFilters"
                class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition"
              >
                Filtern
              </button>
              <button
                @click="handleResetFilters"
                class="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm transition"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        
        <!-- Plus Dropdown -->
        <div
          v-if=isAdmin
          class="relative plus-dropdown">
          <button @click="handleTogglePopup" class="p-2 hover:text-blue-400">
            <Plus class="w-5 h-5 stroke-[1.5]" />
          </button>

          <div
            v-if="showPopup"
            class="absolute top-10 right-0 bg-[#0B1739] border border-white/10 text-white rounded-lg shadow-lg w-48 z-50"
          >
            <button
              class="w-full px-4 py-2 hover:bg-white/10 text-left"
              @click="handleImportClick"
            >
              📥 Importieren
            </button>
            <button
              class="w-full px-4 py-2 hover:bg-white/10 text-left"
              @click="handleNewEventClick"
            >
              ➕ Neuer Termin
            </button>
            <button
              class="w-full px-4 py-2 hover:bg-white/10 text-left"
              @click="handleCategoriesClick"
            >
              🏷️ Kategorien bearbeiten
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Display -->
      <div
        v-if="hasActiveFilters"
        class="mb-4 p-2 bg-blue-600/20 rounded-lg border border-blue-500/30"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="text-sm text-blue-300 flex-1">
            <div v-if="selectedDate" class="mb-1">
              📅 Kalenderdatum: {{ formatDateForDisplay(selectedDate) }}
            </div>
            <div v-if="props.filterForm?.date && !selectedDate" class="mb-1">
              📅 Datum: {{ formatDateForDisplay(props.filterForm.date) }}
            </div>
            <div v-if="props.filterForm?.category" class="mb-1">
              🏷️ Kategorie: {{ props.filterForm.category }}
            </div>
            <div v-if="props.filterForm?.location?.trim()" class="mb-1">
              📍 Ort: {{ props.filterForm.location }}
            </div>
            <div v-if="props.filterForm?.searchText?.trim()" class="mb-1">
              🔍 Suche: {{ props.filterForm.searchText }}
            </div>
          </div>
          <button
            @click="handleResetFilters"
            class="text-xs text-gray-400 hover:text-white whitespace-nowrap"
          >
            ✕ Alle löschen
          </button>
        </div>
      </div>

      <h2 class="text-lg font-semibold mb-4">📌 Termine ({{ props.filteredEvents?.length || 0 }})</h2>
    </div>

    <!-- Scrollable Event List -->
    <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5 hover:scrollbar-thumb-white/30">
      <ul class="space-y-3 text-base" v-if="props.filteredEvents && props.filteredEvents.length > 0">
        <li
          v-for="event in props.filteredEvents"
          :key="event?.id || Math.random()"
          @click="event && handleEventClick(event)"
          class="p-4 bg-white/5 rounded border border-white/10 cursor-pointer hover:bg-blue-700 transition relative"
        >
          <div class="text-lg font-bold">{{ event?.title || 'Unbekannter Titel' }}</div>
          <div class="text-sm text-gray-300 mt-1">
            {{ event?.start_time ? formatEventDate(event.start_time) : 'Kein Datum' }}
          </div>
          <div class="text-sm text-gray-400">
            {{ event?.start_time ? formatEventTime(event.start_time) : '' }} 
            <span v-if="event?.start_time">Uhr</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">📍 {{ event?.location || 'Kein Ort' }}</div>
          <div
            class="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full text-white"
            :class="event?.category ? props.getCategoryColor(event.category) : 'bg-gray-500'"
          >
            {{ event?.category || 'Keine Kategorie' }}
          </div>
        </li>
      </ul>

      <!-- No Events Message -->
      <div v-if="!props.filteredEvents || props.filteredEvents.length === 0" class="text-center text-gray-400 mt-8">
        <p v-if="props.hasActiveFilters">Keine Termine gefunden</p>
        <p v-else>Keine Termine vorhanden</p>
      </div>
    </div>
  </aside>
</template>
