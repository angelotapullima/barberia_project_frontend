<template>
  <div class="container mx-auto p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Reporte de Pago a Barberos</h1>

    <!-- Filter Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label for="barberFilter" class="block text-sm font-medium text-gray-700">Filtrar por Barbero:</label>
        <select
          id="barberFilter"
          v-model="selectedBarberId"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Todos los Barberos</option>
          <option v-for="barber in barbers" :key="barber.id" :value="barber.id">{{ barber.name }}</option>
        </select>
      </div>

      <div>
        <label for="dateFilterType" class="block text-sm font-medium text-gray-700">Tipo de Filtro por Fecha:</label>
        <select
          id="dateFilterType"
          v-model="dateFilterType"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="month">Mensual</option>
          <option value="week">Semanal</option>
          <option value="day">Diario</option>
          <option value="custom">Rango Personalizado</option>
        </select>
      </div>

      <div v-if="dateFilterType === 'custom'">
        <label for="startDate" class="block text-sm font-medium text-gray-700">Fecha Inicio:</label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
          class="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        />
      </div>
      <div v-if="dateFilterType === 'custom'">
        <label for="endDate" class="block text-sm font-medium text-gray-700">Fecha Fin:</label>
        <input
          type="date"
          id="endDate"
          v-model="endDate"
          class="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        />
      </div>
    </div>

    <button
      @click="fetchReport"
      class="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Generar Reporte
    </button>

    <!-- Report Table -->
    <div v-if="isLoading" class="text-center text-gray-500">Cargando reporte...</div>
    <div v-else-if="error" class="text-center text-red-500">Error: {{ error }}</div>
    <div v-else-if="reportData.length === 0" class="text-center text-gray-500">No hay datos para mostrar en el rango seleccionado.</div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbero</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicio</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio (S/)</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in reportData" :key="index">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.barber_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.service_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(item.sale_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{{ item.service_price.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useReportStore } from '@/stores/reportStore';
import { useBarberStore } from '@/stores/barberStore'; // Assuming you have a barber store
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekday from 'dayjs/plugin/weekday'; // For startOf('week')
import advancedFormat from 'dayjs/plugin/advancedFormat'; // For more formatting options if needed
import customParseFormat from 'dayjs/plugin/customParseFormat'; // For parsing custom formats if needed

dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const reportStore = useReportStore();
const barberStore = useBarberStore(); // Initialize barber store

const reportData = ref([]);
const barbers = ref([]); // To store list of barbers for filter
const selectedBarberId = ref('');
const dateFilterType = ref('month'); // 'month', 'week', 'day', 'custom'
const startDate = ref('');
const endDate = ref('');
const isLoading = ref(false);
const error = ref(null);

// Helper to format date for display
const formatDate = (dateString) => {
  return dayjs(dateString).format('DD/MM/YYYY');
};

// Function to calculate start and end dates based on filter type
const getDatesForFilter = () => {
  const today = dayjs();
  let start, end;

  switch (dateFilterType.value) {
    case 'month':
      start = today.startOf('month').format('YYYY-MM-DD');
      end = today.endOf('day').format('YYYY-MM-DD'); // Up to current day
      break;
    case 'week':
      // dayjs().startOf('week') depends on locale, weekday plugin makes it consistent
      start = today.startOf('week').format('YYYY-MM-DD');
      end = today.endOf('day').format('YYYY-MM-DD'); // Up to current day
      break;
    case 'day':
      start = today.format('YYYY-MM-DD');
      end = today.format('YYYY-MM-DD');
      break;
    case 'custom':
      start = startDate.value;
      end = endDate.value;
      break;
    default:
      start = '';
      end = '';
  }
  return { start, end };
};

const fetchReport = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { start, end } = getDatesForFilter();
    const filters = {
      barberId: selectedBarberId.value || undefined,
      startDate: start || undefined,
      endDate: end || undefined,
    };
    reportData.value = await reportStore.getDetailedBarberServiceSales(filters);
  } catch (err) {
    error.value = err.message || 'Error al cargar el reporte.';
    console.error('Error fetching detailed barber service sales:', err);
  } finally {
    isLoading.value = false;
  }
};

// Fetch barbers on component mount
onMounted(async () => {
  try {
    barbers.value = await barberStore.getAllBarbers(); // Assuming this action exists
    // Set initial date filters and fetch report
    const { start, end } = getDatesForFilter();
    startDate.value = start;
    endDate.value = end;
    fetchReport();
  } catch (err) {
    console.error('Error fetching barbers:', err);
    error.value = 'Error al cargar la lista de barberos.';
  }
});

// Watch for changes in filter type to update dates
watch(dateFilterType, (newType) => {
  if (newType !== 'custom') {
    const { start, end } = getDatesForFilter();
    startDate.value = start;
    endDate.value = end;
  }
});

// Automatically fetch report when filters change (except custom date inputs)
watch([selectedBarberId, startDate, endDate, dateFilterType], () => {
  if (dateFilterType.value !== 'custom' || (startDate.value && endDate.value)) {
    fetchReport();
  }
});
</script>

<style scoped>
/* Add any specific styles here if needed */
</style>