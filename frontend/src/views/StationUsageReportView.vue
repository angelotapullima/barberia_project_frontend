<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Reporte de Utilización de Estaciones</h1>

    <div v-if="store.isLoading" class="text-center text-gray-500">Generando reporte...</div>
    <div v-if="store.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ store.error }}
    </div>

    <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="startDateFilter" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Inicio</label>
          <input type="date" v-model="startDate" id="startDateFilter" class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div>
          <label for="endDateFilter" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Fin</label>
          <input type="date" v-model="endDate" id="endDateFilter" class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div class="flex items-end">
          <button @click="fetchReportData" class="w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Generar Reporte
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Utilización de Estaciones</h2>
      
      <div v-if="store.stationUsage.length > 0" class="mt-6">
        <!-- Botón de Exportar -->
        <div class="flex justify-end mb-4">
          <button @click="exportToCsv" class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
            Exportar a CSV
          </button>
        </div>

        <!-- Gráfico de Barras -->
        <apexchart type="bar" :options="chartOptions" :series="series"></apexchart>

        <!-- Tabla de Datos -->
        <div class="overflow-x-auto mt-8">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estación</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Nº de Usos</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in store.stationUsage" :key="item.station_name">
                <td class="px-4 py-2">{{ item.station_name }}</td>
                <td class="px-4 py-2 text-right">{{ item.usage_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="mt-6 text-gray-500">No se encontraron datos de utilización de estaciones para el rango de fechas seleccionado.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import VueApexCharts from 'vue3-apexcharts';

const store = useReportStore();

const startDate = ref('');
const endDate = ref('');

const series = ref([]);
const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      endingShape: 'rounded'
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: [],
    title: {
      text: 'Estación'
    }
  },
  yaxis: {
    title: {
      text: 'Número de Usos'
    }
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + " usos"
      }
    }
  }
});

function setDefaultDates() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  startDate.value = thirtyDaysAgo.toISOString().slice(0, 10);
  endDate.value = today.toISOString().slice(0, 10);
}

async function fetchReportData() {
  if (!startDate.value || !endDate.value) {
    alert('Por favor, selecciona un rango de fechas.');
    return;
  }
  await store.fetchStationUsage(startDate.value, endDate.value);
}

function updateChartData() {
  if (store.stationUsage.length > 0) {
    series.value = [{
      name: 'Número de Usos',
      data: store.stationUsage.map(item => item.usage_count)
    }];
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        categories: store.stationUsage.map(item => item.station_name)
      }
    };
  } else {
    series.value = [];
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        categories: []
      }
    };
  }
}

function exportToCsv() {
  if (store.stationUsage.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const headers = ['Estación', 'Nº de Usos'];
  const rows = store.stationUsage.map(item => [
    item.station_name,
    item.usage_count
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'reporte_uso_estaciones.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Observar cambios en store.stationUsage para actualizar el gráfico
watch(() => store.stationUsage, () => {
  updateChartData();
}, { deep: true });

onMounted(() => {
  setDefaultDates();
  fetchReportData();
});
</script>

<style scoped>
/* Add any specific styles for this component here */
</style>