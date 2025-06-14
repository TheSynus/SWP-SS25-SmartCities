<script setup lang="ts">
import PhoneMockup from '../components/dashboardEdit/PhoneMockup.vue'
import ModalEdit from '../components/dashboardEdit/ModalEdit.vue'
import DashboardContent from '@/components/DashboardContent.vue'
import { ref } from 'vue'

const cards = ref([
  { id: 1, name: 'Wetter' },
  { id: 2, name: 'Nina' },
  { id: 3, name: 'Luftqualität' },
  { id: 4, name: 'Wasserstand' },
  { id: 5, name: 'Pollen' },
  { id: 6, name: 'Windgeschwindigkeit' },
  { id: 7, name: 'Bildkachel' },
])


</script>

<template>
  <div class="grid grid-cols-2 overflow-hidden h-[calc(100vh-64px)]">
    <!-- Left Column -->
    <!-- <div class="self-start">PLATZHALTER</div> -->

    <!-- Scrollable Middle Column -->
    <div class="flex justify-center overflow-y-scroll h-full custom-scrollbar">
      <DashboardContent :cards="cards" :showAddButtons="true" />
    </div>

    <!-- Right Column -->
    <div class="self-start">
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
    <ModalEdit />
  </div>
</template>

