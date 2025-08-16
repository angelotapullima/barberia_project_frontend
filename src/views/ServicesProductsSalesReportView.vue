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
                  Monto (Período Actual)
                </th>
                <th
                  v-if="compareEnabled"
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Monto (Período Comparación)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in tableData" :key="item.type">
                <td class="px-4 py-2">{{ item.type }}</td>
                <td class="px-4 py-2 text-right">
                  S/ {{ item.currentAmount.toFixed(2) }}
                </td>
                <td v-if="compareEnabled" class="px-4 py-2 text-right">
                  S/ {{ item.comparisonAmount.toFixed(2) }}
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
import { storeToRefs } from 'pinia';
import { useReportStore } from '@/stores/reportStore';
import VueApexCharts from 'vue3-apexcharts';

const store = useReportStore();
const {
  servicesProductsSales,
  servicesProductsSalesComparison,
  isLoading,
  error,
} = storeToRefs(store);

const startDate = ref('');
const endDate = ref('');
const compareEnabled = ref(false);
const compareStartDate = ref('');
const compareEndDate = ref('');

const series = ref([]);
const chartOptions = ref({
  chart: {
    type: 'pie',
    width: 400,
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

const tableData = computed(() => {
  const currentServiceTotal = servicesProductsSales.value.reduce(
    (sum, item) => sum + parseFloat(item.service_total),
    0,
  );
  const currentProductTotal = servicesProductsSales.value.reduce(
    (sum, item) => sum + parseFloat(item.product_total),
    0,
  );

  const comparisonServiceTotal = servicesProductsSalesComparison.value.reduce(
    (sum, item) => sum + parseFloat(item.service_total),
    0,
  );
  const comparisonProductTotal = servicesProductsSalesComparison.value.reduce(
    (sum, item) => sum + parseFloat(item.product_total),
    0,
  );

  return [
    {
      type: 'Servicios',
      currentAmount: currentServiceTotal,
      comparisonAmount: comparisonServiceTotal,
    },
    {
      type: 'Productos',
      currentAmount: currentProductTotal,
      comparisonAmount: comparisonProductTotal,
    },
  ];
});

function setDefaultDates() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  startDate.value = thirtyDaysAgo.toISOString().slice(0, 10);
  endDate.value = today.toISOString().slice(0, 10);

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
    const categories = tableData.value.map((item) => item.type);
    series.value = [
      {
        name: 'Período Actual',
        data: tableData.value.map((item) => item.currentAmount),
      },
      {
        name: 'Período Comparación',
        data: tableData.value.map((item) => item.comparisonAmount),
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
          text: 'Tipo',
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
    const [service, product] = tableData.value;
    if (service.currentAmount > 0 || product.currentAmount > 0) {
      series.value = [service.currentAmount, product.currentAmount];
      chartOptions.value = {
        chart: {
          type: 'pie',
          width: 400,
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
          width: 400,
        },
        labels: [],
      };
    }
  }
}

function exportToCsv() {
  if (tableData.value.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  let headers = ['Tipo', 'Monto (Período Actual)'];
  if (compareEnabled.value) {
    headers.push('Monto (Período Comparación)');
  }

  const rows = tableData.value.map((item) => {
    const row = [item.type, item.currentAmount.toFixed(2)];
    if (compareEnabled.value) {
      row.push(item.comparisonAmount.toFixed(2));
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
