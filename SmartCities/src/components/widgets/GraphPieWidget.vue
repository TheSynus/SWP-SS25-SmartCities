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
  series: [] as number[],
  chart: {
    height: '100%',
    width: '100%',
    type: 'pie',
  },
  stroke: {
    show: false,
    lineCap: '',
  },
  plotOptions: {
    pie: {
      labels: {
        show: true,
      },
      size: '100%',
      dataLabels: {
        offset: -25,
      },
    },
  },
  labels: [] as string[],
  dataLabels: {
    enabled: false,
    style: {
      fontFamily: 'Inter, sans-serif',
    },
  },
  legend: {
    position: 'bottom',
    fontFamily: 'Inter, sans-serif',
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  xaxis: {
    labels: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
}

const { getDataForGraph } = useGraphStore()

onMounted(() => {
  if (chartRef.value && typeof ApexCharts !== 'undefined') {
    if (props.graph_id !== undefined) {
      getDataForGraph(props.graph_id).then((res) => {
        options.series = res.map((dat) => +dat.y_comp)

        options.labels = res.map((dat) => dat.x_comp)

        chart = new ApexCharts(chartRef.value, options)
        chart.render()
      })
    } else {
      options.series = [52.8, 26.8, 20.4]

      options.labels = ['Direct', 'Organic search', 'Referrals']

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
