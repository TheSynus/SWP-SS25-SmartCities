<script setup lang="ts">
import { useGraphStore } from '../../composables/dashboard/useGraphStore'
import ApexCharts from 'apexcharts'
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  graph_id: number | undefined
}>()

// Template ref für das Chart-Element
const chartRef = ref<HTMLDivElement | null>(null)
let chart: ApexCharts | null = null

const options = {
  chart: {
    height: '100%',
    width: '100%',
    type: 'area',
    fontFamily: 'Inter, sans-serif',
    dropShadow: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  tooltip: {
    enabled: false,
    x: {
      show: false,
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.55,
      opacityTo: 0,
      shade: '#1C64F2',
      gradientToColors: ['#1C64F2'],
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 6,
  },
  grid: {
    show: true,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: 0,
    },
  },
  series: [] as unknown[],
  xaxis: {
    categories: [] as unknown[],
    labels: {
      show: true,
      style: {
        colors: '#FFFFFF',
      },
    },
    axisBorder: {
      show: true,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    show: true,
    labels: {
      style: {
        colors: '#FFFFFF',
      },
    },
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
          name: 'New users',
          data: res.map((dat) => dat.y_comp),
          color: '#1A56DB',
        })

        options.xaxis.categories = res.map((dat) => dat.x_comp)

        options.tooltip.enabled = true

        chart = new ApexCharts(chartRef.value, options)
        chart.render()
      })
    } else {
      // Beispieldaten
      options.series.push({
        name: 'New users',
        data: [6500, 6418, 6456, 6526, 6356, 6456],
        color: '#1A56DB',
      })

      options.xaxis.categories = ['01', '02', '03', '04', '05', '06']

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
  <div ref="chartRef"></div>
</template>
