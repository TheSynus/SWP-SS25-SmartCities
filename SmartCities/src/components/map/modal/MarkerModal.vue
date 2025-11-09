<template>
  <!-- Modal backdrop -->
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-80 z-40"
    @click="closeModal"
  ></div>

  <!-- Modal -->
  <div
    :id="modalId"
    tabindex="-1"
    aria-hidden="true"
    :class="[
      'fixed inset-0 z-50 flex items-center justify-center p-4',
      show ? 'flex' : 'hidden'
    ]"
  >
    <div class="relative w-full max-w-4xl max-h-[90vh] mx-auto">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 flex flex-col max-h-full">
        <!-- Modal header -->
        <ModalHeader
          :title="isEditMode ? 'Markierung bearbeiten' : 'Neue Markierung erstellen'"
          @close="closeModal"
        />

        <!-- Modal body -->
        <div class="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
          <MarkerForm
            v-model="formData"
            :categories="categories"
            :error-message="errorMessage"
            @submit="submitForm"
            @error="handleError"
          />
        </div>

        <!-- Modal footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200 rounded-b dark:border-gray-600 flex-shrink-0">
          <!-- Left side: Delete button (only in edit mode) -->
          <button
            v-if="isEditMode"
            type="button"
            @click="handleDelete"
            class="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
          >
            Löschen
          </button>
          <div v-else></div>

          <!-- Right side: Save and Cancel buttons -->
          <div class="flex space-x-2">
            <button
              type="button"
              @click="submitForm"
              :disabled="!isFormValid"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isEditMode ? 'Speichern' : 'Markierung erstellen' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ModalHeader from './ModalHeader.vue'
import MarkerForm from './MarkerForm.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  categories: {
    type: Array,
    default: () => []
  },
  modalId: {
    type: String,
    default: 'marker-modal'
  },
  initialCoordinates: {
    type: [Object, null],
    default: null
  },
  markerData: {
    type: [Object, null],
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit', 'delete'])

// Form data - using DB field names
const formData = ref({
  name: '',
  description: '',
  category_id: null,
  latitude: null,
  longitude: null,
  is_public: false
})

const errorMessage = ref('')

// Form validation
const isFormValid = computed(() => {
  return !!(
    formData.value.name &&
    formData.value.category_id &&
    formData.value.latitude !== null &&
    formData.value.longitude !== null
  )
})

// Handle error from child components
function handleError(error) {
  errorMessage.value = error
}

// Submit form
function submitForm() {
  if (!isFormValid.value) {
    errorMessage.value = 'Bitte füllen Sie alle erforderlichen Felder aus'
    return
  }

  // Prepare data for backend (already in correct format)
  const markerData = {
    name: formData.value.name,
    description: formData.value.description || '',
    category_id: formData.value.category_id,
    latitude: parseFloat(formData.value.latitude),
    longitude: parseFloat(formData.value.longitude),
    is_public: formData.value.is_public
  }

  emit('submit', markerData)
}

// Handle delete
function handleDelete() {
  if (props.markerData && props.markerData.id) {
    emit('delete', props.markerData.id)
  }
}

// Close modal
function closeModal() {
  emit('close')
  // Don't reset form immediately to allow animation
  setTimeout(resetForm, 300)
}

// Reset form
function resetForm() {
  formData.value = {
    name: '',
    description: '',
    category_id: null,
    latitude: props.initialCoordinates?.lat || null,
    longitude: props.initialCoordinates?.lng || null,
    is_public: false
  }
  errorMessage.value = ''
}

// Watch for markerData changes (edit mode)
watch(
  () => props.markerData,
  (newMarkerData) => {
    if (newMarkerData && props.show && props.isEditMode) {
      formData.value = {
        name: newMarkerData.name || '',
        description: newMarkerData.description || '',
        category_id: newMarkerData.category_id || null,
        latitude: newMarkerData.latitude || null,
        longitude: newMarkerData.longitude || null,
        is_public: newMarkerData.is_public || false
      }
    }
  },
  { immediate: true, deep: true }
)

// Watch for initialCoordinates changes (create mode)
watch(
  () => props.initialCoordinates,
  (newCoords) => {
    if (newCoords && props.show && !props.isEditMode) {
      formData.value.latitude = newCoords.lat
      formData.value.longitude = newCoords.lng
    }
  },
  { immediate: true, deep: true }
)

// Watch for show prop changes
watch(() => props.show, (newShow) => {
  if (!newShow) {
    setTimeout(resetForm, 300)
  } else if (newShow) {
    if (props.isEditMode && props.markerData) {
      // Load existing marker data
      formData.value = {
        name: props.markerData.name || '',
        description: props.markerData.description || '',
        category_id: props.markerData.category_id || null,
        latitude: props.markerData.latitude || null,
        longitude: props.markerData.longitude || null,
        is_public: props.markerData.is_public || false
      }
    } else if (props.initialCoordinates) {
      // Set coordinates for new marker
      formData.value.latitude = props.initialCoordinates.lat
      formData.value.longitude = props.initialCoordinates.lng
    }
  }
})
</script>
