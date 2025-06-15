<script setup lang="ts">
import CardGraphLine from '../CardGraphLine.vue'
import CardGraphColumn from '../CardGraphColumn.vue'
import CardGraphBar from '../CardGraphBar.vue'
import CardGraphPie from '../CardGraphPie.vue'
</script>

<template>
  <div class="grid grid-cols-2 place-items-center gap-y-4">
    <div class="h-80">
      <CardGraphLine />
    </div>
    <div class="h-80">
      <CardGraphColumn />
    </div>
    <div class="h-80">
      <CardGraphBar />
    </div>
    <div class="h-80">
      <CardGraphPie />
    </div>
  </div>
</template>
