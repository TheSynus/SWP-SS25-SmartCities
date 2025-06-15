<script setup lang="ts">
import PhoneMockup from '../components/dashboardEdit/PhoneMockup.vue'
import ModalEdit from '../components/dashboardEdit/ModalEdit.vue'
import DashboardContent from '@/components/DashboardContent.vue'
import 'flowbite'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { Card } from '@/models/card'

const cardStorageKey = 'cards'
let addIndex = 0

const cards = ref([] as Card[])
const isModalVisible = ref(false)

const handleCardOrderChange = (updateCards: Card[]) => {
  console.log('UpdatedCards', updateCards)

  // Indizes basierend auf Array-Position setzen
  updateCards.forEach((card, index) => {
    card.index = index
  })

  // Cards ref mit den aktualisierten Karten überschreiben
  cards.value = updateCards

  // In localStorage speichern
  localStorage.setItem(cardStorageKey, JSON.stringify(updateCards))
}

const handleDefaultCardAdd = (cardData: { id: number; name: string; type: string }) => {
  console.log('Default Card Added', cardData)

  // Alle Karten mit Index >= addIndex um 1 erhöhen
  cards.value.forEach((card) => {
    if (card.index >= addIndex) {
      card.index += 1
    }
  })

  // Neue Karte erstellen
  const newCard = new Card(cardData.id, cardData.name, cardData.type, addIndex)

  // Karte hinzufügen und sortieren
  cards.value.push(newCard)
  cards.value.sort((a, b) => a.index - b.index)

  // In localStorage speichern
  localStorage.setItem(cardStorageKey, JSON.stringify(cards.value))

  hideModal()
}

const handleAddCardClick = (index: number) => {
  console.log('AddCard', index)

  addIndex = index

  showModal()
}

const handleDeleteCard = (id: number) => {
  // Karte mit der ID entfernen
  const existing = cards.value.filter((card) => card.id !== id)

  for (let i = 0; i < existing.length; i++) {
    const element = existing[i]
    element.index = i
  }

  // Speichern
  localStorage.setItem(cardStorageKey, JSON.stringify(existing))

  cards.value = existing
}

const showModal = () => {
  isModalVisible.value = true
}

const hideModal = () => {
  isModalVisible.value = false
}

onMounted(async () => {
  // Cards abrufen
  const safedCards = localStorage.getItem(cardStorageKey)
  if (safedCards) {
    cards.value = JSON.parse(safedCards)
  }
})
</script>

<template>
  <div class="grid grid-cols-2 overflow-hidden h-screen pt-20 items-center">
    <!-- Scrollable Left Column -->
    <div class="flex justify-center overflow-y-scroll h-full custom-scrollbar items-center">
      <DashboardContent
        :cards="cards"
        :showAddButtons="true"
        @updateCards="handleCardOrderChange"
        @add-card="handleAddCardClick"
        @delete-card="handleDeleteCard"
      />
    </div>

    <!-- Right Column -->
    <div>
      <PhoneMockup :cards="cards" />
    </div>
  </div>

  <div
    v-if="isModalVisible"
    tabindex="-1"
    aria-hidden="true"
    class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <ModalEdit @card-selected="handleDefaultCardAdd" @close-clicked="hideModal" />
  </div>
</template>
