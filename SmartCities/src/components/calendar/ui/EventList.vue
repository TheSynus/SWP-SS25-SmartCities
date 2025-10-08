/ === EVENT LIST COMPONENT ===
// components/EventList.vue
<script setup lang="ts">
import { computed } from 'vue'


/**
 * EventList Component  
 *
 * Zeigt eine scrollbare Liste von Terminen (Events) an.
 *
 * Features:
 * - Tastatur- und Mausinteraktion (Enter/Space & Click)
 * - Visuelle Kennzeichnung vergangener Termine (abgeblendet)
 * - Kategoriebadge mit Farblogik (per getCategoryColor)
 * - Emittiert Klick- und Auswahl-Events an den Parent
 * - Leerer Zustand mit kontextabhängiger Nachricht (Filter aktiv / keine Daten)
 *
 * Kommunikation:
 * - Props liefern Events, Filterstatus und eine Farb-Funktion.
 * - Emits geben Event-Klicks/Selektion nach außen.
 *
 * Styling:
 * - TailwindCSS-Klassen für Layout, Hover-States und Badges.
 *
 * @component
 * @file EventList.vue
 * @description Liste von Terminen mit Interaktionen und Statusdarstellung.
 * @author Kire Bozinovski, Dalshad Ahmad
 */

/**
 * Repräsentiert einen Termin/Eintrag in der Liste.
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
 * Beispiel-Kategorie-Struktur (optional, hier nicht direkt genutzt).
 */
interface Category {
  id: number
  name: string
  color: string
}

/**
 * Öffentliche Eigenschaften (Props) der Komponente.
 */
interface Props {
  events: Event[]
  hasActiveFilters: boolean
  getCategoryColor: (category: string) => string
  class?: string
}

/**
 * Props-Definition inkl. Standardwerte.
 */
const props = withDefaults(defineProps<Props>(), {
  class: ''
})

/**
 * Events, die bei Interaktionen ausgelöst werden.
 */
const emit = defineEmits<{
  'event-click': [event: Event]
  'event-select': [event: Event]
}>()

/**
 * Anzahl der Events (für spätere Anzeigen/Optimierungen nutzbar).
 */
const eventCount = computed(() => props.events.length)

/**
 * Handhabt die Auswahl eines Events.
 *
 * @param event Das angeklickte/selektierte Event.
 * @emits event-click
 * @emits event-select
 */
function handleEventClick(event: Event) {
  emit('event-click', event)
  emit('event-select', event)
}

/**
 * Formatiert ein Datum als Langform (de-DE), z. B. "Montag, 8. Oktober 2025".
 *
 * @param dateString ISO-Datum/Zeit.
 * @returns Formatierter Datumsstring oder Originalwert bei Fehler.
 */
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


/**
 * Formatiert die Uhrzeit (de-DE), z. B. "09:30".
 *
 * @param dateString ISO-Datum/Zeit.
 * @returns Formatierte Uhrzeit oder leerer String bei Fehler.
 */
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

/**
 * Prüft, ob ein Event-Zeitpunkt in der Vergangenheit liegt.
 *
 * @param dateString ISO-Datum/Zeit des Events.
 * @returns true, wenn das Event bereits vergangen ist; sonst false.
 */
function isEventInPast(dateString: string): boolean {
  try {
    const eventDate = new Date(dateString)
    const now = new Date()
    return eventDate < now
  } catch {
    return false
  }
}

/**
 * Liefert ein Icon zur Visualisierung der Wiederholungsregel.
 *
 * @param repeat Wiederholungswert (z. B. "Täglich", "Wöchentlich", …, "Keine").
 * @returns Ein Emoji-Symbol oder leerer String.
 */
function getEventRepeatIcon(repeat: string): string {
  switch (repeat) {
    case 'Täglich':
      return '🔄'
    case 'Wöchentlich':
      return '📅'
    case 'Monatlich':
      return '🗓️'
    case 'Jährlich':
      return '📆'
    default:
      return ''
  }
}
</script>

<template>
  <div class="flex-1 overflow-y-auto" :class="props.class">
    <!-- Event List -->
    <ul class="space-y-3 text-base">
      <li
        v-for="event in events"
        :key="event.id"
        @click="handleEventClick(event)"
        class="p-4 bg-white/5 rounded border border-white/10 cursor-pointer hover:bg-blue-700 transition-all duration-200 relative group"
        :class="{
          'opacity-60': isEventInPast(event.date),
          'hover:scale-[1.02]': !isEventInPast(event.date)
        }"
        role="button"
        tabindex="0"
        :aria-label="`Termin ${event.title} am ${formatEventDate(event.date)}`"
        @keydown.enter="handleEventClick(event)"
        @keydown.space.prevent="handleEventClick(event)"
      >
        <!-- Event Title -->
        <div class="text-lg font-bold mb-1 pr-16">
          {{ event.title }}
          <span 
            v-if="event.repeat && event.repeat !== 'Keine'" 
            class="ml-2 text-sm"
            :title="`Wiederholung: ${event.repeat}`"
          >
            {{ getEventRepeatIcon(event.repeat) }}
          </span>
        </div>

        <!-- Event Date -->
        <div class="text-sm text-gray-300 mt-1">
          {{ formatEventDate(event.date) }}
        </div>

        <!-- Event Time -->
        <div class="text-sm text-gray-400">
          {{ formatEventTime(event.date) }} Uhr
        </div>

        <!-- Event Location -->
        <div class="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <span>📍</span>
          <span class="truncate">{{ event.location }}</span>
        </div>

        <!-- Event Description (if available) -->
        <div 
          v-if="event.description" 
          class="text-xs text-gray-500 mt-2 line-clamp-2 italic"
          :title="event.description"
        >
          {{ event.description }}
        </div>

        <!-- Category Badge -->
        <div
          class="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full text-white font-medium shadow-sm"
          :class="getCategoryColor(event.category)"
        >
          {{ event.category }}
        </div>

        <!-- Hover Effect Indicator -->
        <div class="absolute inset-0 border-2 border-transparent group-hover:border-blue-400/30 rounded transition-all duration-200"></div>
      </li>
    </ul>

    <!-- Empty State -->
    <div v-if="events.length === 0" class="text-center text-gray-400 mt-8 p-8">
      <div class="text-4xl mb-4">📅</div>
      <p v-if="hasActiveFilters" class="text-lg font-medium mb-2">
        Keine Termine gefunden
      </p>
      <p v-else class="text-lg font-medium mb-2">
        Keine Termine vorhanden
      </p>
      <p class="text-sm text-gray-500">
        <span v-if="hasActiveFilters">
          Versuchen Sie, die Filter zu ändern oder zurückzusetzen.
        </span>
        <span v-else>
          Erstellen Sie Ihren ersten Termin über das Plus-Menü.
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>