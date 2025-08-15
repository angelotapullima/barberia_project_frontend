<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Reporte de Ventas por Tipo (Servicio/Producto)
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

        <div class="md:col-span-2 flex items-center mt-2">
          <input
            type="checkbox"
            id="compareEnabled"
            v-model="compareEnabled"
            class="mr-2"
          />
          <label
            for="compareEnabled"
            class="text-sm font-semibold text-gray-700"
            >Comparar con otro período</label
          >
        </div>

        <template v-if="compareEnabled">
          <div>
            <label
              for="compareStartDateFilter"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Fecha Inicio Comparación</label
            >
            <input
              type="date"
              v-model="compareStartDate"
              id="compareStartDateFilter"
              class="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              for="compareEndDateFilter"
              class="block text-sm font-semibold text-gray-700 mb-1"
              >Fecha Fin Comparación</label
            >
            <input
              type="date"
              v-model="compareEndDate"
              id="compareEndDateFilter"
              class="block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </template>

        <div class="flex items-end md:col-span-2">
          <button
            @click="fetchServicesProductsSalesData"
            class="w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Generar Reporte
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        Resumen de Ventas por Tipo
      </h2>

      <div
        v-if="
          servicesProductsSales.length > 0 ||
          (compareEnabled && servicesProductsSalesComparison.length > 0)
        "
        class="mt-6"
      >
        <!-- Botón de Exportar -->
        <div class="flex justify-end mb-4">
          <button
            @click="exportToCsv"
            class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Exportar a CSV
          </button>
        </div>

        <!-- Gráfico de Pastel/Barras para Comparación -->
        <apexchart
          :type="compareEnabled ? 'bar' : 'pie'"
          :options="chartOptions"
          :series="series"
        ></apexchart>

        <!--Tabla de Datos -->
        <div class="overflow-x-auto mt-8">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Tipo
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Monto Servicios (Período Actual)
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Monto Productos (Período Actual)
                </th>
                <th
                  v-if="compareEnabled"
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Monto Servicios (Período Comparación)
                </th>
                <th
                  v-if="compareEnabled"
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Monto Productos (Período Comparación)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in combinedSalesData" :key="item.date">
                <td class="px-4 py-2">{{ item.date }}</td>
                <td class="px-4 py-2 text-right">
                  S/ {{ item.currentServiceAmount.toFixed(2) }}
                </td>
                <td class="px-4 py-2 text-right">
                  S/ {{ item.currentProductAmount.toFixed(2) }}
                </td>
                <td v-if="compareEnabled" class="px-4 py-2 text-right">
                  S/ {{ item.comparisonServiceAmount.toFixed(2) }}
                </td>
                <td v-if="compareEnabled" class="px-4 py-2 text-right">
                  S/ {{ item.comparisonProductAmount.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="mt-6 text-gray-500">
        No se encontraron ventas por tipo para el rango de fechas seleccionado.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import VueApexCharts from 'vue3-apexcharts';

const store = useReportStore();

const startDate = ref('');
const endDate = ref('');
const compareEnabled = ref(false);
const compareStartDate = ref('');
const compareEndDate = ref('');

const servicesProductsSales = ref([]);
const servicesProductsSalesComparison = ref([]);
const isLoading = ref(false);
const error = ref(null);

const series = ref([]);
const chartOptions = ref({
  chart: {
    type: 'pie',
  },
  labels: [],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
});

// Computed property para combinar los datos de ambos períodos para la tabla
const combinedSalesData = computed(() => {
  const data = [];
  const dates = new Set();

  servicesProductsSales.value.forEach(item => dates.add(item.date));
  servicesProductsSalesComparison.value.forEach(item => dates.add(item.date));

  Array.from(dates).sort().forEach(date => {
    const current = servicesProductsSales.value.find(item => item.date === date);
    const comparison = servicesProductsSalesComparison.value.find(item => item.date === date);

    data.push({
      date: date,
      currentServiceAmount: current ? parseFloat(current.service_total) : 0,
      currentProductAmount: current ? parseFloat(current.product_total) : 0,
      comparisonServiceAmount: comparison ? parseFloat(comparison.service_total) : 0,
      comparisonProductAmount: comparison ? parseFloat(comparison.product_total) : 0,
    });
  });
  return data;
});

function setDefaultDates() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  startDate.value = thirtyDaysAgo.toISOString().slice(0, 10);
  endDate.value = today.toISOString().slice(0, 10);

  // Set default for comparison period (e.g., previous 30 days)
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(today.getDate() - 60);
  compareStartDate.value = sixtyDaysAgo.toISOString().slice(0, 10);
  compareEndDate.value = thirtyDaysAgo.toISOString().slice(0, 10);
}

async function fetchServicesProductsSalesData() {
  if (!startDate.value || !endDate.value) {
    alert('Por favor, selecciona un rango de fechas para el período actual.');
    return;
  }

  isLoading.value = true;
  error.value = null;
  try {
    const currentPeriodPromise = reportStore.fetchServicesProductsSales(
      startDate.value,
      endDate.value,
    );

    let comparisonPeriodPromise = Promise.resolve([]);
    if (compareEnabled.value) {
      if (!compareStartDate.value || !compareEndDate.value) {
        alert(
          'Por favor, selecciona un rango de fechas para el período de comparación.',
        );
        isLoading.value = false;
        return;
      }
      comparisonPeriodPromise = reportStore.fetchServicesProductsSales(
        compareStartDate.value,
        compareEndDate.value,
      );
    }

    const [currentResponse, comparisonResponse] = await Promise.all([
      currentPeriodPromise,
      comparisonPeriodPromise,
    ]);

    servicesProductsSales.value = currentResponse;
    servicesProductsSalesComparison.value = comparisonResponse;

    updateChartData();
  } catch (err) {
    error.value = err.message || 'Error al cargar el reporte de servicios vs productos.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}

function updateChartData() {
  if (compareEnabled.value) {
    // Gráfico de barras para comparación
    const categories = combinedSalesData.value.map((item) => item.date);
    series.value = [
      {
        name: 'Servicios (Período Actual)',
        data: combinedSalesData.value.map((item) => item.currentServiceAmount),
      },
      {
        name: 'Productos (Período Actual)',
        data: combinedSalesData.value.map((item) => item.currentProductAmount),
      },
      {
        name: 'Servicios (Período Comparación)',
        data: combinedSalesData.value.map((item) => item.comparisonServiceAmount),
      },
      {
        name: 'Productos (Período Comparación)',
        data: combinedSalesData.value.map((item) => item.comparisonProductAmount),
      },
    ];
    chartOptions.value = {
      chart: {
        type: 'bar',
        height: 350,
        stacked: true, // Stacked bars for service/product within each period
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: categories,
        title: {
          text: 'Fecha',
        },
      },
      yaxis: {
        title: {
          text: 'Monto Total (S/)',
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return 'S/ ' + val.toFixed(2);
          },
        },
      },
    };
  } else {
    // Gráfico de pastel normal
    const totalServiceSales = servicesProductsSales.value.reduce((sum, item) => sum + parseFloat(item.service_total), 0);
    const totalProductSales = servicesProductsSales.value.reduce((sum, item) => sum + parseFloat(item.product_total), 0);

    if (totalServiceSales > 0 || totalProductSales > 0) {
      series.value = [totalServiceSales, totalProductSales];
      chartOptions.value = {
        chart: {
          type: 'pie',
        },
        labels: ['Servicios', 'Productos'],
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
      };
    } else {
      series.value = [];
      chartOptions.value = {
        chart: {
          type: 'pie',
        },
        labels: [],
      };
    }
  }
}

function exportToCsv() {
  if (
    servicesProductsSales.value.length === 0 &&
    (!compareEnabled.value ||
      servicesProductsSalesComparison.value.length === 0)
  ) {
    alert('No hay datos para exportar.');
    return;
  }

  let headers = ['Fecha', 'Monto Servicios (Período Actual)', 'Monto Productos (Período Actual)'];
  if (compareEnabled.value) {
    headers.push('Monto Servicios (Período Comparación)', 'Monto Productos (Período Comparación)');
  }

  const rows = combinedSalesData.value.map((item) => {
    const row = [
      item.date,
      item.currentServiceAmount.toFixed(2),
      item.currentProductAmount.toFixed(2),
    ];
    if (compareEnabled.value) {
      row.push(item.comparisonServiceAmount.toFixed(2), item.comparisonProductAmount.toFixed(2));
    }
    return row;
  });

  let csvContent = headers.join(',') + '\n';
  rows.forEach((row) => {
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'reporte_ventas_por_tipo.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Observar cambios en servicesProductsSales y servicesProductsSalesComparison para actualizar el gráfico
watch(
  () => [
    servicesProductsSales.value,
    servicesProductsSalesComparison.value,
    compareEnabled.value,
  ],
  () => {
    updateChartData();
  },
  { deep: true },
);

onMounted(() => {
  setDefaultDates();
  fetchServicesProductsSalesData();
});
</script>