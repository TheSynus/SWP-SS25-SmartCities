<script setup lang="ts">
import type { Card } from '@/models/card'
import AddCardButton from './dashboardEdit/AddCardButton.vue'
import DefaultCard from './cards/DefaultCard.vue'
import { ref, watch } from 'vue'
import NinaCard from './cards/NinaCard.vue'
import WeatherCard from './cards/WeatherCard.vue'
import WindCard from './cards/WindCard.vue'
import CardGraph from './cards/CardGraph.vue'

const props = defineProps<{
  cards: Array<Card>
  showAddButtons?: boolean
}>()

const emit = defineEmits<{
  reorderCards: [cards: Array<Card>]
  addCard: [index: number]
  deleteCard: [card: Card]
  updateCard: [card: Card]
}>()

// Lokale Kopie der Cards für Drag & Drop
const localCards = ref([...props.cards])

// Drag & Drop State
const draggedItem = ref<Card | null>(null)
const draggedOverIndex = ref<number | null>(null)

// Watch props changes
watch(
  () => props.cards,
  (newCards) => {
    localCards.value = [...newCards]
  },
  { deep: true },
)

// Drag Events
const handleDragStart = (event: DragEvent, card: Card) => {
  if (!props.showAddButtons) return

  draggedItem.value = card
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('text/html', '')

  // Visual feedback für die ganze Card
  const cardElement = (event.target as HTMLElement).closest('.card-container') as HTMLElement
  if (cardElement) {
    cardElement.style.opacity = '0.5'
  }
}

const handleDragEnd = (event: DragEvent) => {
  // Visual feedback zurücksetzen
  const cardElement = (event.target as HTMLElement).closest('.card-container') as HTMLElement
  if (cardElement) {
    cardElement.style.opacity = '1'
  }

  draggedItem.value = null
  draggedOverIndex.value = null
}

const handleDragOver = (event: DragEvent, index: number) => {
  if (!props.showAddButtons || !draggedItem.value) return

  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  draggedOverIndex.value = index
}

const handleDragLeave = () => {
  draggedOverIndex.value = null
}

const handleDrop = (event: DragEvent, dropIndex: number) => {
  if (!props.showAddButtons || !draggedItem.value) return

  event.preventDefault()

  const draggedCard = draggedItem.value
  const currentIndex = localCards.value.findIndex((card) => card.id === draggedCard.id)

  if (currentIndex === -1 || currentIndex === dropIndex) return

  // Neue Reihenfolge erstellen
  const newCards = [...localCards.value]
  newCards.splice(currentIndex, 1)
  newCards.splice(dropIndex, 0, draggedCard)

  localCards.value = newCards
  emit('reorderCards', newCards)

  draggedOverIndex.value = null
}

const addButtonClicked = (index: number) => {
  emit('addCard', index)
}

// Handler für das Löschen
const handleDeleteCard = (card: Card) => {
  emit('deleteCard', card)
}

// Computed für CSS-Klassen
const getCardContainerClasses = (index: number) => {
  const baseClasses = 'transition-all duration-200'
  const dragOverClasses =
    draggedOverIndex.value === index
      ? 'bg-blue-50 border rounded-lg border-blue-300 border-dashed'
      : ''
  const fullWidthClass = props.showAddButtons ? '' : 'w-full'
  return `${baseClasses} ${dragOverClasses} ${fullWidthClass}`.trim()
}

const getDragHandleClasses = () => {
  return props.showAddButtons
    ? 'cursor-move bg-gray-50 hover:bg-gray-100 border-b border-gray-200 p-2 rounded-t-lg transition-colors duration-150'
    : 'hidden'
}

const handleCardTitleChanged = (newTitle: string, cardId: number) => {
  const card = localCards.value.find((c) => c.id === cardId)
  if (card) {
    card.title = newTitle
    emit('updateCard', card)
  }
}
</script>

<template>
  <ul class="flex flex-col items-center pt-10 pb-10 space-y-4 h-full">
    <!-- Wenn Liste leer ist und showAddButtons true -->
    <li
      v-if="props.showAddButtons && localCards.length === 0"
      class="flex justify-center items-center min-h-[200px]"
    >
      <AddCardButton @click="addButtonClicked(0)" />
    </li>

    <!-- Normale Liste wenn Cards vorhanden -->
    <template v-if="localCards.length > 0">
      <!-- Erster Button vor der ersten Card -->
      <li v-if="props.showAddButtons" class="flex items-center gap-4 w-full">
        <div class="flex-1 flex justify-center">
          <AddCardButton @click="addButtonClicked(0)" />
        </div>
        <!-- Platzhalter für Delete-Button um Alignment zu erhalten -->
        <div class="flex-shrink-0 w-10 h-10"></div>
      </li>

      <!-- Cards mit Buttons dazwischen - DRAGGABLE via Handle! -->
      <template v-for="(card, index) in localCards" :key="card.id">
        <li class="flex items-center w-full" :class="{ 'gap-4': props.showAddButtons }">
          <!-- Card Container mit separatem Drag Handle -->
          <div
            :class="getCardContainerClasses(index)"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, index)"
            class="flex-1 card-container"
          >
            <!-- Drag Handle - nur sichtbar im Edit Mode -->
            <div
              v-if="props.showAddButtons"
              :class="getDragHandleClasses()"
              :draggable="true"
              @dragstart="handleDragStart($event, card)"
              @dragend="handleDragEnd"
              class="flex items-center justify-center"
            >
              <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"
                />
              </svg>
              <span class="ml-2 text-sm text-gray-500 font-medium">Zum Verschieben ziehen</span>
            </div>

            <!-- Card Content - normal interaktiv -->
            <div
              :class="{
                'rounded-t-none max-w-sm': props.showAddButtons,
                'rounded-lg': !props.showAddButtons,
              }"
            >
              <NinaCard v-if="card.type === 'nina'" :heading="card.title" />
              <CardGraph
                v-else-if="card.graph_id !== undefined && card.graph_id !== null"
                :type="card.type"
                :graph_id="card.graph_id"
                :editable="props.showAddButtons"
                :title="card.title"
                @title-changed="handleCardTitleChanged($event, card.id)"
              />
              <WeatherCard v-else-if="card.type === 'weather'" :heading="card.title"></WeatherCard>
              <WindCard v-else-if="card.type === 'wind'" :heading="card.title"></WindCard>
              <DefaultCard v-else :heading="card.title"></DefaultCard>
            </div>
          </div>

          <!-- Mülltonne Button -->
          <button
            v-if="props.showAddButtons"
            @click="handleDeleteCard(card)"
            class="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
            type="button"
            title="Karte löschen"
          >
            <svg
              class="w-6 h-6"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
              />
            </svg>
          </button>
        </li>

        <!-- Button zwischen den Cards - mittig positioniert -->
        <li
          v-if="props.showAddButtons && index < localCards.length - 1"
          class="flex items-center gap-4"
        >
          <div class="flex-1 flex justify-center">
            <AddCardButton @click="addButtonClicked(index + 1)" />
          </div>
          <!-- Platzhalter für Delete-Button um Alignment zu erhalten -->
          <div class="flex-shrink-0 w-10 h-10"></div>
        </li>
      </template>

      <!-- Button nach der letzten Card -->
      <li v-if="props.showAddButtons" class="flex items-center gap-4">
        <div class="flex-1 flex justify-center">
          <AddCardButton @click="addButtonClicked(localCards.length)" />
        </div>
        <!-- Platzhalter für Delete-Button um Alignment zu erhalten -->
        <div class="flex-shrink-0 w-10 h-10"></div>
      </li>
    </template>
  </ul>
</template>
