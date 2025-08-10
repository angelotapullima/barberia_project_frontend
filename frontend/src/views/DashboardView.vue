<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Dashboard y Reportes</h1>

    <div v-if="salesStore.isLoading" class="text-center text-gray-500">Generando reporte...</div>
    <div v-if="salesStore.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ salesStore.error }}
    </div>

    <!-- Main Content -->
    <div v-if="!salesStore.isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Row 1: Key Metrics -->
      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Ventas Totales Hoy</h2>
        <p class="text-4xl font-extrabold text-indigo-600">S/ {{ (salesToday || 0).toFixed(2) }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Pagos Totales a Barberos</h2>
        <p class="text-4xl font-extrabold text-green-600">
          S/ {{ (totalBarberPayments || 0).toFixed(2) }}
        </p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Total Reservas (7 Días)</h2>
        <p class="text-4xl font-extrabold text-blue-600">{{ totalReservations }}</p>
      </div>

      <!-- Inventory Metrics -->
      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Total Productos</h2>
        <p class="text-4xl font-extrabold text-purple-600">{{ inventorySummary.totalProducts }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Productos Bajo Stock</h2>
        <p class="text-4xl font-extrabold text-red-600">{{ inventorySummary.lowStockCount }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Valor Inventario</h2>
        <p class="text-4xl font-extrabold text-orange-600">S/ {{ (inventorySummary.totalInventoryValue || 0).toFixed(2) }}</p>
      </div>

      <!-- Row 2: Barber Ranking and Daily Sales Chart -->
      <div class="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Ranking de Barberos por Ventas</h2>
          <select v-model="barberRankingTimeRange" @change="fetchBarberRankingData(barberRankingTimeRange)"
            class="p-2 border rounded-md">
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Posición
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Barbero
              </th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Ventas Totales
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(barber, index) in barberRanking" :key="barber.barber_id">
              <td class="px-4 py-2">{{ index + 1 }}</td>
              <td class="px-4 py-2">{{ barber.barber_name }}</td>
              <td class="px-4 py-2 text-right">S/ {{ (barber.total_sales || 0).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reporte de Pagos a Barberos -->
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Reporte de Pagos a Barberos (Mes Actual)</h2>
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
              <tr v-for="stat in barberPayments" :key="stat.barber_id">
                <td class="px-4 py-2">{{ stat.barber_name }}</td>
                <td class="px-4 py-2 text-right">S/ {{ (stat.total_generated || 0).toFixed(2) }}</td>
                <td class="px-4 py-2 text-right font-bold">S/ {{ (stat.payment || 0).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Ventas Diarias</h2>
          <select v-model="dailySalesTimeRange" @change="fetchDailySalesData(dailySalesTimeRange)"
            class="p-2 border rounded-md">
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
        <apexchart type="bar" :options="chartOptions" :series="series"></apexchart>
        <p class="text-sm text-gray-500 mt-2">Última actualización: {{ lastUpdated }}</p>
      </div>

      <!-- Row 3: Completed Reservations (List) and Sales by Payment Method Chart -->
      <div class="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Reservas Completadas (7 Días)</h2>
        <div v-if="completedReservationsList.length > 0">
          <ul class="divide-y divide-gray-200">
            <li v-for="reservation in completedReservationsList" :key="reservation.id" class="py-2">
              <p class="text-gray-700">
                <span class="font-semibold">{{ reservation.client_name }}</span> con
                <span class="font-semibold">{{ reservation.barber_name }}</span> el
                {{ new Date(reservation.reservation_date).toLocaleDateString() }} a las
                {{ reservation.reservation_time }}
              </p>
            </li>
          </ul>
        </div>
        <div v-else class="text-gray-500">No hay reservas completadas en los últimos 7 días.</div>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Ventas por Método de Pago</h2>
          <select v-model="paymentMethodTimeRange" @change="fetchPaymentMethodData(paymentMethodTimeRange)"
            class="p-2 border rounded-md">
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
        <apexchart type="donut" :options="paymentMethodChartOptions" :series="paymentMethodSeries"></apexchart>
      </div>

      <!-- Last Row: Top Selling Services Chart -->
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Servicios Más Vendidos</h2>
          <select v-model="topServicesTimeRange" @change="fetchTopServicesData(topServicesTimeRange)"
            class="p-2 border rounded-md">
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
        <apexchart type="bar" :options="topServicesChartOptions" :series="topServicesSeries"></apexchart>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSalesStore } from '@/stores/salesStore';
import { useReservationStore } from '@/stores/reservationStore';
import { useReportStore } from '@/stores/reportStore'; // Importar el store de reportes
import { useProductStore } from '@/stores/productStore'; // Importar el store de productos
import VueApexCharts from 'vue3-apexcharts';

const salesStore = useSalesStore();
const router = useRouter();
const reservationStore = useReservationStore();
const reportStore = useReportStore(); // Instanciar el store
const productStore = useProductStore(); // Instanciar el store de productos

const barberPayments = ref([]); // Para guardar los datos del reporte de pagos

const salesToday = ref(0);
const totalBarberPayments = ref(0);
const totalReservations = ref(0);
const completedReservationsList = ref([]);
const dailySalesData = ref([]);
const barberRanking = ref([]);
const inventorySummary = ref({ totalProducts: 0, lowStockCount: 0, totalInventoryValue: 0 });
const lastUpdated = ref('');

// Time range selectors
const barberRankingTimeRange = ref('week');
const dailySalesTimeRange = ref('week');
const paymentMethodTimeRange = ref('week');
const topServicesTimeRange = ref('week');

// Helper function to get date ranges
function getDateRange(timeRange) {
  const today = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (timeRange === 'day') {
    // startDate is today
  } else if (timeRange === 'week') {
    startDate.setDate(today.getDate() - 6); // Last 7 days including today
  } else if (timeRange === 'month') {
    startDate.setMonth(today.getMonth() - 1); // Last 30 days approximately
    startDate.setDate(today.getDate() + 1); // Adjust to start of month
  }

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

const chartOptions = ref({});
const series = ref([]);
const topServicesChartOptions = ref({});
const topServicesSeries = ref([]);
const paymentMethodChartOptions = ref({});
const paymentMethodSeries = ref([]);

// Main data fetching function
async function fetchDashboardData() {
  console.log('Fetching dashboard data...');
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Fetch Total Sales Today
  const salesFilteredToday = await salesStore.getFilteredSales('day', today);
  salesToday.value = salesFilteredToday.reduce((sum, sale) => sum + sale.total_amount, 0);
  console.log('Sales Today:', salesToday.value);

  // Fetch Total Payments to Barbers
  totalBarberPayments.value = await salesStore.getTotalPaymentsToBarbers(sevenDaysAgo, today);
  console.log('Total Barber Payments:', totalBarberPayments.value);

  // Fetch Total Reservations
  totalReservations.value = await reservationStore.fetchReservationCount(sevenDaysAgo, today);
  console.log('Total Reservations:', totalReservations.value);

  // Fetch Completed Reservations
  completedReservationsList.value = await reservationStore.fetchCompletedReservations(sevenDaysAgo, today);
  console.log('Completed Reservations List:', completedReservationsList.value);

  // Fetch Inventory Summary
  try {
    inventorySummary.value = await productStore.fetchInventorySummary();
    console.log('Inventory Summary:', inventorySummary.value);
  } catch (error) {
    console.error('Error fetching inventory summary for dashboard:', error);
    // Handle error display if needed
  }

  // Fetch Low Stock Products (for count)
  await productStore.fetchLowStockProducts(); // This populates productStore.lowStockProducts
  console.log('Low Stock Products Count:', productStore.lowStockProducts.length);

  // Call individual data fetching functions with their respective time ranges
  await fetchBarberRankingData(barberRankingTimeRange.value);
  await fetchDailySalesData(dailySalesTimeRange.value);
  await fetchPaymentMethodData(paymentMethodTimeRange.value);
  await fetchTopServicesData(topServicesTimeRange.value);

  // Fetch Barber Payments Report Data
  const todayForReport = new Date();
  await reportStore.fetchReport(todayForReport.getFullYear(), todayForReport.getMonth() + 1);
  barberPayments.value = reportStore.stats;

  lastUpdated.value = new Date().toLocaleString();
}

// Individual data fetching functions
async function fetchBarberRankingData(timeRange) {
  const { startDate, endDate } = getDateRange(timeRange);
  barberRanking.value = await salesStore.getBarberSalesRanking(startDate, endDate);
  console.log('Barber Ranking:', barberRanking.value);
}

async function fetchDailySalesData(timeRange) {
  const { startDate, endDate } = getDateRange(timeRange);
  dailySalesData.value = await salesStore.getSalesSummaryByDateRange(startDate, endDate);
  console.log('Daily Sales Data:', dailySalesData.value);

  const labels = dailySalesData.value.map((data) => data.date);
  const data = dailySalesData.value.map((data) => data.total);

  series.value = [{
    name: 'Ventas Diarias',
    data: data,
  }];

  chartOptions.value = {
    chart: {
      type: 'bar',
      height: 300,
      width: '100%',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: labels,
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
    fill: {
      opacity: 0.8,
      colors: ['#4BC0C0'], // Match Chart.js color
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "S/ " + val.toFixed(2);
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: '75%',
            },
          },
        },
      },
    ],
  };
}

async function fetchPaymentMethodData(timeRange) {
  const { startDate, endDate } = getDateRange(timeRange);
  const salesByPaymentMethod = await salesStore.getSalesSummaryByPaymentMethod(startDate, endDate);
  console.log('Sales by Payment Method Data:', salesByPaymentMethod);

  paymentMethodSeries.value = salesByPaymentMethod.map(item => item.total_sales);
  paymentMethodChartOptions.value = {
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: salesByPaymentMethod.map(item => item.payment_method),
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    legend: {
      position: 'right',
      offsetY: 0,
      height: 230,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "S/ " + val.toFixed(2);
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return "S/ " + w.globals.seriesTotals.reduce((a, b) => {
                  return a + b
                }, 0).toFixed(2);
              }
            }
          }
        }
      }
    }
  };
}

async function fetchTopServicesData(timeRange) {
  const { startDate, endDate } = getDateRange(timeRange);
  const topServices = await salesStore.getSalesSummaryByService(startDate, endDate);
  console.log('Top Services Data:', topServices);

  topServicesSeries.value = [{
    name: 'Ventas por Servicio',
    data: topServices.map(service => service.total_sales),
  }];

  topServicesChartOptions.value = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true, // Make it a horizontal bar chart
        distributed: true, // Distribute colors
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return "S/ " + val.toFixed(2);
      },
    },
    xaxis: {
      categories: topServices.map(service => service.service_name),
      title: {
        text: 'Total de Ventas (S/)',
      },
    },
    yaxis: {
      title: {
        text: 'Servicio',
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "S/ " + val.toFixed(2);
        },
      },
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26A69A', '#D10363', '#F9A825', '#66BB6A'], // Example colors
  };
}

onMounted(fetchDashboardData);
</script>
