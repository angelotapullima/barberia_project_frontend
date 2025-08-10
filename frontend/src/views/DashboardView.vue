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
        <p class="text-4xl font-extrabold text-indigo-600">S/ {{ salesToday.toFixed(2) }}</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Pagos Totales a Barberos</h2>
        <p class="text-4xl font-extrabold text-green-600">
          S/ {{ totalBarberPayments.toFixed(2) }}
        </p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Total Reservas (7 Días)</h2>
        <p class="text-4xl font-extrabold text-blue-600">{{ totalReservations }}</p>
      </div>

      <!-- Row 2: Barber Ranking and Daily Sales Chart -->
      <div class="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Ranking de Barberos por Ventas</h2>
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
              <td class="px-4 py-2 text-right">S/ {{ barber.total_sales.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Ventas Diarias (Últimos 7 Días)</h2>
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
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Ventas por Método de Pago (Últimos 7 Días)</h2>
        <apexchart type="donut" :options="paymentMethodChartOptions" :series="paymentMethodSeries"></apexchart>
      </div>

      <!-- Last Row: Top Selling Services Chart -->
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Servicios Más Vendidos (Últimos 7 Días)</h2>
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
import VueApexCharts from 'vue3-apexcharts';

const salesStore = useSalesStore();
const router = useRouter();
const reservationStore = useReservationStore();

const salesToday = ref(0);
const totalBarberPayments = ref(0);
const totalReservations = ref(0);
const completedReservationsList = ref([]);
const dailySalesData = ref([]);
const barberRanking = ref([]);
const lastUpdated = ref('');

const chartOptions = ref({});
const series = ref([]);
const topServicesChartOptions = ref({});
const topServicesSeries = ref([]);
const paymentMethodChartOptions = ref({});
const paymentMethodSeries = ref([]);

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

  // Fetch Daily Sales Summary for Chart
  dailySalesData.value = await salesStore.getSalesSummaryByDateRange(sevenDaysAgo, today);
  console.log('Daily Sales Data:', dailySalesData.value);

  // Ensure canvas is rendered before trying to draw chart
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

  // Fetch Barber Ranking
  barberRanking.value = await salesStore.getBarberSalesRanking(sevenDaysAgo, today);
  console.log('Barber Ranking:', barberRanking.value);

  lastUpdated.value = new Date().toLocaleString();

  // Fetch Top Selling Services
  const topServices = await salesStore.getSalesSummaryByService(sevenDaysAgo, today);
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

  // Fetch Sales Summary by Payment Method
  const salesByPaymentMethod = await salesStore.getSalesSummaryByPaymentMethod(sevenDaysAgo, today);
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

onMounted(fetchDashboardData);
</script>
