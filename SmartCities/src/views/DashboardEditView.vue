<script setup lang="ts">
import DefaultCard from '../components/DefaultCard.vue'
import AddCardButton from '../components/dashboardEdit/AddCardButton.vue'
import PhoneMockup from '../components/dashboardEdit/PhoneMockup.vue'
import ModalEdit from '../components/dashboardEdit/ModalEdit.vue'
</script>

<template>
  <div class="grid grid-cols-2 overflow-hidden h-[calc(100vh-64px)]">
    <!-- Left Column -->
    <!-- <div class="self-start">PLATZHALTER</div> -->

    <!-- Scrollable Middle Column -->
    <div class="flex justify-center overflow-y-scroll h-full custom-scrollbar">
      <ul>
        <AddCardButton />
        <li class="py-4"><DefaultCard /></li>
        <AddCardButton />
        <li class="py-4"><DefaultCard /></li>
        <AddCardButton />
        <li class="py-4"><DefaultCard /></li>
        <AddCardButton />
        <li class="py-4"><DefaultCard /></li>
        <AddCardButton />
        <li class="py-4"><DefaultCard /></li>
        <AddCardButton />
        <li class="py-4"><DefaultCard /></li>
        <AddCardButton />
      </ul>
    </div>

    <!-- Right Column -->
    <div class="self-start">
      <PhoneMockup />
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

<style scoped>
/* Hide scrollbar arrows */
::-webkit-scrollbar-button {
  display: none;
}
</style>
