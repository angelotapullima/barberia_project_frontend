<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Dashboard y Reportes</h1>

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

    <div v-if="store.isLoading" class="text-center text-gray-500">Generando reporte...</div>
    <div v-if="store.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ store.error }}
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
import { useRouter } from 'vue-router'; // Import useRouter
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // Import timeGridPlugin
import { useReportStore } from '@/stores/reportStore';

const store = useReportStore();
const router = useRouter(); // Initialize useRouter

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
  plugins: [dayGridPlugin, timeGridPlugin], // Add timeGridPlugin
  initialView: 'timeGridWeek', // Change initial view to weekly
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay', // Add weekly and daily views
  },
  events: [], // This will be populated from the store
  locale: 'es',
  buttonText: {
    today: 'Hoy',
    week: 'Semana', // Add button text for week view
    day: 'Día', // Add button text for day view
  },
  dateClick: (info) => {
    // Handle date click for sales registration
    const selectedDate = info.dateStr.split('T')[0]; // Get only the date part
    const selectedTime = info.dateStr.split('T')[1] ? info.dateStr.split('T')[1].substring(0, 5) : '00:00'; // Get time, default to 00:00 if not available
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

watch([selectedMonth, selectedYear], generateReport);

onMounted(generateReport);
</script>
