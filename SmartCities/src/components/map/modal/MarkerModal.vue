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
            :appointments="appointments"
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
  }
})

const emit = defineEmits(['close', 'submit'])

// Dummy appointments data
const appointments = ref([
  { id: 1, title: 'Besprechung A', date: '2025-06-20' },
  { id: 2, title: 'Workshop B', date: '2025-06-25' },
  { id: 3, title: 'Präsentation C', date: '2025-07-01' },
])

// Form data
const formData = ref({
  title: '',
  categoryId: '',
  appointmentId: '',
  type: 'pin',
  coordinates: { lat: null, lng: null },
  description: '',
  geoJsonData: null,
  csvPins: []
})

const errorMessage = ref('')

// Form validation
const isFormValid = computed(() => {
  if (!formData.value.title || !formData.value.categoryId) {
    return false
  }
  
  if (formData.value.type === 'area') {
    return !!formData.value.geoJsonData
  }
  
  if (formData.value.type === 'pin') {
    return (formData.value.coordinates.lat !== null && formData.value.coordinates.lng !== null) ||
           formData.value.csvPins.length > 0
  }
  
  return false
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
  
  const markerData = {
    title: formData.value.title,
    categoryId: formData.value.categoryId,
    appointmentId: formData.value.appointmentId || null,
    type: formData.value.type
  }
  
  if (formData.value.type === 'area') {
    markerData.geoJsonData = formData.value.geoJsonData
  } else if (formData.value.type === 'pin') {
    if (formData.value.csvPins.length > 0) {
      markerData.pins = formData.value.csvPins
    } else {
      markerData.pins = [{
        lat: formData.value.coordinates.lat,
        lng: formData.value.coordinates.lng,
        title: formData.value.title,
        description: formData.value.description
      }]
    }
  }
  
  emit('submit', markerData)
  resetForm()
}

// Close modal
function closeModal() {
  emit('close')
  resetForm()
}

// Reset form
function resetForm() {
  formData.value = {
    title: '',
    categoryId: '',
    appointmentId: '',
    type: 'pin',
    coordinates: { lat: null, lng: null },
    description: '',
    geoJsonData: null,
    csvPins: []
  }
  errorMessage.value = ''
}

// Reset form when modal is closed
watch(() => props.show, (newShow) => {
  if (!newShow) {
    setTimeout(resetForm, 300)
  }
})
</script>