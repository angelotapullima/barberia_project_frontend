<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"
  >
    <div class="bg-white p-8 rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-800">
          Confirmar Pago a Barbero
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-3xl leading-none"
        >
          &times;
        </button>
      </div>

      <div v-if="barber && commission">
        <p class="text-lg mb-2">
          Barbero: <span class="font-semibold">{{ barber.name }}</span>
        </p>
        <p class="text-lg mb-2">
          Período:
          <span class="font-semibold"
            >{{ formatDate(commission.period_start) }} -
            {{ formatDate(commission.period_end) }}</span
          >
        </p>
        <p class="text-lg mb-2">
          Sueldo Base:
          <span class="font-semibold"
            >S/ {{ commission.base_salary.toFixed(2) }}</span
          >
        </p>
        <p class="text-lg mb-2">
          Total Servicios Generados:
          <span class="font-semibold"
            >S/ {{ commission.services_total.toFixed(2) }}</span
          >
        </p>
        <p class="text-lg mb-4">
          Monto a Pagar:
          <span class="font-semibold text-green-600"
            >S/ {{ commission.total_payment.toFixed(2) }}</span
          >
        </p>

        <!-- Detalles de Servicios -->
        <h4 class="text-xl font-semibold mb-3">Servicios Realizados</h4>
        <div v-if="servicesLoading" class="text-gray-500">
          Cargando servicios...
        </div>
        <div v-else-if="servicesError" class="text-red-500">
          Error al cargar servicios: {{ servicesError }}
        </div>
        <div
          v-else-if="detailedServices && detailedServices.length"
          class="overflow-x-auto mb-6"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Servicio
                </th>
                <th
                  class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto (S/)
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="service in detailedServices" :key="service.sale_id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDate(service.sale_date) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ service.service_name }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right"
                >
                  {{ service.service_amount.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 mb-6">
          No hay servicios detallados para este período.
        </p>

        <!-- Detalles de Adelantos -->
        <h4 class="text-xl font-semibold mb-3">Adelantos Tomados</h4>
        <div v-if="advancesLoading" class="text-gray-500">
          Cargando adelantos...
        </div>
        <div v-else-if="advancesError" class="text-red-500">
          Error al cargar adelantos: {{ advancesError }}
        </div>
        <div
          v-else-if="detailedAdvances && detailedAdvances.length"
          class="overflow-x-auto mb-6"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto (S/)
                </th>
                <th
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Notas
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="advance in detailedAdvances" :key="advance.id">
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDate(advance.date) }}
                </td>
                <td
                  class="px-4 py-2 whitespace-nowrap text-sm text-gray-700 text-right"
                >
                  {{ advance.amount.toFixed(2) }}
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                  {{ advance.notes || '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-gray-500 mb-6">
          No hay adelantos detallados para este período.
        </p>

        <div class="flex justify-end space-x-4">
          <button
            @click="$emit('close')"
            class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="confirmPayment"
            class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Confirmar Pago
          </button>
          <button
            @click="printDetails"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Imprimir
          </button>
        </div>
      </div>
      <div v-else>
        <p class="text-red-500">
          Error: Datos de barbero o comisión no disponibles.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/services/api';

const props = defineProps({
  show: Boolean,
  barber: Object, // { id, name }
  commission: Object, // { id, total_payment, period_start, period_end, barber_id }
  selectedYear: Number,
  selectedMonth: Number,
});

const emit = defineEmits(['close', 'paymentFinalized']);

const servicesLoading = ref(false);
const servicesError = ref(null);
const detailedServices = ref([]);

const advancesLoading = ref(false);
const advancesError = ref(null);
const detailedAdvances = ref([]);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const fetchDetails = async () => {
  if (
    !props.barber ||
    !props.commission ||
    !props.selectedYear ||
    !props.selectedMonth
  )
    return;

  // Fetch detailed services
  servicesLoading.value = true;
  servicesError.value = null;
  try {
    const response = await api.get(
      `/barber-commissions/${props.barber.id}/services`,
      {
        params: {
          year: props.selectedYear,
          month: props.selectedMonth + 1, // Months are 0-indexed in JS, 1-indexed in backend
        },
      },
    );
    detailedServices.value = response.data;
  } catch (err) {
    servicesError.value = err.message || 'Error al cargar los servicios.';
    console.error('Error fetching detailed services:', err);
  } finally {
    servicesLoading.value = false;
  }

  // Fetch detailed advances
  advancesLoading.value = true;
  advancesError.value = null;
  try {
    const response = await api.get(
      `/barber-commissions/${props.barber.id}/advances`,
      {
        params: {
          year: props.selectedYear,
          month: props.selectedMonth + 1,
        },
      },
    );
    detailedAdvances.value = response.data;
  } catch (err) {
    advancesError.value = err.message || 'Error al cargar los adelantos.';
    console.error('Error fetching detailed advances:', err);
  } finally {
    advancesLoading.value = false;
  }
};

const confirmPayment = async () => {
  if (
    !confirm(
      '¿Estás seguro de que deseas finalizar este pago? Esta acción no se puede deshacer.',
    )
  ) {
    return;
  }
  try {
    await api.put(`/barber-commissions/${props.commission.id}/finalize`);
    alert('Pago finalizado exitosamente.');
    emit('paymentFinalized');
    emit('close');
  } catch (err) {
    console.error('Error al finalizar el pago:', err);
    alert('Error al finalizar el pago.');
  }
};

const printDetails = () => {
  alert('Funcionalidad de impresión no implementada aún.');
  // TODO: Implement actual printing logic
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchDetails();
    }
  },
);
</script>
