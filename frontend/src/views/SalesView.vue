<template>
  <div class="container mx-auto max-w-2xl p-6">
    <h1 class="text-4xl font-extrabold mb-8 text-gray-800">Registrar Venta</h1>

    <div v-if="formError" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ formError }}
    </div>
    <div v-if="salesStore.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      Error del servidor: {{ salesStore.error }}
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white shadow-lg rounded-xl p-8">
      <!-- Date -->
      <div class="mb-4">
        <label for="sale_date" class="block text-sm font-semibold text-gray-700 mb-1"
          >Fecha de Venta</label
        >
        <input
          v-model="sale.sale_date"
          type="date"
          id="sale_date"
          class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          required
        />
      </div>

      <!-- Barber -->
      <div class="mb-4">
        <label for="barber" class="block text-sm font-semibold text-gray-700 mb-1">Barbero</label>
        <select
          v-model="sale.barber_id"
          id="barber"
          class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          required
        >
          <option disabled value="">Seleccione un barbero</option>
          <option v-for="barber in barberStore.barbers" :key="barber.id" :value="barber.id">
            {{ barber.name }}
          </option>
        </select>
      </div>

      <!-- Station -->
      <div class="mb-4">
        <label for="station" class="block text-sm font-semibold text-gray-700 mb-1">Estación</label>
        <select
          v-model="sale.station_id"
          id="station"
          class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
          required
        >
          <option disabled value="">Seleccione una estación</option>
          <option v-for="station in stationStore.stations" :key="station.id" :value="station.id">
            {{ station.name }}
          </option>
        </select>
      </div>

      <!-- Services -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Servicios</label>
        <div class="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
          <div v-for="service in serviceStore.services" :key="service.id" class="flex items-center py-1">
            <input
              type="checkbox"
              :id="`service-${service.id}`"
              :value="service"
              v-model="sale.services"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label :for="`service-${service.id}`" class="ml-3 block text-sm text-gray-700"
              >{{ service.name }} - S/ {{ service.price.toFixed(2) }}</label
            >
          </div>
        </div>
      </div>

      <!-- Customer Name -->
      <div class="mb-6">
        <label for="customer_name" class="block text-sm font-semibold text-gray-700 mb-1"
          >Nombre del Cliente (Opcional)</label
        >
        <input
          v-model="sale.customer_name"
          type="text"
          id="customer_name"
          class="block w-full px-4 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
        />
      </div>

      <!-- Total Amount -->
      <div class="text-3xl font-extrabold text-right mb-8 text-gray-800">Total: S/ {{ totalAmount.toFixed(2) }}</div>

      <!-- Submit -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="salesStore.isLoading"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-400 transition duration-150 ease-in-out"
        >
          <span v-if="salesStore.isLoading">Registrando...</span>
          <span v-else>Registrar Venta</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute
import { useBarberStore } from '@/stores/barberStore';
import { useStationStore } from '@/stores/stationStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useSalesStore } from '@/stores/salesStore';

const route = useRoute(); // Initialize useRoute
const barberStore = useBarberStore();
const stationStore = useStationStore();
const serviceStore = useServiceStore();
const salesStore = useSalesStore();

const formError = ref(null);

const sale = ref({
  sale_date: new Date().toISOString().slice(0, 10),
  barber_id: '',
  station_id: '',
  services: [],
  customer_name: '',
});

const totalAmount = computed(() => {
  return sale.value.services.reduce((total, service) => total + service.price, 0);
});

async function handleSubmit() {
  formError.value = null;
  if (sale.value.services.length === 0) {
    formError.value = 'Debe seleccionar al menos un servicio.';
    return;
  }

  const saleData = {
    ...sale.value,
    total_amount: totalAmount.value,
  };

  try {
    await salesStore.addSale(saleData);
    // Reset form
    sale.value = {
      sale_date: new Date().toISOString().slice(0, 10),
      barber_id: '',
      station_id: '',
      services: [],
      customer_name: '',
    };
    alert('¡Venta registrada con éxito!');
  } catch (error) {
    // Error is handled in the store
  }
}

onMounted(() => {
  barberStore.fetchBarbers();
  stationStore.fetchStations();
  serviceStore.fetchServices();

  // Check for query parameters for pre-filling date
  if (route.query.date) {
    sale.value.sale_date = route.query.date;
  }
});
</script>
