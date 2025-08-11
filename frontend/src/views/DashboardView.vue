<template>
  <div class="bg-gray-50 min-h-full">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p class="text-gray-500">Un resumen de la actividad de tu barbería.</p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Card 1: Ventas Hoy -->
      <div class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
        <div class="bg-blue-100 p-3 rounded-xl">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0 0c-1.657 0-3-.895-3-2s1.343-2 3-2 3-.895 3-2-1.343-2-3-2m0 8c-1.11 0-2.08-.402-2.599-1"></path></svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ventas de Hoy</p>
          <p class="text-2xl font-bold text-gray-800">S/ {{ (salesToday || 0).toFixed(2) }}</p>
        </div>
      </div>

      <!-- Card 2: Reservas Hoy -->
      <div class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
        <div class="bg-green-100 p-3 rounded-xl">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Reservas para Hoy</p>
          <p class="text-2xl font-bold text-gray-800">{{ upcomingReservations.length }}</p>
        </div>
      </div>

      <!-- Card 3: Clientes Atendidos -->
      <div class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
        <div class="bg-yellow-100 p-3 rounded-xl">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-1a6 6 0 00-5-5.91M8 20h4M8 16a4 4 0 10-4-4 4 4 0 004 4z"></path></svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Clientes Atendidos (Hoy)</p>
          <p class="text-2xl font-bold text-gray-800">{{ completedReservationsToday }}</p>
        </div>
      </div>

      <!-- Card 4: Ingresos del Mes -->
      <div class="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4">
        <div class="bg-purple-100 p-3 rounded-xl">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
        </div>
        <div>
          <p class="text-sm text-gray-500">Ingresos del Mes</p>
          <p class="text-2xl font-bold text-gray-800">S/ {{ (salesMonth || 0).toFixed(2) }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Weekly Sales Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Ventas de la Última Semana</h3>
          <apexchart type="area" height="350" :options="salesChartOptions" :series="salesChartSeries"></apexchart>
        </div>

        <!-- Barber Payouts -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Pagos a Barberos (Mes Actual)</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Barbero</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Generado</th>
                  <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pago Calculado</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="stat in barberPayouts" :key="stat.barber_id">
                  <td class="px-4 py-2 whitespace-nowrap">{{ stat.barber_name }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-right">S/ {{ (stat.total_generated || 0).toFixed(2) }}</td>
                  <td class="px-4 py-2 whitespace-nowrap text-right font-bold text-green-600">S/ {{ (stat.payment || 0).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-8">
        <!-- Barber Ranking -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Ranking de Barberos (Semana)</h3>
           <ul class="space-y-4">
            <li v-for="(barber, index) in barberRanking" :key="barber.barber_id" class="flex items-center">
              <span class="text-lg font-bold text-gray-400 w-6">{{ index + 1 }}</span>
              <div class="ml-3">
                <p class="font-semibold text-gray-700">{{ barber.barber_name }}</p>
                <p class="text-sm text-green-500">S/ {{ (barber.total_sales || 0).toFixed(2) }}</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Top Services Chart -->
        <div class="bg-white p-6 rounded-2xl shadow-md">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Servicios Populares (Semana)</h3>
          <apexchart type="donut" height="300" :options="topServicesChartOptions" :series="topServicesSeries"></apexchart>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useSalesStore } from '@/stores/salesStore';
import { useReservationStore } from '@/stores/reservationStore';
import { useReportStore } from '@/stores/reportStore';
import VueApexCharts from 'vue3-apexcharts';

const salesStore = useSalesStore();
const reservationStore = useReservationStore();
const reportStore = useReportStore();

// Data refs
const salesToday = ref(0);
const salesMonth = ref(0);
const upcomingReservations = ref([]);
const completedReservationsToday = ref(0);
const weeklySales = ref([]);
const barberRanking = ref([]);
const topServices = ref([]);
const barberPayouts = ref([]);

// Chart definitions
const salesChartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 350,
    toolbar: { show: false },
    zoom: { enabled: false }
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
      stops: [0, 90, 100]
    }
  },
  xaxis: {
    type: 'datetime',
    categories: weeklySales.value.map(d => d.date),
    labels: {
      format: 'dd MMM',
      style: { colors: '#6B7280' }
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: '#6B7280' },
      formatter: (val) => `S/ ${val.toFixed(0)}`
    }
  },
  tooltip: {
    x: { format: 'dd MMMM yyyy' },
    y: { formatter: (val) => `S/ ${val.toFixed(2)}` }
  },
  grid: {
    borderColor: '#f1f1f1',
    strokeDashArray: 4
  }
}));

const salesChartSeries = computed(() => [{
  name: 'Ventas',
  data: weeklySales.value.map(d => d.total)
}]);

const topServicesChartOptions = computed(() => ({
  chart: { type: 'donut', height: 300 },
  labels: topServices.value.map(s => s.service_name),
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: false },
  tooltip: {
    y: { formatter: (val) => `S/ ${val.toFixed(2)}` }
  },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            formatter: (w) => `S/ ${w.globals.seriesTotals.reduce((a, b) => a + b, 0).toFixed(2)}`
          }
        }
      }
    }
  }
}));

const topServicesSeries = computed(() => topServices.value.map(s => s.total_sales));

// Fetching logic
async function fetchData() {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayOfMonthStr = firstDayOfMonth.toISOString().slice(0, 10);

  // --- Parallel fetching ---
  const [
    salesTodayData,
    salesMonthData,
    reservationsTodayData,
    weeklySalesData,
    barberRankingData,
    topServicesData,
    reportData
  ] = await Promise.all([
    salesStore.getSalesSummaryByDateRange(todayStr, todayStr),
    salesStore.getSalesSummaryByDateRange(firstDayOfMonthStr, todayStr),
    reservationStore.fetchReservationsByDateRange(todayStr, todayStr),
    salesStore.getSalesSummaryByDateRange(sevenDaysAgoStr, todayStr),
    salesStore.getBarberSalesRanking(sevenDaysAgoStr, todayStr),
    salesStore.getSalesSummaryByService(sevenDaysAgoStr, todayStr),
    reportStore.fetchReport(today.getFullYear(), today.getMonth() + 1)
  ]);

  // --- Process data ---
  salesToday.value = salesTodayData[0]?.total || 0;
  salesMonth.value = salesMonthData.reduce((sum, day) => sum + day.total, 0);
  
  const now = new Date();
  upcomingReservations.value = reservationsTodayData
    .filter(res => new Date(res.start_time) >= now)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    
  completedReservationsToday.value = reservationsTodayData
    .filter(res => new Date(res.start_time) < now).length;

  weeklySales.value = weeklySalesData;
  barberRanking.value = barberRankingData;
  topServices.value = topServicesData.slice(0, 5); // Top 5 services
  barberPayouts.value = reportStore.stats;
}

onMounted(fetchData);
</script>