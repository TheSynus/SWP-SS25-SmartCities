<template>
  <div
    v-show="show"
    class="flex-1 min-h-0 flex"
  >
    <MapComponent
      class="w-full h-full lg:flex-1"
      :markers="markers"
      :categories="categories"
      :selected-marker="selectedMarker"
      :loading="loading"
      :is-admin="isAdmin"
      @marker-click="handleMarkerClick"
      @map-click="handleMapClick"
      @marker-details="$emit('marker-details', $event)"
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
    type: [Object, null],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['marker-selected', 'map-click', 'marker-details'])

function handleMarkerClick(marker) {
  emit('marker-selected', marker)
}

function handleMapClick(coordinates) {
  emit('map-click', coordinates)
}
</script>
