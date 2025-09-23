<script setup lang="ts">
import { ref } from 'vue'
import CardGraphLine from '../CardGraphLine.vue'
import CardGraphColumn from '../CardGraphColumn.vue'
import CardGraphBar from '../CardGraphBar.vue'
import CardGraphPie from '../CardGraphPie.vue'
import { Info } from 'lucide-vue-next'
import { useGraphStore, graphs } from '@/composables/dashboard/useGraphStore'
import type { Graph } from '@/models/graph'

const { createGraph } = useGraphStore()

let selectedGraphType: string

const fileInputRef = ref<HTMLInputElement | null>(null)

// Event definieren
const emit = defineEmits<{
  graphAdded: [graph: Graph]
}>()

// Funktion für Graph-Auswahl
const selectGraph = (type: string) => {
  selectedGraphType = type
  // File-Chooser öffnen
  fileInputRef.value?.click()
}

// CSV-Datei verarbeiten
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file && file.type === 'text/csv') {
    console.log('Ausgewählte CSV-Datei:', file.name)
    console.log('Graph-Typ:', selectedGraphType)

    try {
      // Warten auf das Promise und die graphId erhalten
      const graphId = await createGraph(file, selectedGraphType)

      console.log('graphs', graphs.value)

      // Event emittieren mit der erhaltenen graphId
      emit('graphAdded', graphId)
    } catch (error) {
      console.error('Fehler beim Erstellen des Graphen:', error)
      alert('Fehler beim Erstellen des Graphen. Bitte versuchen Sie es erneut.')
    }
  } else {
    alert('Bitte wählen Sie eine gültige CSV-Datei aus.')
  }

  // Input zurücksetzen für erneute Auswahl
  target.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Versteckter File Input -->
    <input ref="fileInputRef" type="file" accept=".csv" @change="handleFileSelect" class="hidden" />

    <!-- Info Banner -->
    <div
      class="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800"
    >
      <div class="flex items-start space-x-3">
        <Info class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div class="text-sm">
          <h3 class="font-medium text-blue-900 dark:text-blue-100 mb-1">Grafik erstellen</h3>
          <p class="text-blue-700 dark:text-blue-300">
            <span class="font-medium">1.</span> Wählen Sie einen Grafiktypen aus den Optionen unten
            aus<br />
            <span class="font-medium">2.</span> Laden Sie eine CSV-Datei mit X- und Y-Daten hoch
          </p>
        </div>
      </div>
    </div>

    <!-- Graph Grid -->
    <div class="grid grid-cols-2 place-items-center gap-y-4">
      <div class="h-80 cursor-pointer" @click="selectGraph('line')">
        <CardGraphLine :graph_id="undefined"/>
      </div>
      <div class="h-80 cursor-pointer" @click="selectGraph('column')">
        <CardGraphColumn :graph_id="undefined" />
      </div>
      <div class="h-80 cursor-pointer" @click="selectGraph('bar')">
        <CardGraphBar />
      </div>
      <div class="h-80 cursor-pointer" @click="selectGraph('pie')">
        <CardGraphPie />
      </div>
    </div>
  </div>
</template>
