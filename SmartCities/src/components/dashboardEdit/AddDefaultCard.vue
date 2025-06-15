<script setup lang="ts">
import DefaultCard from '../DefaultCard.vue'
import { ref } from 'vue'
import { cards } from '@/composables/dashboard/useCardStore'


const aviableCards = ref([
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
  return cards.value.some((existingCard) => existingCard.id === cardId)
}

</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <DefaultCard
      v-for="card in aviableCards"
      :key="card.id"
      :heading="card.name"
      :disabled="isCardDisabled(card.id)"
      @click="handleCardSelect(card)"
    />
  </div>
</template>
