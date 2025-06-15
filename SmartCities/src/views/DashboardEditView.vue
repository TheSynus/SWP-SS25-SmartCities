<script setup lang="ts">
import PhoneMockup from '../components/dashboardEdit/PhoneMockup.vue'
import ModalEdit from '../components/dashboardEdit/ModalEdit.vue'
import DashboardContent from '@/components/DashboardContent.vue'
import 'flowbite'
import { ref } from 'vue'
import { onMounted } from 'vue'
import { initFlowbite } from 'flowbite'
import { Card } from '@/models/card'

const cardStorageKey = 'cards'

const cards = ref([] as Card[])

const handleCardOrderChange = (updateCards: Card[]) => {
  console.log('UpdatedCards', updateCards);
  localStorage.setItem(cardStorageKey, JSON.stringify(updateCards))
}

const handleDefaultCardAdd = (cardData: { id: number, name: string, type: string}) => {
  console.log('Default Card Added', cardData);

  const newCard = new Card(cardData.id, cardData.name, cardData.type, 0)

  cards.value.push(newCard)
}

onMounted(async () => {
  // Flowbite Modals neu initialisieren
  initFlowbite()

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
      <DashboardContent :cards="cards" :showAddButtons="true" @updateCards="handleCardOrderChange" />
    </div>

    <!-- Right Column -->
    <div>
      <PhoneMockup :cards="cards" />
    </div>
  </div>

  <div
    id="static-modal"
    data-modal-backdrop="static"
    tabindex="-1"
    aria-hidden="true"
    class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <ModalEdit @card-selected="handleDefaultCardAdd"/>
  </div>
</template>
