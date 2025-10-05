<script setup lang="ts">
import DefaultCard from '../DefaultCard.vue'
import { ref } from 'vue'
import { cards } from '@/composables/dashboard/useCardStore'


const aviableCards = ref([
  { id: 1, title: 'Wetter', type: 'weather', enabled: true },
  { id: 2, title: 'Nina', type: 'nina', enabled: true },
  { id: 3, title: 'Luftqualität', type: 'air', enabled: false },
  { id: 4, title: 'Wasserstand', type: 'water', enabled: false },
  { id: 5, title: 'Pollen', type: 'pollen', enabled: false },
  { id: 6, title: 'Windgeschwindigkeit', type: 'wind', enabled: true },
])


// Event definieren
const emit = defineEmits<{
  cardSelected: [cardData: { id: number; title: string; type: string }]
}>()

// Handler für Kartenauswahl
const handleCardSelect = (cardData: { id: number; title: string; type: string }) => {
  // Nur emittieren wenn Karte nicht disabled ist
  if (!isCardDisabled(cardData.type)) {
    console.log('type: ' + cardData.type)
    emit('cardSelected', cardData)
  }
}

// Prüfen ob Karte bereits existiert
const isCardDisabled = (type: string) => {
  return  cards.value.some((existingCard) => existingCard.type === type)
}

</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <DefaultCard
      v-for="card in aviableCards"
      :key="card.id"
      :heading="card.title"
      :disabled="!card.enabled || isCardDisabled(card.type)"
      @click="handleCardSelect(card)"
    />
  </div>
</template>
