<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Reporte de Ventas por Tipo (Servicio/Producto)
    </h1>

    <div v-if="store.isLoading" class="text-center text-gray-500">
      Generando reporte...
    </div>
    <div
      v-if="store.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ store.error }}
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
          store.servicesProductsSales.length > 0 ||
          (compareEnabled && store.servicesProductsSalesComparison.length > 0)
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

        <!-- Tabla de Datos -->
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
                  Monto Total (Período Actual)
                </th>
                <th
                  v-if="compareEnabled"
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Monto Total (Período Comparación)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in combinedSalesData" :key="item.type">
                <td class="px-4 py-2">
                  {{ item.type === 'service' ? 'Servicios' : 'Productos' }}
                </td>
                <td class="px-4 py-2 text-right">
                  S/ {{ item.currentPeriodAmount.toFixed(2) }}
                </td>
                <td v-if="compareEnabled" class="px-4 py-2 text-right">
                  S/ {{ item.comparisonPeriodAmount.toFixed(2) }}
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
  const types = ['service', 'product'];

  types.forEach((type) => {
    const current = store.servicesProductsSales.find(
      (item) => item.type === type,
    );
    const comparison = store.servicesProductsSalesComparison.find(
      (item) => item.type === type,
    );

    data.push({
      type: type,
      currentPeriodAmount: current
        ? parseFloat(current.total_sales_by_type)
        : 0,
      comparisonPeriodAmount: comparison
        ? parseFloat(comparison.total_sales_by_type)
        : 0,
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

  let comparisonFilters = null;
  if (compareEnabled.value) {
    if (!compareStartDate.value || !compareEndDate.value) {
      alert(
        'Por favor, selecciona un rango de fechas para el período de comparación.',
      );
      return;
    }
    comparisonFilters = {
      startDate: compareStartDate.value,
      endDate: compareEndDate.value,
    };
  }
  await store.fetchServicesProductsSales(
    startDate.value,
    endDate.value,
    comparisonFilters,
  );
}

function updateChartData() {
  if (compareEnabled.value) {
    // Gráfico de barras para comparación
    const categories = combinedSalesData.value.map((item) =>
      item.type === 'service' ? 'Servicios' : 'Productos',
    );
    series.value = [
      {
        name: 'Período Actual',
        data: combinedSalesData.value.map((item) => item.currentPeriodAmount),
      },
      {
        name: 'Período Comparación',
        data: combinedSalesData.value.map(
          (item) => item.comparisonPeriodAmount,
        ),
      },
    ];
    chartOptions.value = {
      chart: {
        type: 'bar',
        height: 350,
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
          text: 'Tipo de Venta',
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
    if (store.servicesProductsSales.length > 0) {
      series.value = store.servicesProductsSales.map((item) =>
        parseFloat(item.total_sales_by_type.toFixed(2)),
      );
      chartOptions.value = {
        chart: {
          type: 'pie',
        },
        labels: store.servicesProductsSales.map((item) =>
          item.type === 'service' ? 'Servicios' : 'Productos',
        ),
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
    store.servicesProductsSales.length === 0 &&
    (!compareEnabled.value ||
      store.servicesProductsSalesComparison.length === 0)
  ) {
    alert('No hay datos para exportar.');
    return;
  }

  let headers = ['Tipo', 'Monto Total (Período Actual)'];
  if (compareEnabled.value) {
    headers.push('Monto Total (Período Comparación)');
  }

  const rows = combinedSalesData.value.map((item) => {
    const row = [
      item.type === 'service' ? 'Servicios' : 'Productos',
      item.currentPeriodAmount.toFixed(2),
    ];
    if (compareEnabled.value) {
      row.push(item.comparisonPeriodAmount.toFixed(2));
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

// Observar cambios en store.servicesProductsSales y servicesProductsSalesComparison para actualizar el gráfico
watch(
  () => [
    store.servicesProductsSales,
    store.servicesProductsSalesComparison,
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

<style scoped>
/* Add any specific styles for this component here */
</style>
