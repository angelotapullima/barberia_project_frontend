<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold mb-6">Dashboard y Reportes</h1>

    <!-- Filters -->
    <div class="flex items-center space-x-4 mb-6 bg-white p-4 rounded-lg shadow">
      <div>
        <label for="month" class="block text-sm font-medium text-gray-700">Mes</label>
        <select
          v-model="selectedMonth"
          id="month"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="(name, index) in months" :key="index" :value="index + 1">
            {{ name }}
          </option>
        </select>
      </div>
      <div>
        <label for="year" class="block text-sm font-medium text-gray-700">Año</label>
        <select
          v-model="selectedYear"
          id="year"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div v-if="store.isLoading" class="text-center text-gray-500">Generando reporte...</div>
    <div v-if="store.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ store.error }}
    </div>

    <!-- Main Content -->
    <div v-if="!store.isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Calendar -->
      <div class="lg:col-span-2 bg-white p-4 rounded-lg shadow">
        <FullCalendar :options="calendarOptions" />
      </div>

      <!-- Stats Table -->
      <div class="lg:col-span-1 bg-white p-4 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-4">Reporte de Pagos</h2>
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
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useReportStore } from '@/stores/reportStore';

const store = useReportStore();

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

const calendarOptions = reactive({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth',
  },
  events: [], // This will be populated from the store
  locale: 'es',
  buttonText: {
    today: 'Hoy',
  },
});

function generateReport() {
  store.fetchReport(selectedYear.value, selectedMonth.value).then(() => {
    calendarOptions.events = store.events;
  });
}

watch([selectedMonth, selectedYear], generateReport);

onMounted(generateReport);
</script>
