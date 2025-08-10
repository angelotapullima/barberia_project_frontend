<template>
  <div class="sales-container">
    <h1 class="sales-title">Registrar Venta</h1>

    <div v-if="formError" class="error-message">
      {{ formError }}
    </div>
    <div v-if="salesStore.error" class="error-message">
      Error del servidor: {{ salesStore.error }}
    </div>

    <form @submit.prevent="handleSubmit" class="sales-form">
      <!-- Date -->
      <div class="form-group">
        <label for="sale_date" class="form-label"
          >Fecha de Venta</label
        >
        <input
          v-model="sale.sale_date"
          type="date"
          id="sale_date"
          class="form-input"
          required
        />
      </div>

      <!-- Barber -->
      <div class="form-group">
        <label for="barber" class="form-label">Barbero</label>
        <select
          v-model="sale.barber_id"
          id="barber"
          class="form-input"
          required
        >
          <option disabled value="">Seleccione un barbero</option>
          <option v-for="barber in barberStore.barbers" :key="barber.id" :value="barber.id">
            {{ barber.name }}
          </option>
        </select>
      </div>

      <!-- Station -->
      <div class="form-group">
        <label for="station" class="form-label">Estación</label>
        <select
          v-model="sale.station_id"
          id="station"
          class="form-input"
          required
        >
          <option disabled value="">Seleccione una estación</option>
          <option v-for="station in stationStore.stations" :key="station.id" :value="station.id">
            {{ station.name }}
          </option>
        </select>
      </div>

      <!-- Services -->
      <div class="form-group">
        <label class="form-label">Servicios</label>
        <div class="services-checkbox-group">
          <div v-for="service in serviceStore.services" :key="service.id" class="checkbox-item">
            <input
              type="checkbox"
              :id="`service-${service.id}`"
              :value="service"
              v-model="sale.services"
              class="checkbox-input"
            />
            <label :for="`service-${service.id}`" class="checkbox-label"
              >{{ service.name }} - S/ {{ service.price.toFixed(2) }}</label
            >
          </div>
        </div>
      </div>

      <!-- Customer Name -->
      <div class="form-group">
        <label for="customer_name" class="form-label"
          >Nombre del Cliente (Opcional)</label
        >
        <input
          v-model="sale.customer_name"
          type="text"
          id="customer_name"
          class="form-input"
        />
      </div>

      <!-- Total Amount -->
      <div class="total-amount">Total: S/ {{ totalAmount.toFixed(2) }}</div>

      <!-- Submit -->
      <div class="form-actions">
        <button
          type="submit"
          :disabled="salesStore.isLoading"
          class="btn btn-success"
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

<style scoped>
.sales-container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  max-width: 42rem; /* max-w-2xl */
  padding: 1rem;
}

.sales-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #b91c1c;
  background-color: #fee2e2;
  border-radius: 0.5rem;
}

.sales-form {
  background-color: #fff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  margin-top: 0.25rem;
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.services-checkbox-group {
  margin-top: 0.5rem;
  max-height: 12rem; /* max-h-48 */
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.checkbox-input {
  height: 1rem;
  width: 1rem;
  color: #4f46e5;
  border-color: #d1d5db;
  border-radius: 0.25rem;
}

.checkbox-label {
  margin-left: 0.75rem;
  display: block;
  font-size: 0.875rem;
  color: #374151;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: right;
  margin-bottom: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1.5rem;
  font-weight: 700;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

.btn-success {
  background-color: #22c55e;
  color: #fff;
}

.btn-success:hover {
  background-color: #16a34a;
}

.btn-success:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>