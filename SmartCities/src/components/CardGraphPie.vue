<script setup lang="ts">
import ApexCharts from 'apexcharts'
import { onMounted } from 'vue'

const options = {
  series: [52.8, 26.8, 20.4],
  colors: ['#1C64F2', '#16BDCA', '#9061F9'],
  chart: {
    height: "100%",
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
  labels: ['Direct', 'Organic search', 'Referrals'],
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
      show: false
    },
  },
  xaxis: {
    labels: {
      show: false
    },
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
}

onMounted(() => {
  const chartElement = document.getElementById('pie-chart')
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
          Kreisdiagramm
        </h5>
      </div>
    </div>
    <div id="pie-chart"></div>
  </div>
</template>
