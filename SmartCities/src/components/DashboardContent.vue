<script setup lang="ts">
import type { Card } from '@/models/card'
import AddCardButton from './dashboardEdit/AddCardButton.vue'
import DefaultCard from './DefaultCard.vue'
import { ref, watch } from 'vue'

const props = defineProps<{
  cards: Array<Card>
  showAddButtons?: boolean
}>()

const emit = defineEmits<{
  updateCards: [cards: Array<Card>]
  addCard: [index: number]
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
  <ul class="flex flex-col space-y-4">
    <!-- Wenn Liste leer ist und showAddButtons true: nur ein Button zentriert -->
    <li
      v-if="props.showAddButtons && localCards.length === 0"
      class="flex justify-center items-center min-h-[200px]"
    >
      <AddCardButton @click="addButtonClicked(0)" />
    </li>

    <!-- Normale Liste wenn Cards vorhanden -->
    <template v-if="localCards.length > 0">
      <!-- Cards mit Buttons dazwischen - DRAGGABLE! -->
      <template v-for="(card, index) in localCards" :key="card.id">
        <!-- Button über den Karten -->
        <li v-if="props.showAddButtons">
          <AddCardButton @click="addButtonClicked(index)" />
        </li>
        <li
          :class="getCardClasses(index)"
          :draggable="props.showAddButtons"
          @dragstart="handleDragStart($event, card)"
          @dragend="handleDragEnd"
          @dragover="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop="handleDrop($event, index)"
        >
          <DefaultCard
            :heading="card.name"
            :class="{ 'pointer-events-none': props.showAddButtons }"
          />
        </li>
      </template>

      <!-- Button unten -->
      <li v-if="props.showAddButtons">
        <AddCardButton @click="addButtonClicked(localCards.length)" />
      </li>
    </template>
  </ul>
</template>
