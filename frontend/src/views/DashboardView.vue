<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Dashboard y Reportes</h1>

    <div v-if="salesStore.isLoading" class="text-center text-gray-500">Generando reporte...</div>
    <div v-if="salesStore.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ salesStore.error }}
    </div>

    <!-- Main Content -->
    <div v-if="!salesStore.isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Total Sales Today -->
      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Ventas Totales Hoy</h2>
        <p class="text-4xl font-extrabold text-indigo-600">S/ {{ salesToday.toFixed(2) }}</p>
      </div>

      <!-- Total Payments to Barbers -->
      <div class="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Pagos Totales a Barberos</h2>
        <p class="text-4xl font-extrabold text-green-600">
          S/ {{ totalBarberPayments.toFixed(2) }}
        </p>
      </div>

      <!-- Daily Sales Chart -->
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Ventas Diarias (Últimos 7 Días)</h2>
        <canvas id="dailySalesChart" style="height: 300px; width: 100%"></canvas>
        <p class="text-sm text-gray-500 mt-2">Última actualización: {{ lastUpdated }}</p>
      </div>

      <!-- Barber Ranking -->
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'; // Import nextTick
import { useRouter } from 'vue-router';
import { useSalesStore } from '@/stores/salesStore';
import Chart from 'chart.js/auto';

const salesStore = useSalesStore();
const router = useRouter();

const salesToday = ref(0);
const totalBarberPayments = ref(0);
const dailySalesData = ref([]);
const barberRanking = ref([]);
const lastUpdated = ref('');

let dailySalesChart = null;

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

  // Fetch Daily Sales Summary for Chart
  dailySalesData.value = await salesStore.getSalesSummaryByDateRange(sevenDaysAgo, today);
  console.log('Daily Sales Data:', dailySalesData.value);

  // Ensure canvas is rendered before trying to draw chart
  nextTick(() => {
    renderDailySalesChart();
  });

  // Fetch Barber Ranking
  barberRanking.value = await salesStore.getBarberSalesRanking(sevenDaysAgo, today);
  console.log('Barber Ranking:', barberRanking.value);

  lastUpdated.value = new Date().toLocaleString();
}

function renderDailySalesChart() {
  console.log('Attempting to render daily sales chart...');
  const ctx = document.getElementById('dailySalesChart');
  if (!ctx) {
    console.error('Canvas element not found for daily sales chart.');
    return;
  }
  console.log('Canvas context (ctx):', ctx);

  if (dailySalesChart) {
    dailySalesChart.destroy();
  }

  const labels = dailySalesData.value.map((data) => data.date);
  const data = dailySalesData.value.map((data) => data.total);

  console.log('Chart Labels:', labels);
  console.log('Chart Data:', data);

  dailySalesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Ventas Diarias',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  console.log('Chart rendered successfully.');
}

onMounted(fetchDashboardData);
</script>
