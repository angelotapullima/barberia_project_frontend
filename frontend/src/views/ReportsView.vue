<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Reportes de Ventas</h1>

    <!-- Filters -->
    <div class="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-wrap items-end gap-6">
      <div>
        <label for="month" class="block text-sm font-semibold text-gray-700 mb-1">Mes</label>
        <select
          v-model="selectedMonth"
          id="month"
          class="block w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
        >
          <option v-for="(name, index) in months" :key="index" :value="index + 1">
            {{ name }}
          </option>
        </select>
      </div>
      <div>
        <label for="year" class="block text-sm font-semibold text-gray-700 mb-1">Año</label>
        <select
          v-model="selectedYear"
          id="year"
          class="block w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
        >
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <!-- Comprehensive Sales Report Filters -->
    <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Reporte de Ventas Completo</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label for="barberFilter" class="block text-sm font-semibold text-gray-700 mb-1">Barbero</label>
          <select v-model="selectedBarberId" id="barberFilter"
            class="block w-full p-2 border border-gray-300 rounded-md">
            <option :value="null">Todos</option>
            <option v-for="barber in barberStore.barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
          </select>
        </div>
        <div>
          <label for="serviceFilter" class="block text-sm font-semibold text-gray-700 mb-1">Servicio</label>
          <select v-model="selectedServiceId" id="serviceFilter"
            class="block w-full p-2 border border-gray-300 rounded-md">
            <option :value="null">Todos</option>
            <option v-for="service in serviceStore.services" :key="service.id" :value="service.id">{{ service.name }}</option>
          </select>
        </div>
        <div>
          <label for="paymentMethodFilter" class="block text-sm font-semibold text-gray-700 mb-1">Método de Pago</label>
          <select v-model="selectedPaymentMethod" id="paymentMethodFilter"
            class="block w-full p-2 border border-gray-300 rounded-md">
            <option :value="null">Todos</option>
            <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
          </select>
        </div>
        <div>
          <label for="startDateFilter" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Inicio</label>
          <input type="date" v-model="startDateFilter" id="startDateFilter"
            class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div>
          <label for="endDateFilter" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Fin</label>
          <input type="date" v-model="endDateFilter" id="endDateFilter"
            class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div class="flex items-end">
          <button @click="generateComprehensiveReport"
            class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Generar Reporte
          </button>
        </div>
      </div>

      <!-- Comprehensive Sales Report Results -->
      <div v-if="store.comprehensiveSales.length > 0" class="mt-6">
        <h3 class="text-xl font-semibold mb-3">Resultados de Ventas</h3>
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
      <div v-else-if="!store.isLoading" class="mt-6 text-gray-500">No se encontraron ventas con los filtros seleccionados.</div>
    </div>

    <div v-if="store.isLoading" class="text-center text-gray-500">Generando reporte...</div>
    <div v-if="store.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ store.error }}
    </div>

    <!-- Services/Products Sales Report -->
    <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">Reporte de Ventas por Tipo de Servicio/Producto</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="spStartDate" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Inicio</label>
          <input type="date" v-model="spStartDate" id="spStartDate"
            class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div>
          <label for="spEndDate" class="block text-sm font-semibold text-gray-700 mb-1">Fecha Fin</label>
          <input type="date" v-model="spEndDate" id="spEndDate"
            class="block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div class="flex items-end">
          <button @click="generateServicesProductsReport"
            class="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Generar Reporte
          </button>
        </div>
      </div>

      <div v-if="store.servicesProductsSales.length > 0" class="mt-6">
        <h3 class="text-xl font-semibold mb-3">Resultados por Tipo</h3>
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
      <div v-else-if="!store.isLoading" class="mt-6 text-gray-500">No se encontraron ventas por tipo de servicio/producto con los filtros seleccionados.</div>
    </div>

    <!-- Main Content -->
    <div v-if="!store.isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Calendar -->
      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
        <FullCalendar :options="calendarOptions" />
      </div>

      <!-- Stats Table -->
      <div class="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Reporte de Pagos</h2>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Barbero
              </th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Generado
              </th>
              <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pago</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="stat in store.stats" :key="stat.barber_id">
              <td class="px-4 py-2">{{ stat.barber_name }}</td>
              <td class="px-4 py-2 text-right">S/ {{ stat.total_generated.toFixed(2) }}</td>
              <td class="px-4 py-2 text-right font-bold">S/ {{ stat.payment.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useReportStore } from '@/stores/reportStore';
import { useBarberStore } from '@/stores/barberStore';
import { useServiceStore } from '@/stores/serviceStore';

const store = useReportStore();
const router = useRouter();
const barberStore = useBarberStore();
const serviceStore = useServiceStore();

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];
const years = [new Date().getFullYear(), new Date().getFullYear() - 1];

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

// Comprehensive Sales Report Filters
const selectedBarberId = ref(null);
const selectedServiceId = ref(null);
const selectedPaymentMethod = ref(null);
const startDateFilter = ref('');
const endDateFilter = ref('');

// Payment methods for dropdown
const paymentMethods = ['cash', 'card', 'yape', 'plin'];

// Services/Products Sales Report Filters
const spStartDate = ref('');
const spEndDate = ref('');

const calendarOptions = reactive({
  plugins: [dayGridPlugin, timeGridPlugin],
  initialView: 'timeGridWeek',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  events: [],
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    week: 'Semana',
    day: 'Día',
  },
  dateClick: (info) => {
    const selectedDate = info.dateStr.split('T')[0];
    const selectedTime = info.dateStr.split('T')[1] ? info.dateStr.split('T')[1].substring(0, 5) : '00:00';
    router.push({
      name: 'SalesRegistration',
      query: { date: selectedDate, time: selectedTime },
    });
  },
});

function generateReport() {
  store.fetchReport(selectedYear.value, selectedMonth.value).then(() => {
    calendarOptions.events = store.events;
  });
}

// Function to generate comprehensive sales report
async function generateComprehensiveReport() {
  const filters = {};
  if (selectedBarberId.value) filters.barberId = selectedBarberId.value;
  if (selectedServiceId.value) filters.serviceId = selectedServiceId.value;
  if (selectedPaymentMethod.value) filters.paymentMethod = selectedPaymentMethod.value;
  if (startDateFilter.value) filters.startDate = startDateFilter.value;
  if (endDateFilter.value) filters.endDate = endDateFilter.value;

  await store.fetchComprehensiveSales(filters);
}

// Function to generate services/products sales report
async function generateServicesProductsReport() {
  if (!spStartDate.value || !spEndDate.value) {
    // Set default date range if not selected, e.g., last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    spStartDate.value = thirtyDaysAgo.toISOString().slice(0, 10);
    spEndDate.value = today.toISOString().slice(0, 10);
  }
  await store.fetchServicesProductsSales(spStartDate.value, spEndDate.value);
}

watch([selectedMonth, selectedYear], generateReport);

onMounted(() => {
  generateReport();
  barberStore.fetchBarbers();
  serviceStore.fetchServices();
  generateComprehensiveReport(); // Initial load for comprehensive sales
  generateServicesProductsReport(); // Initial load for services/products sales
});
</script>
