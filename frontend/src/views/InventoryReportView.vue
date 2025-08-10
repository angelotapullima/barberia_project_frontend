<template>
  <div class="inventory-report-view p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Reporte de Inventario</h1>

    <div v-if="productStore.loading" class="text-center text-gray-600">Cargando reporte...</div>
    <div v-if="productStore.error" class="text-center text-red-500">{{ productStore.error }}</div>

    <div v-if="inventorySummary" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <p class="text-gray-500 text-sm">Total de Productos</p>
        <p class="text-3xl font-bold text-blue-600">{{ inventorySummary.totalProducts }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <p class="text-gray-500 text-sm">Productos con Bajo Stock</p>
        <p class="text-3xl font-bold text-red-600">{{ inventorySummary.lowStockCount }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <p class="text-gray-500 text-sm">Valor Total del Inventario</p>
        <p class="text-3xl font-bold text-green-600">S/. {{ (inventorySummary.totalInventoryValue || 0).toFixed(2) }}</p>
      </div>
    </div>

    <h2 class="text-2xl font-bold text-gray-800 mb-4">Productos con Bajo Stock</h2>
    <div v-if="productStore.lowStockProducts.length === 0" class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 shadow-md" role="alert">
      <p>¡Excelente! No hay productos con bajo stock en este momento.</p>
    </div>
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Precio</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Actual</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock Mínimo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productStore.lowStockProducts" :key="product.id" class="hover:bg-gray-50">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">{{ product.name }}</td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">S/. {{ (product.price || 0).toFixed(2) }}</td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">{{ product.stock_quantity }}</td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">{{ product.min_stock_level }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import axios from 'axios';

const productStore = useProductStore();
const inventorySummary = ref(null);

const fetchInventorySummary = async () => {
  productStore.loading = true;
  productStore.error = null;
  try {
    const response = await axios.get('/api/services/products/report/summary');
    inventorySummary.value = response.data;
  } catch (error) {
    productStore.error = 'Error al cargar el resumen del inventario.';
    console.error('Error fetching inventory summary:', error);
  } finally {
    productStore.loading = false;
  }
};

onMounted(() => {
  fetchInventorySummary();
  productStore.fetchLowStockProducts();
});
</script>

<style scoped>
/* Estilos específicos para este componente */
</style>
