<script setup lang="ts">
import { onMounted } from 'vue'
import HomeView from '@/components/HomeView.vue'
import { cards, useCardStore } from '@/composables/dashboard/useCardStore'


const { getCards } = useCardStore()

onMounted(() => {
  getCards()
})
</script>

<template>
  <div class="pt-10 overflow-hidden min-h-screen">
    <HomeView :cards="cards" :scale="1"></HomeView>
  </div>
</template>
