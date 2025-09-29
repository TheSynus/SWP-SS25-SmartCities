<template>
  <div 
    v-show="show" 
    class="flex-none w-full lg:w-2/3 order-2 lg:order-1"
  >
    <MapComponent 
      class="w-full h-full"
      :markers="markers"
      :categories="categories"
      :selected-marker="selectedMarker"
      :loading="loading"
      @marker-click="handleMarkerClick"
      @map-click="handleMapClick"
    />
  </div>
</template>

<script setup>
import MapComponent from './MapComponent.vue'
const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  markers: {
    type: Array,
    default: () => []
  },
  categories: {
    type: Array,
    default: () => []
  },
  selectedMarker: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['marker-selected', 'map-click'])

function handleMarkerClick(marker) {
  emit('marker-selected', marker)
}

function handleMapClick(coordinates) {
  emit('map-click', coordinates)
}
</script>