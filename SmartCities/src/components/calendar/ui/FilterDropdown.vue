/ === FILTER DISPLAY COMPONENT ===
// components/FilterDisplay.vue
<script setup lang="ts">
import { computed } from 'vue'


/**
 * FilterDisplay Component                  
 * Zeigt alle aktuell aktiven Filter in einer Liste mit Icons und Farben an.
 *
 * Funktionen:
 * - Listet gesetzte Filter wie Datum, Kategorie, Ort oder Suchtext auf.
 * - Hebt das aktive Kalenderdatum priorisiert hervor.
 * - Bietet Schaltflächen zum Entfernen einzelner Filter oder zum Zurücksetzen aller Filter.
 * - Dynamische Anzeige der Filteranzahl und Typ-basiertes Styling.
 *
 * Kommunikation:
 * - Props übergeben den aktuellen Filterzustand (filterData) und das gewählte Kalenderdatum.
 * - Emits informieren die Elternkomponente über „Reset“-Aktionen.
 *
 * Styling:
 * - Verwendet TailwindCSS für ein modulares, responsives Layout.
 *
 * @component
 * @file FilterDisplay.vue
 * @description Anzeige und Verwaltung der aktiven Filter in der Smart-Cities-App.
 * @author Dalshad Ahmad, Kire Bpzinovski
 */

/**
 * Struktur der Filterdaten, die aktiv sein können.
 */
interface FilterData {
  date: string
  category: string
  location: string
  searchText: string
}

/**
 * Öffentliche Eigenschaften (Props) der Komponente.
 */
interface Props {
  filterData: FilterData
  selectedDate: string | null
  class?: string
}

/**
 * Props-Definition mit Standardwerten.
 */
const props = withDefaults(defineProps<Props>(), {
  class: ''
})

/**
 * Events (Emits), die an die Elternkomponente gesendet werden.
 */
const emit = defineEmits<{
  'reset-all': []
  'reset-filter': [key: keyof FilterData | 'selectedDate']
}>()

/**
 * Berechnet eine Liste aller aktuell aktiven Filter.
 * Jeder Eintrag enthält Label, Wert, Icon und Typ zur Farbgebung.
 */
const activeFilters = computed(() => {
  const filters: Array<{
    key: keyof FilterData | 'selectedDate'
    label: string
    value: string
    icon: string
    type: 'date' | 'text' | 'calendar'
  }> = []

  // Prio
  if (props.selectedDate) {
    filters.push({
      key: 'selectedDate',
      label: 'Kalenderdatum',
      value: formatDate(props.selectedDate),
      icon: '📅',
      type: 'calendar'
    })
  }

  if (props.filterData.date && !props.selectedDate) {
    filters.push({
      key: 'date',
      label: 'Datum',
      value: formatDate(props.filterData.date),
      icon: '📅',
      type: 'date'
    })
  }

  // Category Filter
  if (props.filterData.category) {
    filters.push({
      key: 'category',
      label: 'Kategorie',
      value: props.filterData.category,
      icon: '🏷️',
      type: 'text'
    })
  }

  // Location Filter
  if (props.filterData.location.trim()) {
    filters.push({
      key: 'location',
      label: 'Ort',
      value: props.filterData.location,
      icon: '📍',
      type: 'text'
    })
  }

  // Search Text Filter
  if (props.filterData.searchText.trim()) {
    filters.push({
      key: 'searchText',
      label: 'Suche',
      value: props.filterData.searchText,
      icon: '🔍',
      type: 'text'
    })
  }

  return filters
})

/**
 * Gibt die Anzahl der aktuell aktiven Filter zurück.
 */
const filterCount = computed(() => activeFilters.value.length)

/**
 * Formatiert ein ISO-Datum für die Anzeige (deutsches Format).
 *
 * @param dateString ISO-Datum als String.
 * @returns Formatiertes Datum wie „Mi, 08.10.2025“ oder Originalwert bei Fehler.
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Löst das Event zum Zurücksetzen aller Filter aus.
 *
 * @emits reset-all
 */
function handleResetAll() {
  emit('reset-all')
}

/**
 * Entfernt einen einzelnen Filter anhand seines Schlüssels.
 *
 * @param key Schlüssel des zu löschenden Filters.
 * @emits reset-filter – mit Schlüsselwert
 */
function handleResetFilter(key: keyof FilterData | 'selectedDate') {
  emit('reset-filter', key)
}

/**
 * Liefert CSS-Klassen für Farbgebung und Rahmen anhand des Filtertyps.
 *
 * @param type Art des Filters (calendar, date, text)
 * @returns TailwindCSS-Klassenstring zur Darstellung.
 */
function getFilterTypeClass(type: string): string {
  switch (type) {
    case 'calendar':
      return 'bg-green-600/20 border-green-500/30 text-green-300'
    case 'date':
      return 'bg-blue-600/20 border-blue-500/30 text-blue-300'
    default:
      return 'bg-blue-600/20 border-blue-500/30 text-blue-300'
  }
}
</script>

<template>
  <div 
    v-if="filterCount > 0"
    class="mb-4 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30"
    :class="props.class"
  >
    <!-- Header -->
    <div class="flex items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-blue-300">
          Aktive Filter
        </span>
        <span class="text-xs bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full">
          {{ filterCount }}
        </span>
      </div>
      <button
        @click="handleResetAll"
        class="text-xs text-gray-400 hover:text-white transition-colors duration-200 px-2 py-1 rounded hover:bg-white/10"
        title="Alle Filter löschen"
        aria-label="Alle Filter löschen"
      >
        ✕ Alle löschen
      </button>
    </div>

    <!-- Filter Tags -->
    <div class="space-y-2">
      <div
        v-for="filter in activeFilters"
        :key="filter.key"
        class="flex items-center justify-between gap-2 p-2 rounded border transition-all duration-200"
        :class="getFilterTypeClass(filter.type)"
      >
        <!-- Filter Info -->
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-sm">{{ filter.icon }}</span>
          <div class="min-w-0 flex-1">
            <div class="text-xs font-medium opacity-80">
              {{ filter.label }}
            </div>
            <div class="text-sm font-medium truncate" :title="filter.value">
              {{ filter.value }}
            </div>
          </div>
        </div>

        <!-- Remove Button -->
        <button
          @click="handleResetFilter(filter.key)"
          class="text-xs opacity-60 hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-white/10"
          :title="`${filter.label}-Filter entfernen`"
          :aria-label="`${filter.label}-Filter entfernen`"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-3 pt-2 border-t border-blue-500/20">
      <div class="text-xs text-blue-300/80">
        <span v-if="filterCount === 1">
          Ein Filter aktiv
        </span>
        <span v-else>
          {{ filterCount }} Filter aktiv
        </span>
        · Klicken Sie auf ✕ zum Entfernen einzelner Filter
      </div>
    </div>
  </div>
</template>
