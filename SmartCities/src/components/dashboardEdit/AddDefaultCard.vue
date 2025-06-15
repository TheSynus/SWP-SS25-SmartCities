<script setup lang="ts">
import type { Card } from '@/models/card'
import DefaultCard from '../DefaultCard.vue'
import { onMounted, ref } from 'vue'

let existingCards: Card[] = []

const loaded = ref(false)

const cards = ref([
  { id: 1, name: 'Wetter', type: 'weather' },
  { id: 2, name: 'Nina', type: 'nina' },
  { id: 3, name: 'Luftqualität', type: 'air' },
  { id: 4, name: 'Wasserstand', type: 'water' },
  { id: 5, name: 'Pollen', type: 'pollen' },
  { id: 6, name: 'Windgeschwindigkeit', type: 'wind' },
])

// Event definieren
const emit = defineEmits<{
  cardSelected: [cardData: { id: number; name: string; type: string }]
}>()

// Handler für Kartenauswahl
const handleCardSelect = (cardData: { id: number; name: string; type: string }) => {
  // Nur emittieren wenn Karte nicht disabled ist
  if (!isCardDisabled(cardData.id)) {
    emit('cardSelected', cardData)
  }
}

// Prüfen ob Karte bereits existiert
const isCardDisabled = (cardId: number) => {
  console.log('isCarddisabeld', cardId)
  return existingCards.some((existingCard) => existingCard.id === cardId)
}

onMounted(() => {
  const loadedCards = localStorage.getItem('cards')
  if (loadedCards) {
    existingCards = JSON.parse(loadedCards)
  } else {
    existingCards = []
  }
  loaded.value = true
})
</script>

<template>
  <div v-if="loaded" class="grid grid-cols-3 gap-4">
    <DefaultCard
      v-for="card in cards"
      :key="card.id"
      :heading="card.name"
      :disabled="isCardDisabled(card.id)"
      @click="handleCardSelect(card)"
    />
  </div>
</template>
