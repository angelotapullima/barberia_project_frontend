<template>
  <div class="container mx-auto max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Registrar Venta</h1>

    <div v-if="formError" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ formError }}
    </div>
    <div v-if="salesStore.error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      Error del servidor: {{ salesStore.error }}
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white shadow-md rounded-lg p-8">
      <!-- Date -->
      <div class="mb-4">
        <label for="sale_date" class="block text-sm font-medium text-gray-700"
          >Fecha de Venta</label
        >
        <input
          v-model="sale.sale_date"
          type="date"
          id="sale_date"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          required
        />
      </div>

      <!-- Barber -->
      <div class="mb-4">
        <label for="barber" class="block text-sm font-medium text-gray-700">Barbero</label>
        <select
          v-model="sale.barber_id"
          id="barber"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
        <label for="station" class="block text-sm font-medium text-gray-700">Estación</label>
        <select
          v-model="sale.station_id"
          id="station"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
        <label class="block text-sm font-medium text-gray-700">Servicios</label>
        <div class="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
          <div v-for="service in serviceStore.services" :key="service.id" class="flex items-center">
            <input
              type="checkbox"
              :id="`service-${service.id}`"
              :value="service"
              v-model="sale.services"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label :for="`service-${service.id}`" class="ml-3 block text-sm text-gray-700"
              >{{ service.name }} - S/ {{ service.price.toFixed(2) }}</label
            >
          </div>
        </div>
      </div>

      <!-- Customer Name -->
      <div class="mb-6">
        <label for="customer_name" class="block text-sm font-medium text-gray-700"
          >Nombre del Cliente (Opcional)</label
        >
        <input
          v-model="sale.customer_name"
          type="text"
          id="customer_name"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <!-- Total Amount -->
      <div class="text-2xl font-bold text-right mb-6">Total: S/ {{ totalAmount.toFixed(2) }}</div>

      <!-- Submit -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="salesStore.isLoading"
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400"
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
import { useBarberStore } from '@/stores/barberStore';
import { useStationStore } from '@/stores/stationStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useSalesStore } from '@/stores/salesStore';

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
});
</script>
