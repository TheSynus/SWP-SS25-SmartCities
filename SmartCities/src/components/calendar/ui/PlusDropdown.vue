// === PLUS DROPDOWN COMPONENT ===
// components/PlusDropdown.vue
<script setup lang="ts">
import { computed } from 'vue'

/**
 * PlusDropdown Component                
 * Dieses Dropdown-Menü dient als erweiterbares Aktionsmenü
 * (z. B. über den Plus-Button in der EventSidebar).
 * 
 * Funktionen:
 * - Zeigt konfigurierbare Menüeinträge (z. B. Import, Neuer Termin, Kategorien)
 * - Unterstützt Tastatursteuerung (Enter, Leertaste)
 * - Schließt sich automatisch nach Auswahl oder Klick außerhalb
 * - Dynamische Positionierung (left, right, center)
 * - Visuelle Trennung aktivierter und deaktivierter Aktionen
 *
 * Kommunikation:
 * - Props übergeben Sichtbarkeit, Position und Einträge
 * - Emits geben Aktionen und Schließen an die Elternkomponente zurück
 *
 * Styling:
 * - Nutzt TailwindCSS für Animationen, Übergänge und Layout
 * - Teleport-Komponente sorgt für z-index-korrektes Overlay im <body>
 *
 * @component
 * @file PlusDropdown.vue
 * @description Reusable Dropdown-Komponente zur Anzeige von Aktionsoptionen.
 * @author Dalshad Ahmad, Kire Bozinovski
 */

/**
 * Repräsentiert einen Eintrag (Button) innerhalb des Dropdown-Menüs.
 */
interface DropdownItem {
  id: string
  label: string
  icon: string
  action: string
  disabled?: boolean
  description?: string
  shortcut?: string
}

/**
 * Öffentliche Eigenschaften (Props) der Komponente.
 */
interface Props {
  isVisible: boolean
  position?: 'left' | 'right' | 'center'
  items?: DropdownItem[]
  class?: string
}


/**
 * Props-Definition inkl. Standardwerte.
 */
const props = withDefaults(defineProps<Props>(), {
  position: 'right',
  class: '',
  items: () => [
    {
      id: 'import',
      label: 'Importieren',
      icon: '📥',
      action: 'import',
      description: 'Termine aus Datei importieren',
      shortcut: 'Ctrl+I'
    },
    {
      id: 'new-event',
      label: 'Neuer Termin',
      icon: '➕',
      action: 'new-event',
      description: 'Einen neuen Termin erstellen',
      shortcut: 'Ctrl+N'
    },
    {
      id: 'categories',
      label: 'Kategorien bearbeiten',
      icon: '🏷️',
      action: 'categories',
      description: 'Kategorien verwalten und bearbeiten',
      shortcut: 'Ctrl+K'
    }
  
  ]
})

/**
 * Events (Emits), die an die Elternkomponente gesendet werden.
 */
const emit = defineEmits<{
  'item-click': [action: string, item: DropdownItem]
  'close': []
}>()

/**
 * Liefert TailwindCSS-Klassen zur Positionierung des Dropdowns.
 *
 * @returns Klassenstring für left, center oder right.
 */
const positionClasses = computed(() => {
  switch (props.position) {
    case 'left':
      return 'left-0'
    case 'center':
      return 'left-1/2 transform -translate-x-1/2'
    case 'right':
    default:
      return 'right-0'
  }
})

/**
 * Gibt alle aktivierten (nicht deaktivierten) Menüeinträge zurück.
 */
const enabledItems = computed(() => 
  props.items.filter(item => !item.disabled)
)


/**
 * Gibt alle deaktivierten Menüeinträge zurück.
 */
const disabledItems = computed(() => 
  props.items.filter(item => item.disabled)
)

/**
 * Führt beim Klick auf einen Menüeintrag die zugehörige Aktion aus
 * (sofern der Eintrag nicht deaktiviert ist) und schließt anschließend das Dropdown.
 *
 * @param item Der angeklickte Dropdown-Eintrag.
 * @emits item-click – mit Aktion und Item-Objekt
 * @emits close – Dropdown wird geschlossen
 */
function handleItemClick(item: DropdownItem) {
  if (item.disabled) return
  
  emit('item-click', item.action, item)
  emit('close')
}

/**
 * Tastatursteuerung für Einträge:
 * - Enter oder Leertaste aktivieren den Eintrag
 *
 * @param event KeyboardEvent des Buttons
 * @param item Das betroffene Dropdown-Item
 */
function handleKeydown(event: KeyboardEvent, item: DropdownItem) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleItemClick(item)
  }
}

/**
 * Schließt das Dropdown-Menü.
 *
 * @emits close – Dropdown wird geschlossen
 */
function closeDropdown() {
  emit('close')
}

/**
 * Prüft Klicks außerhalb des Dropdowns und schließt es gegebenenfalls.
 *
 * @param event Klick-Ereignis (z. B. auf Overlay oder außerhalb der Komponente)
 */
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.plus-dropdown-container')) {
    closeDropdown()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="fixed inset-0 z-40"
      @click="handleClickOutside"
    />
  </Teleport>

  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-75 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="isVisible"
      class="plus-dropdown-container absolute top-10 bg-[#0B1739] border border-white/10 text-white rounded-lg shadow-lg w-64 z-50 overflow-hidden"
      :class="[positionClasses, props.class]"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-white/10 bg-white/5">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-white">Aktionen</h3>
          <button
            @click="closeDropdown"
            class="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Menü schließen"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Enabled Items -->
      <div class="py-2">
        <button
          v-for="item in enabledItems"
          :key="item.id"
          @click="handleItemClick(item)"
          @keydown="handleKeydown($event, item)"
          class="w-full px-4 py-3 hover:bg-white/10 text-left transition-colors duration-150 focus:bg-white/10 focus:outline-none group"
          :aria-label="item.description || item.label"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <span class="text-lg mt-0.5 group-hover:scale-110 transition-transform duration-150">
              {{ item.icon }}
            </span>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-medium text-white group-hover:text-blue-300 transition-colors">
                  {{ item.label }}
                </span>
                <span v-if="item.shortcut" class="text-xs text-gray-400 font-mono">
                  {{ item.shortcut }}
                </span>
              </div>
              <p v-if="item.description" class="text-xs text-gray-400 mt-1 leading-tight">
                {{ item.description }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <!-- Disabled Items (if any) -->
      <div v-if="disabledItems.length > 0" class="border-t border-white/10">
        <div class="px-4 py-2">
          <p class="text-xs text-gray-500 font-medium">Bald verfügbar</p>
        </div>
        <div class="pb-2">
          <div
            v-for="item in disabledItems"
            :key="item.id"
            class="w-full px-4 py-3 text-left opacity-50 cursor-not-allowed"
          >
            <div class="flex items-start gap-3">
              <span class="text-lg mt-0.5 grayscale">{{ item.icon }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-gray-400">{{ item.label }}</span>
                  <span class="text-xs text-gray-500">Gesperrt</span>
                </div>
                <p v-if="item.description" class="text-xs text-gray-500 mt-1 leading-tight">
                  {{ item.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with additional info -->
      <div class="px-4 py-2 border-t border-white/10 bg-white/5">
        <p class="text-xs text-gray-400 text-center">
          Tipp: Nutzen Sie Tastenkürzel für schnelleren Zugriff
        </p>
      </div>
    </div>
  </Transition>
</template>