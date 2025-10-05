<script setup lang="ts">
import { useGraphStore } from '@/composables/dashboard/useGraphStore'
import ApexCharts from 'apexcharts'
import { onMounted, ref, onUnmounted } from 'vue'

const props = defineProps<{
  graph_id: number | undefined
}>()

// Template ref für das Chart-Element
const chartRef = ref<HTMLDivElement | null>(null)
let chart: ApexCharts | null = null

const options = {
  colors: ['#1A56DB'],
  series: [] as unknown[],
  chart: {
    type: 'bar',
    height: '100%',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '70%',
      borderRadiusApplication: 'end',
      borderRadius: 8,
    },
  },
  tooltip: {
    enabled: false,
  },
  states: {
    hover: {
      filter: {
        type: 'darken',
        value: 1,
      },
    },
  },
  stroke: {
    show: true,
    width: 0,
    colors: ['transparent'],
  },
  grid: {
    show: true,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: -14,
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  xaxis: {
    floating: false,
    labels: {
      show: true,
      style: {
        fontFamily: 'Inter, sans-serif',
        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400',
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
  fill: {
    opacity: 1,
  },
}

const { getDataForGraph } = useGraphStore()

onMounted(() => {
  // Verwende die Template Ref anstatt getElementById
  if (chartRef.value && typeof ApexCharts !== 'undefined') {
    if (props.graph_id !== undefined) {
      // Graph Id gefüllt -> Daten müssen geholt werden
      getDataForGraph(props.graph_id).then((res) => {
        options.series.push({
          name: 'Data',
          color: '#FDBA8C',
          data: res.map((dat) => {
            return { x: dat.x_comp, y: dat.y_comp }
          }),
        })

        options.tooltip.enabled = true;

        chart = new ApexCharts(chartRef.value, options)
        chart.render()
      })
    } else {
      // Beispieldaten
      options.series.push({
        name: 'Social media',
        color: '#FDBA8C',
        data: [
          { x: 'Mon', y: 232 },
          { x: 'Tue', y: 113 },
          { x: 'Wed', y: 341 },
          { x: 'Thu', y: 224 },
          { x: 'Fri', y: 522 },
          { x: 'Sat', y: 411 },
          { x: 'Sun', y: 243 },
        ],
      })

      chart = new ApexCharts(chartRef.value, options)
      chart.render()
    }
  }
})

// Cleanup beim Unmount
onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<template>
  <div class="block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
    <div class="flex justify-between">
      <div>
        <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
          Säulendiagramm
        </h5>
      </div>
    </div>
    <!-- Template ref anstatt ID -->
    <div ref="chartRef"></div>
  </div>
</template>
