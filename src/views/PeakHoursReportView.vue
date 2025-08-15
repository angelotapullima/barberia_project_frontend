<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Reporte de Horas Pico de Reservas
    </h1>

    <div v-if="isLoading" class="text-center text-gray-500">
      Generando reporte...
    </div>
    <div
      v-if="error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ error }}
    </div>

    <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            for="startDateFilter"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Fecha Inicio</label
          >
          <input
            type="date"
            v-model="startDate"
            id="startDateFilter"
            class="block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            for="endDateFilter"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Fecha Fin</label
          >
          <input
            type="date"
            v-model="endDate"
            id="endDateFilter"
            class="block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="fetchReportData"
            class="w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Generar Reporte
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        Horas Pico de Reservas
      </h2>

      <div v-if="peakHours.length > 0" class="mt-6">
        <!-- Botón de Exportar -->
        <div class="flex justify-end mb-4">
          <button
            @click="exportToCsv"
            class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Exportar a CSV
          </button>
        </div>

        <apexchart
          type="bar"
          :options="peakHoursChartOptions"
          :series="peakHoursSeries"
        ></apexchart>
      </div>
      <div v-else class="mt-6 text-gray-500">
        No se encontraron datos de horas pico para el rango de fechas
        seleccionado.
      </div>
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

const peakHours = ref([]);
const isLoading = ref(false);
const error = ref(null);

const peakHoursSeries = ref([]);
const peakHoursChartOptions = ref({});

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

  isLoading.value = true;
  error.value = null;
  try {
    peakHours.value = await store.fetchPeakHours(startDate.value, endDate.value);
  } catch (err) {
    error.value = err.message || 'Error al cargar el reporte.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

function updatePeakHoursChart() {
  const peakHoursData = peakHours.value;
  peakHoursSeries.value = [
    {
      name: 'Cantidad de Reservas',
      data: peakHoursData.map((item) => item.reservation_count),
    },
  ];
  peakHoursChartOptions.value = {
    chart: { type: 'bar', height: 350 },
    plotOptions: { bar: { horizontal: false } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: peakHoursData.map((item) => item.hour),
      title: { text: 'Hora del Día' },
    },
    yaxis: {
      title: { text: 'Nº de Reservas' },
    },
  };
}

function exportToCsv() {
  if (peakHours.value.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const headers = ['Hora', 'Cantidad de Reservas'];
  const rows = peakHours.value.map((item) => [
    item.hour,
    item.reservation_count,
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach((row) => {
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'reporte_horas_pico.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Observar cambios en peakHours para actualizar el gráfico
watch(
  peakHours,
  () => {
    updatePeakHoursChart();
  },
  { deep: true },
);

onMounted(() => {
  setDefaultDates();
  fetchReportData();
});
</script>

<style scoped>
/* Add any specific styles for this component here */
</style>