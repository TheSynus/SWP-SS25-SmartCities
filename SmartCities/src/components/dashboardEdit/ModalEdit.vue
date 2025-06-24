<script setup lang="ts">
import { onMounted } from 'vue';
import AddDefaultCard from './AddDefaultCard.vue'
import AddGraphCard from './AddGraphCard.vue'
import { initFlowbite } from 'flowbite';

// Event definieren, das nach außen weitergegeben wird
const emit = defineEmits<{
  cardSelected: [cardData: { id: number; title: string; type: string }],
  closeClicked: []
  graphSelected: [graphId: number]
}>()

// Handler für das Event von AddDefaultCard
const handleCardSelected = (cardData: { id: number; title: string; type: string }) => {
  emit('cardSelected', cardData)
}

const handeCloseClicked = () => {
  emit('closeClicked')
}

const handleGraphSelected = (graphId: number) => {
  emit('graphSelected', graphId)
}

onMounted(() => {
  initFlowbite();
})

</script>

<template>
  <!-- Main modal -->
  <div class="relative p-4 w-full max-w-7xl max-h-full">
    <!-- Modal content -->
    <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
      <!-- Modal header -->
      <div
        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200"
      >
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Kachel hinzufügen</h3>
        <button
          type="button"
          @click="handeCloseClicked"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span class="sr-only">Close modal</span>
        </button>
      </div>
      <!-- Modal body -->
      <div class="p-4 md:p-5 space-y-4">
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
          <ul
            class="flex flex-wrap -mb-px text-sm font-medium text-center"
            id="default-tab"
            data-tabs-toggle="#default-tab-content"
            role="tablist"
          >
            <li class="me-2" role="presentation">
              <button
                class="inline-block p-4 border-b-2 rounded-t-lg"
                id="profile-tab"
                data-tabs-target="#profile"
                type="button"
                role="tab"
                aria-controls="profile"
                aria-selected="false"
              >
                Default
              </button>
            </li>
            <li class="me-2" role="presentation">
              <button
                class="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                id="dashboard-tab"
                data-tabs-target="#dashboard"
                type="button"
                role="tab"
                aria-controls="dashboard"
                aria-selected="false"
              >
                Graphen
              </button>
            </li>
          </ul>
        </div>
        <div id="default-tab-content">
          <div
            class="hidden p-4 rounded-lg"
            id="profile"
            role="tabpanel"
            aria-labelledby="profile-tab"
          >
            <AddDefaultCard @card-selected="handleCardSelected" />
          </div>
          <div
            class="hidden p-4 rounded-lg"
            id="dashboard"
            role="tabpanel"
            aria-labelledby="dashboard-tab"
          >
            <AddGraphCard @graph-added="handleGraphSelected"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
