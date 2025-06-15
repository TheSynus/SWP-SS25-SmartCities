<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="latitude" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Breitengrad <span class="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="latitude"
          :value="coordinates.lat"
          @input="updateCoordinate('lat', $event.target.value)"
          step="any"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          placeholder="z.B. 53.5511"
          required
        />
      </div>
      <div>
        <label for="longitude" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Längengrad <span class="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="longitude"
          :value="coordinates.lng"
          @input="updateCoordinate('lng', $event.target.value)"
          step="any"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
          placeholder="z.B. 9.9937"
          required
        />
      </div>
    </div>
    <div>
      <label for="pin-description" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Beschreibung (optional)
      </label>
      <textarea
        id="pin-description"
        :value="description"
        @input="$emit('update:description', $event.target.value)"
        rows="3"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
        placeholder="Zusätzliche Informationen zu diesem Pin..."
      ></textarea>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  coordinates: {
    type: Object,
    default: () => ({ lat: null, lng: null })
  },
  description: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:coordinates', 'update:description'])

function updateCoordinate(key, value) {
  const numValue = value === '' ? null : parseFloat(value)
  emit('update:coordinates', {
    ...props.coordinates,
    [key]: numValue
  })
}
</script>