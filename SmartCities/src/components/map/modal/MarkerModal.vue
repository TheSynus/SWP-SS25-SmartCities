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
        <ModalHeader @close="closeModal" />

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
        <ModalFooter
          :is-form-valid="isFormValid"
          @submit="submitForm"
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ModalHeader from './ModalHeader.vue'
import ModalFooter from './ModalFooter.vue'
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
    default: 'new-marker-modal'
  },
  initialCoordinates: {
    type: [Object, null],
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

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

  console.log('Submitting marker:', markerData)
  emit('submit', markerData)
  closeModal()
}

// Close modal
function closeModal() {
  emit('close')
  resetForm()
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

// Watch for initialCoordinates changes
watch(
  () => props.initialCoordinates,
  (newCoords) => {
    if (newCoords && props.show) {
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
  } else if (newShow && props.initialCoordinates) {
    // Set coordinates when modal opens
    formData.value.latitude = props.initialCoordinates.lat
    formData.value.longitude = props.initialCoordinates.lng
  }
})
</script>
