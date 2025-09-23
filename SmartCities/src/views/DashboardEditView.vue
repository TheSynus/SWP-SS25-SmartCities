<script setup lang="ts">
import PhoneMockup from '../components/dashboardEdit/PhoneMockup.vue'
import ModalEdit from '../components/dashboardEdit/ModalEdit.vue'
import DashboardContent from '@/components/DashboardContent.vue'
import 'flowbite'
import { onMounted, ref } from 'vue'
import { Card } from '@/models/card'
import { cards, useCardStore } from '@/composables/dashboard/useCardStore'
import type { Graph } from '@/models/graph'

let addIndex = 0
const isModalVisible = ref(false)

// Store verwenden - cards ist jetzt reaktiv!
const { getCards, addCard, deleteCard, reorderCards } = useCardStore()

const handleAddCardClick = (index: number) => {
  console.log('AddCard', index)
  addIndex = index
  showModal()
}

const handleDefaultCardAdd = (cardData: { id: number; title: string; type: string }) => {
  console.log('Default Card Added', cardData)

  // Store Aufruf - cards wird automatisch aktualisiert
  addCard(cardData.title, cardData.type, addIndex, null)

  hideModal()
}

const handleGraphCardAdd = (graph: Graph) => {
  console.log('Graph Card Added', graph)

  addCard("Test Graph", graph.type, addIndex, graph.graph_id)

  hideModal()
}

const handleDeleteCard = (id: number) => {
  deleteCard(id)
}

const handleCardOrderChange = (updateCards: Card[]) => {
  console.log('UpdatedCards', updateCards)
  reorderCards(updateCards)
}

const showModal = () => {
  isModalVisible.value = true
}

const hideModal = () => {
  isModalVisible.value = false
}

onMounted(() => {
  getCards()
})
</script>

<template>
  <div class="grid grid-cols-2 overflow-hidden h-screen pt-20 items-center justify-center">
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
    class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <ModalEdit
      @card-selected="handleDefaultCardAdd"
      @close-clicked="hideModal"
      @graph-selected="handleGraphCardAdd"
    />
  </div>
</template>
