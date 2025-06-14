<script setup lang="ts">
import AddCardButton from './dashboardEdit/AddCardButton.vue';
import DefaultCard from './DefaultCard.vue';

// Alternativ Lösung 2: Ohne withDefaults, mit direkten Default-Werten
const props = defineProps<{
  cards: Array<{ id: number; name: string }>
  showAddButtons?: boolean
}>()

// Alternativ Lösung 3: Mit separatem Interface und expliziten Defaults
// interface Props {
//   cards: Array<{ id: number; name: string }>
//   showAddButtons?: boolean
// }
//
// const props = withDefaults(defineProps<Props>(), {
//   showAddButtons: false
// })
</script>

<template>
  <ul class="flex flex-col space-y-4">
    <!-- Button oben -->
    <li v-if="props.showAddButtons">
      <AddCardButton />
    </li>

    <!-- Cards mit Buttons dazwischen -->
    <template v-for="(card, index) in props.cards" :key="card.id">
      <li>
        <DefaultCard :heading="card.name" />
      </li>

      <!-- Button zwischen den Karten (nicht nach der letzten) -->
      <li v-if="props.showAddButtons && index < props.cards.length - 1">
        <AddCardButton />
      </li>
    </template>

    <!-- Button unten -->
    <li v-if="props.showAddButtons">
      <AddCardButton />
    </li>
  </ul>
</template>
