<script setup lang="ts">
import { ref, watch } from 'vue'
import GraphBarWidget from '../widgets/GraphBarWidget.vue'
import GraphColumnWidget from '../widgets/GraphColumnWidget.vue'
import GraphLineWidget from '../widgets/GraphLineWidget.vue'
import GraphPieWidget from '../widgets/GraphPieWidget.vue'

const props = defineProps<{
  graph_id: number | undefined
  type: string
  editable: boolean
  title: string
}>()

const emit = defineEmits<{
  titleChanged: [title: string]
}>()

const isEditing = ref<boolean>(false)
const editTitle = ref<string>(props.title)

watch(
  () => props.title,
  (newTitle) => {
    editTitle.value = newTitle
  },
)

function startEdit() {
  if (!props.editable) return
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  editTitle.value = props.title
}

function saveEdit() {
  const v = (editTitle.value || '').trim()
  if (!v) {
    // leere Eingabe -> zurücksetzen
    cancelEdit()
    return
  }
  isEditing.value = false
  emit('titleChanged', v)
}
</script>

<template>
  <div
    class="block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
  >
    <!-- Titel -->
    <div class="flex items-center gap-2 w-full pb-2 flex-row justify-between">
      <h5
        v-if="!isEditing"
        class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2 truncate"
      >
        {{ title }}
      </h5>
      <div v-else class="pb-2 w-full max-w-xl flex items-center gap-2">
        <input
          ref="titleInputRef"
          v-model="editTitle"
          type="text"
          class="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Titel eingeben"
          @keydown.enter.prevent="saveEdit"
          @keydown.esc.prevent="cancelEdit"
        />
        <button
          type="button"
          class="p-1 rounded-lg text-gray-800 dark:text-white hover:bg-green-100 dark:hover:bg-green-700"
          @click="saveEdit"
          aria-label="Änderung bestätigen"
        >
          <svg
            class="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 11.917 9.724 16.5 19 7.5"
            />
          </svg>
        </button>

        <button
          type="button"
          class="p-1 rounded-lg text-gray-800 dark:text-white hover:bg-red-100 dark:hover:bg-red-700"
          @click="cancelEdit"
          aria-label="Änderung verwerfen"
        >
          <svg
            class="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
            />
          </svg>
        </button>
      </div>
      <!-- Stift-Icon für Edit -->
      <div class="shrink-0 pt-1" v-if="editable && !isEditing">
        <button
          type="button"
          class="p-1 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          @click="startEdit"
          aria-label="Titel bearbeiten"
        >
          <svg
            class="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
            />
          </svg>
        </button>
      </div>
    </div>

    <GraphBarWidget v-if="type === 'bar'" :graph_id="graph_id" />
    <GraphColumnWidget v-else-if="type === 'column'" :graph_id="graph_id" />
    <GraphLineWidget v-else-if="type === 'line'" :graph_id="graph_id" />
    <GraphPieWidget v-else-if="type === 'pie'" :graph_id="graph_id" />
  </div>
</template>
