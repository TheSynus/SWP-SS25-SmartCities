// === CALENDAR GRID COMPONENT === // components/CalendarGrid.vue
<script setup lang="ts">
import { computed } from 'vue'

/**
 * CalendarGrid Component 
 * Diese Komponente rendert das Kalenderraster (Tagesansicht des Monats)
 * und stellt die einzelnen Kalendertage inklusive Events dar.
 *
 * Features:
 * - Dynamische Berechnung der Tage im aktuellen Monat
 * - Darstellung von Terminen pro Tag (mit Kategorien und Farben)
 * - Markierungen für „Heute“ und „Ausgewählten Tag“
 * - Maus- und Tastaturinteraktion (Klick, Enter, Space)
 * - Performance-optimierte Darstellung (v-for + computed)
 *
 * Kommunikation:
 * - Props: Daten und Callback-Funktionen aus der Elternkomponente
 * - Emits: date-select (Tag gewählt), date-click (Tag + Events gewählt)
 *
 * @component
 * @file CalendarGrid.vue
 * @description Stellt die visuelle Monatsübersicht des Kalenders dar.
 * @author Kire Bozinovski, Dalshad Ahmad
 */

/**
 * Struktur eines Kalendereintrags (Event).
 */
interface Event {
  id: string | number
  title: string
  date: string
  category: string
  repeat: string
  location: string
  description: string
  endDate: string
}

/**
 * Öffentliche Eigenschaften der Komponente.
 */
interface Props {
  currentDate: Date
  selectedDate: string | null
  getEventsForDay: (dayNumber: number) => Event[]
  getCategoryColor: (category: string) => string
  daysInMonth: (date: Date) => number
  firstDayOffset: (date: Date) => number
  isToday: (dayNumber: number) => boolean
  getDateString: (dayNumber: number) => string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
})

/**
 * Events, die an die Elternkomponente gesendet werden.
 */
const emit = defineEmits<{
  'date-select': [dayNumber: number]
  'date-click': [dayNumber: number, events: Event[]]
}>()

/** Deutsche Kurzform der Wochentage für das Monatsraster */
const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/**
 * Berechnet alle Tage des Monats mit ihren Attributen (Events, Status usw.).
 */
const calendarDays = computed(() => {
  const days = []
  const totalDays = props.daysInMonth(props.currentDate)

  for (let i = 1; i <= totalDays; i++) {
    const events = props.getEventsForDay(i)
    const isCurrentDay = props.isToday(i)
    const isSelected = props.selectedDate === props.getDateString(i)

    days.push({
      dayNumber: i,
      events,
      isToday: isCurrentDay,
      isSelected,
      dateString: props.getDateString(i),
      hasEvents: events.length > 0,
    })
  }

  return days
})

/**
 * Liefert die Platzhalter-Zellen (leere Tage) vor Monatsbeginn.
 * Wird zur korrekten Ausrichtung im Kalender verwendet.
 */
const offsetDays = computed(() => {
  return Array.from({ length: props.firstDayOffset(props.currentDate) }, (_, i) => i)
})

/**
 * Wird aufgerufen, wenn ein Kalendertag angeklickt wird.
 * Löst zwei Events aus:
 * - 'date-select' (zur Auswahl des Tages)
 * - 'date-click' (zusätzlich mit Events)
 *
 * @param dayNumber Der angeklickte Tag
 */
function handleDateClick(dayNumber: number) {
  const events = props.getEventsForDay(dayNumber)
  emit('date-select', dayNumber)
  emit('date-click', dayNumber, events)
  console.log("DATE SELECTED: CalendarGrid")
}

/**
 * Tastatursteuerung für Barrierefreiheit (Enter/Space = Klick simulieren).
 * @param event KeyboardEvent
 * @param dayNumber Tag des Monats
 */
function handleKeydown(event: KeyboardEvent, dayNumber: number) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleDateClick(dayNumber)
  }
}

/**
 * Liefert dynamische CSS-Klassen für die Tageszelle.
 * @param day Das Tagesobjekt (enthält Status-Flags)
 * @returns Array mit Tailwind-Klassen und Statusbedingungen
 */
