<script setup lang="ts">
import type { Card } from '@/models/card'
import AddCardButton from './dashboardEdit/AddCardButton.vue'
import DefaultCard from './DefaultCard.vue'
import { ref, watch } from 'vue'
import CardGraphColumn from './CardGraphColumn.vue';

const props = defineProps<{
  cards: Array<Card>
  showAddButtons?: boolean
}>()

const emit = defineEmits<{
  updateCards: [cards: Array<Card>]
  addCard: [index: number]
  deleteCard: [id: number]
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

  // Visual feedback
  const target = event.target as HTMLElement
  target.style.opacity = '0.5'
}

const handleDragEnd = (event: DragEvent) => {
  const target = event.target as HTMLElement
  target.style.opacity = '1'

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
  emit('updateCards', newCards)

  draggedOverIndex.value = null
}

const addButtonClicked = (index: number) => {
  emit('addCard', index)
}

// Handler für das Löschen
const handleDeleteCard = (id: number) => {
  emit('deleteCard', id)
}

// Computed für CSS-Klassen
const getCardClasses = (index: number) => {
  const baseClasses = props.showAddButtons ? 'cursor-move transition-all duration-200' : ''
  const dragOverClasses =
    draggedOverIndex.value === index
      ? 'bg-blue-50 border rounded-lg border-blue-300 border-dashed'
      : ''
  return `${baseClasses} ${dragOverClasses}`.trim()
}
</script>

<template>
  <ul class="flex flex-col space-y-4 h-full">
    <!-- Wenn Liste leer ist und showAddButtons true: nur ein Button zentriert -->
    <li
      v-if="props.showAddButtons && localCards.length === 0"
      class="flex justify-center items-center min-h-[200px]"
    >
      <AddCardButton @click="addButtonClicked(0)" />
    </li>

    <!-- Normale Liste wenn Cards vorhanden -->
    <template v-if="localCards.length > 0">
      <!-- Erster Button vor der ersten Card -->
      <li v-if="props.showAddButtons" class="flex items-center gap-4">
        <div class="flex-1 flex justify-center">
          <AddCardButton @click="addButtonClicked(0)" />
        </div>
        <!-- Platzhalter für Delete-Button um Alignment zu erhalten -->
        <div class="flex-shrink-0 w-10 h-10"></div>
      </li>

      <!-- Cards mit Buttons dazwischen - DRAGGABLE! -->
      <template v-for="(card, index) in localCards" :key="card.id">
        <li class="flex items-center" :class="{ 'gap-4': props.showAddButtons }">
          <!-- Card Container -->
          <div
            :class="getCardClasses(index)"
            :draggable="props.showAddButtons"
            @dragstart="handleDragStart($event, card)"
            @dragend="handleDragEnd"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop($event, index)"
            class="flex-1"
          >
            <DefaultCard v-if="card.type !== 'graph'"
              :heading="card.name"
              :class="{ 'pointer-events-none': props.showAddButtons }"
            />
            <!-- Testweise immer Säulen-->
             <CardGraphColumn v-else />
          </div>

          <!-- Mülltonne Button -->
          <button
            v-if="props.showAddButtons"
            @click="handleDeleteCard(card.id)"
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
