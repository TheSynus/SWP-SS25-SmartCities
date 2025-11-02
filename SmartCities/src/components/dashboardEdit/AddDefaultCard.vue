<script setup lang="ts">
import { ref } from 'vue'
import DefaultCard from '../cards/DefaultCard.vue'
import NinaCard from '../cards/NinaCard.vue'
import WindCard from '../cards/WindCard.vue'
import WeatherCard from '../cards/WeatherCard.vue'
import { cards } from '@/composables/dashboard/useCardStore'

// Kartenliste
const aviableCards = ref([
  { id: 1, title: 'Wetter', type: 'weather', enabled: true },
  { id: 2, title: 'Nina', type: 'nina', enabled: true },
 // { id: 3, title: 'Luftqualität', type: 'air', enabled: false },
 // { id: 4, title: 'Wasserstand', type: 'water', enabled: false },
 // { id: 5, title: 'Pollen', type: 'pollen', enabled: false },
  { id: 6, title: 'Windgeschwindigkeit', type: 'wind', enabled: true },
])

// Event definieren
const emit = defineEmits<{
  cardSelected: [cardData: { id: number; title: string; type: string }]
}>()

// Prüfen ob Karte bereits existiert 
const isCardDisabled = (type: string) => {
  return cards.value.some((existingCard) => existingCard.type === type)
}

// Mapping der Karten-Typen zu den Komponenten
const cardComponentMap: Record<string, any> = {
  weather: WeatherCard,
  nina: NinaCard,
  wind: WindCard,
  // Fallback-Typen verwenden DefaultCard
}

// Komponente nach Typ auflösen
const resolveCardComponent = (type: string) => {
  return cardComponentMap[type] ?? DefaultCard
}

// Handler für Kartenauswahl
const handleCardSelect = (cardData: { id: number; title: string; type: string }) => {
  if (!isCardDisabled(cardData.type)) {
    console.log('type:', cardData.type)
    emit('cardSelected', cardData)
  }
}
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <component
      v-for="card in aviableCards"
      :key="card.id"
      :is="resolveCardComponent(card.type)"
      :heading="card.title"
      :disabled="!card.enabled || isCardDisabled(card.type)"
      @click="handleCardSelect(card)"
      class="cursor-pointer"
    />
  </div>
</template>