function getDayClasses(day: any) {
  return [
    'relative p-1 h-20 rounded-lg bg-white/10 hover:bg-blue-600 cursor-pointer transition-all duration-200 flex flex-col group',
    {
      'ring-2 ring-offset-2 ring-[#228B22]': day.isToday,
      'bg-blue-600/40 ring-2 ring-blue-400': day.isSelected,
      'hover:scale-105': !day.isSelected,
      'shadow-lg': day.hasEvents,
    },
  ]
}


/**
 * Gibt an, wie viele Events pro Tag direkt angezeigt werden sollen.
 * @returns Anzahl der sichtbaren Events (Standard: 1)
 */
function getEventDisplayLimit(): number {
  return 1 // Only show first event, then show count
}

/**
 * Prüft, ob ein "+X weitere"-Hinweis angezeigt werden soll.
 * @param events Liste der Events
 */
function shouldShowEventCount(events: Event[]): boolean {
  return events.length > getEventDisplayLimit()
}

/**
 * Berechnet, wie viele Events zusätzlich zum ersten versteckt sind.
 * @param events Liste der Events
 * @returns Anzahl der zusätzlichen Events
 */
function getAdditionalEventCount(events: Event[]): number {
  return Math.max(0, events.length - getEventDisplayLimit())
}
</script>

<template>
  <div class="grid grid-cols-7 gap-4 text-center text-sm" :class="props.class">
    <!-- Weekday Headers -->
    <div v-for="day in weekdays" :key="`weekday-${day}`" class="font-semibold text-blue-300 py-2">
      {{ day }}
    </div>

    <!-- Empty cells for month offset -->
    <div v-for="offset in offsetDays" :key="`offset-${offset}`" class="h-20" />

    <!-- Calendar Days -->
    <div
      v-for="day in calendarDays"
      :key="`day-${day.dayNumber}`"
      @click="handleDateClick(day.dayNumber)"
      @keydown="handleKeydown($event, day.dayNumber)"
      :class="getDayClasses(day)"
      role="button"
      tabindex="0"
      :aria-label="`Tag ${day.dayNumber}, ${day.events.length} Termine`"
      :title="`${day.dayNumber}. ${day.events.length} Termine`"
    >
      <!-- Day Number -->
      <div class="text-center font-semibold mb-1 relative z-10">
        {{ day.dayNumber }}

        <!-- Today Indicator -->
        <div
          v-if="day.isToday"
          class="absolute -top-1 -right-1 w-2 h-2 bg-[#228B22] rounded-full"
          title="Heute"
        />

        <!-- Selected Indicator -->
        <div
          v-if="day.isSelected"
          class="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"
          title="Ausgewählt"
        />
      </div>

      <!-- Events Container -->
      <div class="flex-1 overflow-hidden relative">
        <!-- Show first event -->
        <template
          v-for="(event, index) in day.events.slice(0, getEventDisplayLimit())"
          :key="`${event.id}-label`"
        >
          <div
            class="text-xs px-1 py-0.5 mb-0.5 rounded text-white truncate transition-all duration-200 group-hover:shadow-sm"
            :class="getCategoryColor(event.category)"
            :title="`${event.title} - ${event.location}`"
          >
            {{ event.title }}
          </div>
        </template>

        <!-- Show additional event count -->
        <div
          v-if="shouldShowEventCount(day.events)"
          class="text-xs text-yellow-300 px-1 font-medium bg-yellow-900/30 rounded transition-all duration-200"
          :title="`${getAdditionalEventCount(day.events)} weitere Termine`"
        >
          + {{ getAdditionalEventCount(day.events) }} weitere
        </div>

        <!-- Event Count Indicator for Many Events -->
        <div
          v-if="day.events.length > 3"
          class="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full opacity-80"
          title="Viele Termine"
        />
      </div>

      <!-- Hover Effect -->
      <div
        class="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/30 rounded-lg transition-all duration-200 pointer-events-none"
      />

      <!-- Loading State (if needed) -->
      <div v-if="false" class="absolute inset-0 bg-white/10 rounded-lg animate-pulse" />
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better UX */
.overflow-hidden:hover {
  overflow: visible;
}

/* Animation for selected state */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
