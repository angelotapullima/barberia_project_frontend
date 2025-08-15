<template>
  <div class="inventory-report-view p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Reporte de Inventario</h1>

    <div v-if="isLoading" class="text-center text-gray-600">
      Cargando reporte...
    </div>
    <div v-if="error" class="text-center text-red-500">
      {{ error }}
    </div>

    <div
      v-if="inventorySummary"
      class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <p class="text-gray-500 text-sm">Total de Productos</p>
        <p class="text-3xl font-bold text-blue-600">
          {{ inventorySummary.totalProducts }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <p class="text-gray-500 text-sm">Productos con Bajo Stock</p>
        <p class="text-3xl font-bold text-red-600">
          {{ inventorySummary.lowStockCount }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <p class="text-gray-500 text-sm">Valor Total del Inventario</p>
        <p class="text-3xl font-bold text-green-600">
          S/. {{ (inventorySummary.totalInventoryValue || 0).toFixed(2) }}
        </p>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-gray-800 mb-4">
      Productos con Bajo Stock
    </h2>
    <div
      v-if="lowStockProducts.length === 0"
      class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 shadow-md"
      role="alert"
    >
      <p>¡Excelente! No hay productos con bajo stock en este momento.</p>
    </div>
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden mb-8">
      <!-- Botón de Exportar -->
      <div class="flex justify-end p-4">
        <button
          @click="exportLowStockToCsv"
          class="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Exportar Bajo Stock a CSV
        </button>
      </div>

      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Nombre
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Precio
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Stock Actual
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Stock Mínimo
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in lowStockProducts"
            :key="product.id"
            class="hover:bg-gray-50"
          >
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ product.name }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              S/. {{ (product.price || 0).toFixed(2) }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ product.stock_quantity }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ product.min_stock_level }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="text-2xl font-bold text-gray-800 mb-4">
      Historial de Movimientos de Inventario
    </h2>
    <div v-if="inventoryMovements.length === 0" class="text-center text-gray-500 mb-8">
      No hay movimientos de inventario para mostrar.
    </div>
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Producto
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Tipo de Movimiento
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Cantidad
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Fecha
            </th>
            <th
              class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >
              Referencia
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movement in inventoryMovements" :key="movement.id" class="hover:bg-gray-50">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ getProductName(movement.product_id) }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ movement.movement_type === 'in' ? 'Entrada' : 'Salida' }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ movement.quantity }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ formatDate(movement.created_at) }}
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              {{ movement.reference_type || 'N/A' }} (ID: {{ movement.reference_id || 'N/A' }})
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api'; // Import the centralized Axios instance
import dayjs from 'dayjs';

const inventorySummary = ref(null);
const lowStockProducts = ref([]);
const inventoryMovements = ref([]);
const products = ref([]); // To store all products for name lookup

const isLoading = ref(false);
const error = ref(null);

const fetchInventoryData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const [summaryResponse, lowStockResponse, movementsResponse, productsResponse] = await Promise.all([
      api.get('/inventory/summary'), // Use 'api' and relative path
      api.get('/products?lowStock=true'), // Use 'api' and relative path
      api.get('/inventory/movements'), // Use 'api' and relative path
      api.get('/products'), // Use 'api' and relative path
    ]);

    inventorySummary.value = summaryResponse.data;
    lowStockProducts.value = lowStockResponse.data;
    inventoryMovements.value = movementsResponse.data;
    products.value = productsResponse.data;

  } catch (err) {
    error.value = err.message || 'Error al cargar el reporte de inventario.';
    console.error('Error fetching inventory data:', err);
  } finally {
    isLoading.value = false;
  }
};

function exportLowStockToCsv() {
  if (lowStockProducts.value.length === 0) {
    alert('No hay productos con bajo stock para exportar.');
    return;
  }

  const headers = ['Nombre', 'Precio', 'Stock Actual', 'Stock Mínimo'];
  const rows = lowStockProducts.value.map((product) => [
    product.name,
    (product.price || 0).toFixed(2),
    product.stock_quantity,
    product.min_stock_level,
  ]);

  let csvContent = headers.join(',') + '\n';
  rows.forEach((row) => {
    csvContent += row.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'reporte_inventario_bajo_stock.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const getProductName = (productId) => {
  const product = products.value.find(p => p.id === productId);
  return product ? product.name : 'Desconocido';
};

const formatDate = (dateString) => {
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

onMounted(() => {
  fetchInventoryData();
});
</script>