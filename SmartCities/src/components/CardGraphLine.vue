<script setup lang="ts">
import ApexCharts from 'apexcharts'
import { onMounted } from 'vue'

const options = {
  chart: {
    height: '100%',
    maxWidth: '100%',
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
  series: [
    {
      name: 'New users',
      data: [6500, 6418, 6456, 6526, 6356, 6456],
      color: '#1A56DB',
    },
  ],
  xaxis: {
    categories: ['01', '02', '03', '04', '05', '06'],
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
        colors: '#FFFFFF'
      },
    },
  },
}

onMounted(() => {
  const chartElement = document.getElementById('area-chart')
  if (chartElement && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(chartElement, options)
    chart.render()
  }
})
</script>

<template>
  <div class="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
    <div class="flex justify-between">
      <div>
        <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">
          Liniendiagramm
        </h5>
      </div>
    </div>
    <div id="area-chart"></div>
  </div>
</template>
