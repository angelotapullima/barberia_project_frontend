<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Reportes Generales</h1>

    <!-- Main loading/error states -->
    <div v-if="store.isLoading" class="text-center text-gray-500">Generando reportes...</div>
    <div v-if="store.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ store.error }}
    </div>

    <!-- New Reports Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Station Usage Report -->
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Utilización de Estaciones</h2>
        <div class="overflow-x-auto">
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

      <!-- Customer Frequency Report -->
      <div class="bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Frecuencia de Clientes</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Nº de Visitas</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in store.customerFrequency" :key="item.customer_name">
                <td class="px-4 py-2">{{ item.customer_name }}</td>
                <td class="px-4 py-2 text-right">{{ item.visit_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Peak Hours Report -->
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Horas Pico de Reservas</h2>
        <apexchart type="bar" :options="peakHoursChartOptions" :series="peakHoursSeries"></apexchart>
      </div>
    </div>

    <!-- Divider -->
    <hr class="my-12 border-t-2 border-gray-200">

    <!-- Sales Reports Section -->
    <h2 class="text-3xl font-bold mb-8 text-gray-700">Reportes de Ventas</h2>

    <!-- Comprehensive Sales Report -->
    <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h3 class="text-2xl font-bold mb-4 text-gray-800">Reporte de Ventas Completo</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
        <!-- General Date Filters -->
        <div>
          <label for="startDateFilter" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Inicio</label>
          <input type="date" v-model="startDate" id="startDateFilter" class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div>
          <label for="endDateFilter" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Fin</label>
          <input type="date" v-model="endDate" id="endDateFilter" class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <!-- Specific Filters -->
        <div>
          <label for="barberFilter" class="block text-sm font-semibold text-gray-700 mb-1">Barbero</label>
          <select v-model="selectedBarberId" id="barberFilter" class="block w-full p-2 border border-gray-300 rounded-md">
            <option :value="null">Todos</option>
            <option v-for="barber in barberStore.barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
          </select>
        </div>
        <div>
          <label for="serviceFilter" class="block text-sm font-semibold text-gray-700 mb-1">Servicio</label>
          <select v-model="selectedServiceId" id="serviceFilter" class="block w-full p-2 border border-gray-300 rounded-md">
            <option :value="null">Todos</option>
            <option v-for="service in serviceStore.services" :key="service.id" :value="service.id">{{ service.name }}</option>
          </select>
        </div>
        <div>
          <label for="paymentMethodFilter" class="block text-sm font-semibold text-gray-700 mb-1">Método de Pago</label>
          <select v-model="selectedPaymentMethod" id="paymentMethodFilter" class="block w-full p-2 border border-gray-300 rounded-md">
            <option :value="null">Todos</option>
            <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="fetchAllReports" class="w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Generar Reportes
          </button>
        </div>
      </div>

      <!-- Comprehensive Sales Results -->
      <div v-if="store.comprehensiveSales.length > 0" class="mt-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
             <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Barbero</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Servicios</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Método Pago</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Monto Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="sale in store.comprehensiveSales" :key="sale.sale_id">
                <td class="px-4 py-2">{{ sale.sale_date }}</td>
                <td class="px-4 py-2">{{ sale.barber_name }}</td>
                <td class="px-4 py-2">{{ sale.customer_name }}</td>
                <td class="px-4 py-2">{{ sale.services_sold }}</td>
                <td class="px-4 py-2">{{ sale.payment_method }}</td>
                <td class="px-4 py-2 text-right">S/ {{ sale.total_amount.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="mt-6 text-gray-500">No se encontraron ventas con los filtros seleccionados.</div>
    </div>

    <!-- Services/Products Sales Report -->
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <h3 class="text-2xl font-bold mb-4 text-gray-800">Reporte de Ventas por Tipo (Servicio/Producto)</h3>
      <div v-if="store.servicesProductsSales.length > 0" class="mt-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Monto Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in store.servicesProductsSales" :key="item.type">
                <td class="px-4 py-2">{{ item.type === 'service' ? 'Servicios' : 'Productos' }}</td>
                <td class="px-4 py-2 text-right">S/ {{ item.total_sales_by_type.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="mt-6 text-gray-500">No se encontraron ventas por tipo para el rango de fechas seleccionado.</div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import { useBarberStore } from '@/stores/barberStore';
import { useServiceStore } from '@/stores/serviceStore';
import VueApexCharts from 'vue3-apexcharts';

const store = useReportStore();
const barberStore = useBarberStore();
const serviceStore = useServiceStore();

// General Filters
const startDate = ref('');
const endDate = ref('');

// Specific Filters for Comprehensive Report
const selectedBarberId = ref(null);
const selectedServiceId = ref(null);
const selectedPaymentMethod = ref(null);
const paymentMethods = ['cash', 'card', 'yape', 'plin'];

// Chart data
const peakHoursSeries = ref([]);
const peakHoursChartOptions = ref({});

function setDefaultDates() {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  startDate.value = thirtyDaysAgo.toISOString().slice(0, 10);
  endDate.value = today.toISOString().slice(0, 10);
}

async function fetchAllReports() {
  if (!startDate.value || !endDate.value) {
    alert('Por favor, selecciona un rango de fechas.');
    return;
  }

  // Fetch new reports
  await store.fetchNewReports(startDate.value, endDate.value);

  // Fetch comprehensive sales report
  const filters = {
    startDate: startDate.value,
    endDate: endDate.value,
    barberId: selectedBarberId.value,
    serviceId: selectedServiceId.value,
    paymentMethod: selectedPaymentMethod.value,
  };
  await store.fetchComprehensiveSales(filters);

  // Fetch services/products sales report
  await store.fetchServicesProductsSales(startDate.value, endDate.value);

  // Update peak hours chart
  updatePeakHoursChart();
}

function updatePeakHoursChart() {
  const peakHoursData = store.peakHours;
  peakHoursSeries.value = [{
    name: 'Cantidad de Reservas',
    data: peakHoursData.map(item => item.reservation_count)
  }];
  peakHoursChartOptions.value = {
    chart: { type: 'bar', height: 350 },
    plotOptions: { bar: { horizontal: false } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: peakHoursData.map(item => item.hour),
      title: { text: 'Hora del Día' }
    },
    yaxis: {
      title: { text: 'Nº de Reservas' }
    }
  };
}

onMounted(() => {
  setDefaultDates();
  // Fetch data for filters
  barberStore.fetchBarbers();
  serviceStore.fetchServices();
  // Fetch all reports on initial load
  fetchAllReports();
});
</script>
