// === SEARCH BAR COMPONENT ===
// components/SearchBar.vue
<script setup lang="ts">
import { computed } from 'vue'

/**
 *
 * Eine wiederverwendbare Suchleiste mit:
 * - v-model-Unterstützung (modelValue)
 * - Tastaturkürzeln: Enter (suchen), Escape (löschen)
 * - Events für search, clear, focus, blur
 * - Deaktivierbar & mit optionalen Zusatzklassen
 *
 * @component
 * @file SearchBar.vue
 * @description Reusable Suchfeld-Komponente inkl. Clear-Button und Events.
 * @author Dalshad Ahmad, Kire Bozinovsk
 */

/**
 * Öffentliche Eigenschaften (Props) der Komponente.
 */
interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  class?: string
}


/**
 * Props-Definition inkl. Standardwerte.
 */
const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Schwant',
  disabled: false,
  class: ''
})

/**
 * Events (Emits), die die Komponente nach außen sendet.
 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [value: string]
  'clear': []
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

/**
 * Computed v-model Proxy für modelValue.
 * - get: liest den aktuellen Wert aus den Props
 * - set: emittiert update:modelValue
 */
const searchValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})


/**
 * Prüft, ob das Eingabefeld einen (getrimmten) Inhalt hat.
 */
const hasValue = computed(() => props.modelValue.trim().length > 0)

/**
 * Löscht den Suchtext und informiert den Parent über den Reset.
 *
 * @emits update:modelValue – setzt den Wert auf leeren String
 * @emits clear – signalisiert das Leeren der Suche
 */
function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}

/**
 * Löst eine Suche mit dem aktuellen Suchtext aus.
 *
 * @emits search – mit aktuellem modelValue
 */
function handleSearch() {
  emit('search', props.modelValue)
}

/**
 * Tastatur-Handler:
 * - Enter: Suche auslösen
 * - Escape: Eingabe löschen
 *
 * @param event Tastaturereignis vom Input
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleSearch()
  }
  if (event.key === 'Escape') {
    handleClear()
  }
}

/**
 * Leitet das Focus-Event an den Parent weiter.
 *
 * @param event FocusEvent des Eingabefelds
 * @emits focus
 */
function handleFocus(event: FocusEvent) {
  emit('focus', event)
}


/**
 * Leitet das Blur-Event an den Parent weiter.
 *
 * @param event FocusEvent des Eingabefelds
 * @emits blur
 */
function handleBlur(event: FocusEvent) {
  emit('blur', event)
}
</script>

<template>
  <div class="relative flex items-center" :class="props.class">
    <!-- Search Icon -->
    <div class="absolute left-3 text-gray-400 pointer-events-none">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Input Field -->
    <input
      v-model="searchValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      class="form-input flex-1 pl-10 pr-10 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      :class="{
        'opacity-50 cursor-not-allowed': disabled,
        'bg-white/5': disabled
      }"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Clear Button -->
    <button
      v-if="hasValue && !disabled"
      @click="handleClear"
      class="absolute right-3 text-gray-400 hover:text-white transition-colors duration-200 p-1"
      type="button"
      aria-label="Suche löschen"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
