<template>
  <div class="container mx-auto p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Lista de Ventas</h1>

    <div class="bg-white shadow-lg rounded-xl p-8 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label for="filterType" class="block text-sm font-semibold text-gray-700 mb-1">Filtrar por</label>
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

        <div v-if="filterType === 'day' || filterType === 'week' || filterType === 'month'">
          <label for="filterValueDate" class="block text-sm font-semibold text-gray-700 mb-1">Fecha</label>
          <input
            v-model="filterValue"
            type="date"
            id="filterValueDate"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          />
        </div>

        <div v-if="filterType === 'barber'">
          <label for="filterValueBarber" class="block text-sm font-semibold text-gray-700 mb-1">Barbero</label>
          <select
            v-model="filterValue"
            id="filterValueBarber"
            class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          >
            <option disabled value="">Seleccione un barbero</option>
            <option v-for="barber in barberStore.barbers" :key="barber.id" :value="barber.id">
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

    <div v-if="salesStore.isLoading" class="text-center text-gray-600 text-lg">Cargando ventas...</div>
    <div v-else-if="salesStore.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      Error: {{ salesStore.error }}
    </div>
    <div v-else-if="salesStore.sales.length === 0" class="text-center text-gray-600 text-lg">No hay ventas para mostrar.</div>
    <div v-else class="bg-white shadow-lg rounded-xl overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barbero</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estación</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Servicios</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="sale in salesStore.sales" :key="sale.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ new Date(sale.sale_date).toLocaleDateString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sale.barber_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sale.station_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sale.customer_name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <ul class="list-disc list-inside">
                <li v-for="service in sale.services" :key="service.id">
                  {{ service.service_id }} (S/{{ service.price_at_sale.toFixed(2) }})
                </li>
              </ul>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">S/{{ sale.total_amount.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useSalesStore } from '@/stores/salesStore';
import { useBarberStore } from '@/stores/barberStore';

const salesStore = useSalesStore();
const barberStore = useBarberStore();

const filterType = ref('');
const filterValue = ref('');

async function applyFilter() {
  if (filterType.value && filterValue.value) {
    await salesStore.getFilteredSales(filterType.value, filterValue.value);
  } else {
    await salesStore.getAllSales(); // If no filter selected, show all sales
  }
}

onMounted(() => {
  salesStore.getAllSales();
  barberStore.fetchBarbers(); // Fetch barbers for the filter dropdown
});
</script>
