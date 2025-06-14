<script setup lang="ts">
import DefaultCard from '../components/DefaultCard.vue'
import AddCardButton from '../components/dashboardEdit/AddCardButton.vue'
import PhoneMockup from '../components/dashboardEdit/PhoneMockup.vue'
</script>

<template>
  <div class="grid grid-cols-2 overflow-hidden h-[calc(100vh-64px)]">
    <!-- Left Column -->
    <!-- <div class="self-start">PLATZHALTER</div> -->

    <!-- Scrollable Middle Column -->
    <div
      class="flex justify-center overflow-y-scroll h-full custom-scrollbar"
    >
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
</template>

<style scoped>
/* Hide scrollbar arrows */
::-webkit-scrollbar-button {
  display: none;
}
</style>
