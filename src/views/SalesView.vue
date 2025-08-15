<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
      Gestión de Ventas
    </h1>

    <div class="flex justify-end mb-6">
      <button @click="isNewSaleModalOpen = true" class="btn-primary">
        Registrar Nueva Venta
      </button>
    </div>

    <!-- Sale Registration Modal -->
    <!-- Direct sales are not linked to a reservation -->
    <SaleRegistrationModal
      :show="isNewSaleModalOpen"
      @close="isNewSaleModalOpen = false"
      @saleProcessed="handleSaleProcessed"
      :reservation="null"
    />

    <!-- Sales List and Filtering -->
    <div class="bg-white shadow-lg rounded-xl p-8 mb-8">
      <h2 class="text-2xl font-bold mb-4">Lista de Ventas</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label
            for="filterType"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Filtrar por</label
          >
          <select
            v-model="filterType"
            id="filterType"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          >
            <option value="">Todas las ventas</option>
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
            <option value="barber">Barbero</option>
          </select>
        </div>

        <div
          v-if="
            filterType === 'day' ||
            filterType === 'week' ||
            filterType === 'month'
          "
        >
          <label
            for="filterValueDate"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Fecha</label
          >
          <input
            v-model="filterValue"
            type="date"
            id="filterValueDate"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          />
        </div>

        <div v-if="filterType === 'barber'">
          <label
            for="filterValueBarber"
            class="block text-sm font-semibold text-gray-700 mb-1"
            >Barbero</label
          >
          <select
            v-model="filterValue"
            id="filterValueBarber"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          >
            <option disabled value="">Seleccione un barbero</option>
            <!-- Barbers will be fetched from sales.barber_name -->
            <option
              v-for="barber in salesStore.sales.map(s => ({ id: s.barber_id, name: s.barber_name })).filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)"
              :key="barber.id"
              :value="barber.id"
            >
              {{ barber.name }}
            </option>
          </select>
        </div>

        <div>
          <button
            @click="applyFilter"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 transition duration-150 ease-in-out"
            :disabled="salesStore.isLoading"
          >
            Aplicar Filtro
          </button>
        </div>
      </div>
    </div>

    <div v-if="salesStore.isLoading" class="text-center text-gray-600 text-lg">
      Cargando ventas...
    </div>
    <div
      v-else-if="salesStore.error"
      class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
    >
      Error: {{ salesStore.error }}
    </div>
    <div
      v-else-if="salesStore.sales.length === 0"
      class="text-center text-gray-600 text-lg"
    >
      No hay ventas para mostrar.
    </div>
    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Fecha
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Barbero
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Cliente
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Monto Servicios
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Monto Productos
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Método Pago
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Detalles
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="sale in salesStore.sales" :key="sale.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ new Date(sale.sale_date).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ sale.barber_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ sale.customer_name || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              S/{{ sale.service_amount.toFixed(2) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              S/{{ sale.products_amount.toFixed(2) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              S/{{ sale.total_amount.toFixed(2) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ sale.payment_method }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <button @click="openSaleDetails(sale.id)" class="text-blue-600 hover:text-blue-900">
                Ver
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div
        class="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-t"
      >
        <!-- Items per page selector -->
        <div class="mb-2 sm:mb-0 relative inline-flex items-center">
          <label for="itemsPerPage" class="text-gray-700 mr-2">Mostrar:</label>
          <select
            id="itemsPerPage"
            v-model.number="itemsPerPage"
            class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-1 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="option in itemsPerPageOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
          />
        </div>

        <!-- Page navigation buttons -->
        <div class="flex items-center space-x-2">
          <button
            @click="prevPage"
            :disabled="salesStore.currentPage === 1 || totalPages === 0"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition duration-150 ease-in-out"
          >
            Anterior
          </button>
          <span class="text-gray-700 font-medium">
            <template v-if="totalPages > 0">
              Página {{ salesStore.currentPage }} de {{ totalPages }}
            </template>
            <template v-else> No hay ventas </template>
          </span>
          <button
            @click="nextPage"
            :disabled="
              salesStore.currentPage === totalPages || totalPages === 0
            "
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition duration-150 ease-in-out"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import SaleRegistrationModal from '../components/SaleRegistrationModal.vue';
import SaleDetailsModal from '../components/SaleDetailsModal.vue';
import { useSalesStore } from '../stores/salesStore';

const isNewSaleModalOpen = ref(false);
const isSaleDetailsModalOpen = ref(false);
const selectedSaleId = ref(null);

const salesStore = useSalesStore();

const filterType = ref('');
const filterValue = ref('');

// Pagination state
const itemsPerPage = ref(10);
const itemsPerPageOptions = [10, 30, 50];

const totalPages = computed(() => {
  if (salesStore.totalSales > 0 && itemsPerPage.value > 0) {
    return Math.ceil(salesStore.totalSales / itemsPerPage.value);
  }
  return 0;
});

const handleSaleProcessed = () => {
  isNewSaleModalOpen.value = false;
  salesStore.currentPage = 1;
  applyFilter();
  alert('¡Venta registrada con éxito!');
};

const openSaleDetails = (saleId) => {
  selectedSaleId.value = saleId;
  isSaleDetailsModalOpen.value = true;
};

async function applyFilter() {
  // The filtering logic will be implemented in the backend later if needed.
  // For now, just fetch all sales with pagination.
  await salesStore.getAllSales(salesStore.currentPage, itemsPerPage.value);
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    salesStore.currentPage = page;
    applyFilter();
  }
}

function nextPage() {
  if (salesStore.currentPage < totalPages.value) {
    salesStore.currentPage++;
    applyFilter();
  }
}

function prevPage() {
  if (salesStore.currentPage > 1) {
    salesStore.currentPage--;
    applyFilter();
  }
}

watch(itemsPerPage, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    salesStore.currentPage = 1;
    applyFilter();
  }
});

onMounted(() => {
  applyFilter();
});
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}
</style>