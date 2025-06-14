<script setup lang="ts">
import DefaultCard from '../DefaultCard.vue'
import { ref } from 'vue';

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
  <div class="grid grid-cols-3 gap-4">
    <DefaultCard
      v-for="card in cards"
      :key="card.id"
      :heading="card.name"
    />
  </div>
</template>
