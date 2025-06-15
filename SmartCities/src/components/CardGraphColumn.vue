<script setup lang="ts">
import ApexCharts from 'apexcharts'
import { onMounted, ref, onUnmounted } from 'vue'

// Template ref für das Chart-Element
const chartRef = ref<HTMLDivElement | null>(null)
let chart: ApexCharts | null = null

const options = {
  colors: ["#1A56DB"],
  series: [
    {
      name: "Social media",
      color: "#FDBA8C",
      data: [
        { x: "Mon", y: 232 },
        { x: "Tue", y: 113 },
        { x: "Wed", y: 341 },
        { x: "Thu", y: 224 },
        { x: "Fri", y: 522 },
        { x: "Sat", y: 411 },
        { x: "Sun", y: 243 },
      ],
    },
  ],
  chart: {
    type: "bar",
    height: "100%",
    fontFamily: "Inter, sans-serif",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "70%",
      borderRadiusApplication: "end",
      borderRadius: 8,
    },
  },
  tooltip: {
    enabled: false
  },
  states: {
    hover: {
      filter: {
        type: "darken",
        value: 1,
      },
    },
  },
  stroke: {
    show: true,
    width: 0,
    colors: ["transparent"],
  },
  grid: {
    show: true,
    strokeDashArray: 4,
    padding: {
      left: 2,
      right: 2,
      top: -14
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
        fontFamily: "Inter, sans-serif",
        cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
      }
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

onMounted(() => {
  // Verwende die Template Ref anstatt getElementById
  if (chartRef.value && typeof ApexCharts !== 'undefined') {
    chart = new ApexCharts(chartRef.value, options)
    chart.render()
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
  <div class="max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-4 md:p-6">
    <div class="flex justify-between">
      <div>
        <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Säulendiagramm</h5>
      </div>
    </div>
    <!-- Template ref anstatt ID -->
    <div ref="chartRef"></div>
  </div>
</template>
