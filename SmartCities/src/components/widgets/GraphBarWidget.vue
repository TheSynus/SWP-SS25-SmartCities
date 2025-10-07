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
  series: [] as unknown[],
  chart: {
    sparkline: {
      enabled: false,
    },
    type: 'bar',
    width: '100%',
    height: '100%',
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      columnWidth: '100%',
      borderRadiusApplication: 'end',
      borderRadius: 6,
      dataLabels: {
        position: 'top',
      },
    },
  },
  legend: {
    show: true,
    position: 'bottom',
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  xaxis: {
    labels: {
      show: true,
      style: {
        fontFamily: 'Inter, sans-serif',
        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400',
      },
    },
    categories: [] as string[],
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: true,
      style: {
        fontFamily: 'Inter, sans-serif',
        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400',
      },
    },
  },
  grid: {
    show: true,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: -20,
    },
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
          data: res.map((dat) => dat.x_comp),
        })

        options.xaxis.categories = res.map((dat) => dat.y_comp)

        options.tooltip.enabled = true

        chart = new ApexCharts(chartRef.value, options)
        chart.render()
      })
    } else {
      options.series.push({
        name: 'Income',
        color: '#31C48D',
        data: ['1420', '1620', '1820', '1420', '1650', '2120'],
      })

      options.xaxis.categories = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
