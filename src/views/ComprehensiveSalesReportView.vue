<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Reporte de Ventas Completo
    </h1>

    <div v-if="store.isLoading" class="text-center text-gray-500">
      Generando reporte...
    </div>
    <div
      v-if="store.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      {{ store.error }}
    </div>

    <div class="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h2 class="text-2xl font-bold mb-4 text-gray-800">
        Reporte de Ventas Completo
      </h2>
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4"
      >
        <!-- General Date Filters -->
        <div>
          <label
            for="startDateFilter"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Fecha Inicio</label
          >
          <input
            type="date"
            v-model="startDate"
            id="startDateFilter"
            class="block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label
            for="endDateFilter"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Fecha Fin</label
          >
          <input
            type="date"
            v-model="endDate"
            id="endDateFilter"
            class="block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <!-- Specific Filters -->
        <div>
          <label
            for="paymentMethodFilter"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Método de Pago</label
          >
          <select
            v-model="selectedPaymentMethod"
            id="paymentMethodFilter"
            class="block w-full p-2 border border-gray-300 rounded-md"
          >
            <option :value="null">Todos</option>
            <option
              v-for="method in paymentMethods"
              :key="method"
              :value="method"
            >
              {{ method }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="fetchComprehensiveSalesData"
            class="w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Generar Reporte
          </button>
        </div>
      </div>

      <!-- Comprehensive Sales Results -->
      <div v-if="store.comprehensiveSales.length > 0" class="mt-6">
        <!-- Botón de Exportar -->
        <div class="flex justify-end mb-4">
          <button
            @click="exportToCsv"
            class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Exportar a CSV
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Fecha
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Cliente
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Items Vendidos
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Método Pago
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase"
                >
                  Monto Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="sale in store.comprehensiveSales" :key="sale.sale_id">
                <td class="px-4 py-2">{{ sale.sale_date }}</td>
                <td class="px-4 py-2">{{ sale.customer_name }}</td>
                <td class="px-4 py-2">{{ sale.items_sold }}</td>
                <td class="px-4 py-2">{{ sale.payment_method }}</td>
                <td class="px-4 py-2 text-right">
                  S/ {{ sale.total_amount.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="mt-6 text-gray-500">
        No se encontraron ventas con los filtros seleccionados.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useReportStore } from '@/stores/reportStore';

const store = useReportStore();

// General Filters
const startDate = ref('');
const endDate = ref('');

// Specific Filters for Comprehensive Report
const selectedPaymentMethod = ref(null);
const paymentMethods = ['cash', 'card', 'yape', 'plin'];

function setDefaultDates() {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
  startDate.value = firstDayOfMonth.toISOString().slice(0, 10);
  endDate.value = today.toISOString().slice(0, 10);
}

async function fetchComprehensiveSalesData() {
  if (!startDate.value || !endDate.value) {
    alert('Por favor, selecciona un rango de fechas.');
    return;
  }

  const filters = {
    startDate: startDate.value,
    endDate: endDate.value,
    paymentMethod: selectedPaymentMethod.value,
  };
  await store.fetchComprehensiveSales(filters);
}

function exportToCsv() {
  if (store.comprehensiveSales.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const headers = [
    'Fecha',
    'Cliente',
    'Items Vendidos', // Changed from Servicios
    'Método Pago',
    'Monto Total',
  ];
  const rows = store.comprehensiveSales.map((sale) => [
    sale.sale_date,
    sale.customer_name,
    sale.items_sold, // Changed from services_sold
    sale.payment_method,
    sale.total_amount.toFixed(2),
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach((row) => {
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'reporte_ventas_completo.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(() => {
  setDefaultDates();
  // Fetch initial report data
  fetchComprehensiveSalesData();
});
</script>

<style scoped>
/* Add any specific styles for this component here */
</style>
