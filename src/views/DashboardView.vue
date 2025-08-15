<template>
  <div class="bg-gray-50 min-h-full">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-500">Un resumen de la actividad de tu barbería.</p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Card 1: Ventas de Productos (Hoy) -->
      <div
        class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4"
      >
        <div class="bg-blue-100 p-3 rounded-xl">
          <svg
            class="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.657 0-3-.895-3-2s1.343-2 3-2 3-.895 3-2-1.343 2-3 2m0 8c-1.11 0-2.08-.402-2.599-1"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ventas de Productos (Hoy)</p>
          <p class="text-2xl font-bold text-gray-800">
            S/ {{ (productSalesToday || 0).toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- Card 2: Ventas de Servicios (Hoy) -->
      <div
        class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4"
      >
        <div class="bg-green-100 p-3 rounded-xl">
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.657 0-3-.895-3-2s1.343-2 3-2 3-.895 3-2-1.343 2-3 2m0 8c-1.11 0-2.08-.402-2.599-1"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ventas de Servicios (Hoy)</p>
          <p class="text-2xl font-bold text-gray-800">
            S/ {{ (serviceSalesToday || 0).toFixed(2) }}
          </p>
        </div>
      </div>

      <!-- Card 2: Reservas Hoy -->
      <div
        class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4"
      >
        <div class="bg-green-100 p-3 rounded-xl">
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Reservas para Hoy</p>
          <p class="text-2xl font-bold text-gray-800">
            {{ upcomingReservations }}
          </p>
        </div>
      </div>

      <!-- Card 3: Clientes Atendidos -->
      <div
        class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4"
      >
        <div class="bg-yellow-100 p-3 rounded-xl">
          <svg
            class="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-1a6 6 0 00-5-5.91M8 20h4M8 16a4 4 0 10-4-4 4 4 0 004 4z"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Clientes Atendidos (Hoy)</p>
          <p class="text-2xl font-bold text-gray-800">
            {{ completedReservationsToday }}
          </p>
        </div>
      </div>

      <!-- Card 4: Ingresos del Mes -->
      <div
        class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4"
      >
        <div class="bg-purple-100 p-3 rounded-xl">
          <svg
            class="w-6 h-6 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            ></path>
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            ></path>
          </svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ingresos del Mes</p>
          <p class="text-2xl font-bold text-gray-800">
            S/ {{ (salesMonth || 0).toFixed(2) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Product Sales Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <apexchart
            type="area"
            height="350"
            :options="productSalesChartOptions"
            :series="productSalesChartSeries"
          ></apexchart>
        </div>

        <!-- Service Sales Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <apexchart
            type="area"
            height="350"
            :options="serviceSalesChartOptions"
            :series="serviceSalesChartSeries"
          ></apexchart>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-8">
        <!-- Barber Payouts -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Pagos a Barberos (Mes Actual)
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Barbero
                  </th>
                  <th
                    class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                  >
                    Total Generado
                  </th>
                  <th
                    class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                  >
                    Pago Calculado
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="stat in barberPayouts" :key="stat.barber_id">
                  <td class="px-4 py-2">
                    {{ stat.barber_name }}
                  </td>
                  <td class="px-4 py-2 text-right">
                    S/ {{ (stat.total_services || 0).toFixed(2) }}
                  </td>
                  <td class="px-4 py-2 text-right font-bold text-green-600">
                    S/ {{ (stat.commission_payment || 0).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Top Services Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            Servicios Populares (Semana)
          </h3>
          <apexchart
            type="donut"
            height="300"
            :options="topServicesChartOptions"
            :series="topServicesSeries"
          ></apexchart>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api'; // Import the centralized Axios instance

// Data refs
const productSalesToday = ref(0);
const serviceSalesToday = ref(0);
const upcomingReservations = ref(0);
const completedReservationsToday = ref(0);
const salesMonth = ref(0);
const weeklyProductSales = ref([]);
const weeklyServiceSales = ref([]);
const topServices = ref([]);
const barberPayouts = ref([]);

// Chart definitions
const createSalesChartOptions = (title, categories) => ({
  chart: {
    type: 'area',
    height: 350,
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ['#3B82F6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    type: 'datetime',
    categories: categories,
    labels: {
      format: 'dd MMM',
      style: { colors: '#6B7280' },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#6B7280' },
      formatter: (val) => `S/ ${val.toFixed(0)}`,
    },
  },
  tooltip: {
    x: { format: 'dd MMMM yyyy' },
    y: { formatter: (val) => `S/ ${val.toFixed(2)}` },
  },
  grid: {
    borderColor: '#f1f1f1',
    strokeDashArray: 4,
  },
  title: {
    text: title,
    align: 'left',
    style: {
      fontSize: '16px',
      fontWeight: 'semibold',
      color: '#374151',
    },
  },
});

const productSalesChartOptions = computed(() =>
  createSalesChartOptions(
    'Ventas de Productos (Últimos 30 Días)',
    weeklyProductSales.value.map((d) => d.date),
  ),
);
const productSalesChartSeries = computed(() => [
  {
    name: 'Ventas de Productos',
    data: weeklyProductSales.value.map((d) => d.total_amount),
  },
]);

const serviceSalesChartOptions = computed(() =>
  createSalesChartOptions(
    'Ventas de Servicios (Últimos 30 Días)',
    weeklyServiceSales.value.map((d) => d.date),
  ),
);
const serviceSalesChartSeries = computed(() => [
  {
    name: 'Ventas de Servicios',
    data: weeklyServiceSales.value.map((d) => d.total_amount),
  },
]);

const topServicesChartOptions = computed(() => ({
  chart: { type: 'donut', height: 300 },
  labels: topServices.value.map((s) => s.service_name),
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: false },
  tooltip: {
    y: { formatter: (val) => `${val} ventas` },
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: (w) =>
              `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)} ventas`,
          },
        },
      },
    },
  },
}));

const topServicesSeries = computed(() =>
  topServices.value.map((s) => parseInt(s.total_sales_count)),
);

// Fetching logic
async function fetchData() {
  try {
    const response = await api.get('/dashboard/summary'); // Use 'api' instance and relative path
    const data = response.data;

    productSalesToday.value = data.productSalesToday || 0;
    serviceSalesToday.value = data.serviceSalesToday || 0;
    upcomingReservations.value = data.upcomingReservations || 0;
    completedReservationsToday.value = data.completedReservationsToday || 0;
    salesMonth.value = data.salesMonth || 0;
    weeklyProductSales.value = data.dailyProductSales || [];
    weeklyServiceSales.value = data.dailyServiceSales || [];
    topServices.value = data.popularServices || [];
    barberPayouts.value = data.barberPayouts || [];
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
}

onMounted(fetchData);
</script>